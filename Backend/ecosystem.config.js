module.exports = {
  apps: [
    {
      name: "pg-backend-5001",
      script: "./src/server.js",
      env: {
        NODE_ENV: "production",
        PORT: 5001
      }
    },
    {
      name: "pg-backend-5002",
      script: "./src/server.js",
      env: {
        NODE_ENV: "production",
        PORT: 5002
      }
    },
    {
      name: "pg-backend-5003",
      script: "./src/server.js",
      env: {
        NODE_ENV: "production",
        PORT: 5003
      }
    }
  ]
};
