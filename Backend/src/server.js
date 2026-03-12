const http = require("http");
const app = require("./app");
const connectDB = require("./config/database");
const socketServer = require("./sockets/socket.server");
const cronService = require("./cron/billing.cron");
const env = require("./config/env");

const cluster = require("cluster");
const os = require("os");

const numCPUs = os.cpus().length;
const workersCount = Math.min(numCPUs, 4); // Use up to 4 workers to balance performance and DB connections

if (cluster.isMaster) {
    console.log(`Master process ${process.pid} is running`);

    // Fork workers
    for (let i = 0; i < workersCount; i++) {
        const worker = cluster.fork();
        
        // Relay messages between workers for Socket.io sync
        worker.on("message", (msg) => {
            if (msg.type === "SOCKET_EVENT") {
                console.log(`[Master] Relaying ${msg.payload.method} from Worker ${worker.id}`);
                // Broadcast to all other workers
                for (const id in cluster.workers) {
                    if (id !== worker.id.toString()) {
                        cluster.workers[id].send(msg);
                    }
                }
            }
        });
    }

    cluster.on("exit", (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died. Spawning a new one...`);
        cluster.fork();
    });
} else {
    // Worker Process logic
    process.on("message", (msg) => {
        if (msg.type === "SOCKET_EVENT") {
            socketServer.handleIPCMessage(msg);
        }
    });

    const startServer = async () => {
        // 1. Connect to DB (Non-blocking to allow server startup)
        connectDB();

        // 2. Wrap express app in node http server
        const server = http.createServer(app);

        // 3. Initialize Sockets
        socketServer.init(server);

        // 4. Initialize Cron Jobs & Admin Seeding
        // Only start cron jobs and seeding on one specific worker to avoid duplicate tasks
        if (cluster.worker.id === 1) {
            cronService.startCronJobs();
            
            // Initialize Background Job Worker
            const { initWorker } = require("./queues/billing.queue");
            initWorker();
            
            // Seed default admin if DB is completely empty (For Production auto-setup)
            setTimeout(async () => {
                try {
                    const User = require("./models/user.model");
                    const adminCount = await User.countDocuments({ role: "admin" });
                    if (adminCount === 0) {
                        console.log("⚠️ No admin user found in database. Seeding default admin...");
                        await User.create({
                            name: "Admin User",
                            email: "admin@modernpg.com",
                            phone: "9999999999",
                            password: "admin123", // In actual production this should be hashed, but matches current repo logic
                            role: "admin"
                        });
                        console.log("✅ Default admin created: admin@modernpg.com / admin123");
                    }
                } catch (err) {
                    console.error("Failed to seed default admin:", err.message);
                }
            }, 5000); // Wait 5 seconds to ensure DB connection is stable
        }

        // 5. Start listening
        server.listen(env.PORT, () => {
            const fs = require("fs");
            fs.appendFileSync("debug.log", `[${new Date().toISOString()}] SERVER BOOTED (Worker ${process.pid}) on port ${env.PORT}\n`);
            console.log(`Modular Server worker ${process.pid} listening on port ${env.PORT}`);
        });
    };

    startServer();
}
