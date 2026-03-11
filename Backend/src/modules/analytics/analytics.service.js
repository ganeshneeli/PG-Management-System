const Room = require("../../models/room.model");
const Tenant = require("../../models/tenant.model");
const Bill = require("../../models/bill.model");
const VisitorLog = require("../../models/visitorLog.model");
const Complaint = require("../../models/complaint.model");
const STATUS = require("../../constants/status");

const redis = require("../../config/redis");

class AnalyticsService {
    async getDashboardStats() {
        // 1. Try to get from Redis Cache first
        try {
            const cachedData = await redis.get("dashboard_stats");
            if (cachedData) {
                console.log("[Redis] Analytics Cache Hit 🚀");
                return { ...cachedData, source: "cache" };
            }
        } catch (err) {
            console.error("[Redis] Cache Read Error:", err.message);
        }

        console.log("[Redis] Analytics Cache Miss - Fetching from DB ⚡");
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const months = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            months.push({ 
                month: d.toLocaleString('default', { month: 'long' }), 
                shortName: d.toLocaleString('default', { month: 'short' }),
                year: d.getFullYear()
            });
        }

        // ALL DB QUERIES IN PARALLEL 🚀
        const [
            totalRooms,
            occupiedRooms,
            vacantRooms,
            totalTenants,
            totalComplaints,
            pendingComplaints,
            totalVisitorRequests,
            pendingVisitorRequests,
            billingStats,
            trendData,
            recentVisitors,
            recentComplaints
        ] = await Promise.all([
            Room.countDocuments(),
            Room.countDocuments({ status: STATUS.ROOM.OCCUPIED }),
            Room.countDocuments({ status: STATUS.ROOM.VACANT }),
            Tenant.countDocuments({ status: "active" }),
            Complaint.countDocuments(),
            Complaint.countDocuments({ status: { $ne: "resolved" } }),
            VisitorLog.countDocuments({ checkInTime: { $gte: today } }),
            VisitorLog.countDocuments({ status: "pending" }),
            
            // 1. Revenue summary (All-in-one aggregation)
            Bill.aggregate([
                {
                    $group: {
                        _id: null,
                        totalRevenue: { $sum: "$amount" },
                        collectedRevenue: {
                            $sum: { $cond: [{ $eq: ["$status", STATUS.BILL.PAID] }, "$amount", 0] }
                        },
                        pendingRevenue: {
                            $sum: { $cond: [{ $eq: ["$status", STATUS.BILL.PENDING] }, "$amount", 0] }
                        },
                        pendingPayments: {
                            $sum: { $cond: [{ $eq: ["$status", STATUS.BILL.PENDING] }, 1, 0] }
                        }
                    }
                }
            ]),

            // 2. 6-Month Trend Data
            Bill.aggregate([
                {
                    $match: {
                        status: STATUS.BILL.PAID,
                        $or: months.map(m => ({ month: m.month, year: m.year }))
                    }
                },
                {
                    $group: {
                        _id: { month: "$month", year: "$year" },
                        revenue: { $sum: "$amount" }
                    }
                }
            ]),

            // 3. Recent 5 Visitors
            VisitorLog.find().populate("tenantId").sort({ checkInTime: -1 }).limit(5),

            // 4. Recent 5 Complaints
            Complaint.find({ status: { $ne: "resolved" } }).populate("tenantId").sort({ createdAt: -1 }).limit(5)
        ]);

        const stats = billingStats[0] || { totalRevenue: 0, collectedRevenue: 0, pendingRevenue: 0, pendingPayments: 0 };

        const revenueChart = months.map(m => {
            const match = trendData.find(d => d._id.month === m.month && d._id.year === m.year);
            return { month: m.shortName, revenue: match ? match.revenue : 0 };
        });

        const result = {
            totalRooms,
            occupiedRooms,
            vacantRooms,
            totalTenants,
            pendingPayments: stats.pendingPayments,
            monthlyRevenue: stats.collectedRevenue,
            totalRevenue: stats.totalRevenue,
            collectedRevenue: stats.collectedRevenue,
            pendingRevenue: stats.pendingRevenue,
            totalComplaints,
            pendingComplaints,
            totalVisitorRequests,
            pendingVisitorRequests,
            recentVisitors,
            recentComplaints,
            revenueChart,
            occupancyChart: [
                { name: "Occupied", value: occupiedRooms },
                { name: "Vacant", value: vacantRooms }
            ],
            source: "database"
        };

        // 2. Save to Redis Cache (Expiries in 60 seconds)
        try {
            await redis.set("dashboard_stats", result, { ex: 60 });
            console.log("[Redis] Analytics Cache Updated ✅");
        } catch (err) {
            console.error("[Redis] Cache Set Error:", err.message);
        }

        return result;
    }
}

module.exports = new AnalyticsService();
