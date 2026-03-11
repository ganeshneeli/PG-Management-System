const cron = require("node-cron");
const billingService = require("../modules/billing/billing.service");

exports.startCronJobs = () => {
    console.log("🚀 Billing Cron Jobs Initialized");

    // 1. Monthly Bill Generation (Runs at midnight on the 1st of every month)
    cron.schedule("0 0 1 * *", async () => {
        console.log("[Cron] Triggering monthly bill generation...");
        try {
            await billingService.generateMonthlyBills();
        } catch (err) {
            console.error("[Cron] Monthly billing failed:", err.message);
        }
    });

    // 2. Auto-Reminders (Runs every day at 09:00 AM)
    // Checks for bills due in exactly 5 days
    cron.schedule("0 9 * * *", async () => {
        console.log("[Cron] Checking for bills due in 5 days...");
        try {
            await billingService.remindUpcomingBills(5);
        } catch (err) {
            console.error("[Cron] Auto-reminder failed:", err.message);
        }
    });

    // Optional: Trigger a check on startup during development to verify it works
    if (process.env.NODE_ENV === "development") {
        console.log("[Cron] Dev Mode: Running immediate check for bills due in 5 days...");
        billingService.remindUpcomingBills(5);
    }
};
