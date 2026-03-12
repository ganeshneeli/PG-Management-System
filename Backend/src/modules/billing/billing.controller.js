const billingService = require("./billing.service");
const pdfService = require("../../services/pdf.service");
const path = require("path");
const redis = require("../../config/redis");

class BillingController {
    async getAllBills(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 50;
            
            const result = await billingService.getAllBills(page, limit);
            res.status(200).json({ 
                success: true, 
                count: result.data.length,
                total: result.total,
                page: result.page,
                totalPages: result.totalPages,
                data: result.data 
            });
        } catch (error) {
            next(error);
        }
    }

    async generateBill(req, res, next) {
        try {
            const bill = await billingService.generateBill(req.body);
            require("../../sockets/socket.server").emitSyncEvent("sync_bills");
            await redis.del("dashboard_stats");
            res.status(201).json({ success: true, data: bill });
        } catch (error) {
            next(error);
        }
    }

    async updatePayment(req, res, next) {
        try {
            const bill = await billingService.updatePayment(req.params.id, req.body);
            const socketServer = require("../../sockets/socket.server");
            
            // 1. Sync all bill lists
            socketServer.emitSyncEvent("sync_bills");
            socketServer.emitSyncEvent("sync_rooms");   // NEW: Room status depends on bills
            socketServer.emitSyncEvent("sync_tenants"); // NEW: Tenant dashboard depends on bills

            // 2. If marked as PAID, send an instant notification to THE SPECIFIC TENANT
            if (req.body.status === "paid" && bill.tenantId && bill.tenantId.userId) {
                socketServer.sendNotificationToUser(bill.tenantId.userId, {
                    title: "Payment Received! ✅",
                    message: `Your rent for ${bill.month} ${bill.year} has been marked as PAID. Thank you!`,
                    type: "bill"
                });
            }

            await redis.del("dashboard_stats");
            res.status(200).json({ success: true, data: bill });
        } catch (error) {
            next(error);
        }
    }

    async generateMonthlyBills(req, res, next) {
        try {
            const results = await billingService.generateMonthlyBills(req.body);
            require("../../sockets/socket.server").emitSyncEvent("sync_bills");
            await redis.del("dashboard_stats");
            res.status(201).json({ success: true, message: `Generated ${results.length} bills`, data: results });
        } catch (error) {
            next(error);
        }
    }

    async resendBillReminder(req, res, next) {
        try {
            const bill = await billingService.getBillById(req.params.id);
            const tenant = await require("../tenant/tenant.repository").findById(bill.tenantId);
            if (tenant && tenant.phone) {
                const message = `Reminder: Dear ${tenant.name}, your bill for ${bill.month} is pending. Total: ₹${bill.amount}. Please pay by ${new Date(bill.dueDate).toLocaleDateString()}.`;
                await require("../../services/whatsapp.service").sendReminder(tenant.phone, message);
            }
            res.status(200).json({ success: true, message: "Reminder sent successfully" });
        } catch (error) {
            next(error);
        }
    }

    async getMyBills(req, res, next) {
        try {
            const tenant = await require("../tenant/tenant.repository").findByUserId(req.user.id);
            if (!tenant) return res.status(404).json({ success: false, message: "Tenant record not found" });
            const bills = await require("./billing.repository").findByTenantId(tenant._id);
            res.status(200).json({ success: true, data: bills });
        } catch (error) {
            next(error);
        }
    }

    async remindRoomUnpaid(req, res, next) {
        try {
            const { roomId, month } = req.body;
            const sentTo = await billingService.remindRoomUnpaid(roomId, month);
            res.status(200).json({ success: true, message: `Reminders sent to ${sentTo.length} tenants` });
        } catch (error) {
            next(error);
        }
    }

    async remindAllUnpaid(req, res, next) {
        try {
            const sentTo = await billingService.remindAllUnpaid();
            res.status(200).json({ success: true, message: `Reminders sent to ${sentTo.length} tenants with pending bills` });
        } catch (error) {
            next(error);
        }
    }

    async cleanupDuplicates(req, res, next) {
        try {
            const Bill = require("../../models/bill.model");
            // Find all bills grouped by tenantId + month + year
            const duplicates = await Bill.aggregate([
                {
                    $group: {
                        _id: { tenantId: "$tenantId", month: "$month", year: "$year" },
                        ids: { $push: "$_id" },
                        count: { $sum: 1 }
                    }
                },
                { $match: { count: { $gt: 1 } } }
            ]);

            let removed = 0;
            for (const dup of duplicates) {
                // Keep the first, delete the rest
                const idsToDelete = dup.ids.slice(1);
                await Bill.deleteMany({ _id: { $in: idsToDelete } });
                removed += idsToDelete.length;
            }

            require("../../sockets/socket.server").emitSyncEvent("sync_bills");
            await redis.del("dashboard_stats");
            res.status(200).json({
                success: true,
                message: `Removed ${removed} duplicate bills from ${duplicates.length} groups`,
                removed
            });
        } catch (error) {
            next(error);
        }
    }

    async cleanupOrphanedBills(req, res, next) {
        try {
            const Bill = require("../../models/bill.model");
            const Tenant = require("../../models/tenant.model");
            
            // Get IDs of all existing tenants
            const activeTenantIds = await Tenant.distinct("_id");
            
            // Delete bills where tenantId is not in the active tenant list
            const result = await Bill.deleteMany({
                tenantId: { $nin: activeTenantIds }
            });

            require("../../sockets/socket.server").emitSyncEvent("sync_bills");
            await redis.del("dashboard_stats");
            res.status(200).json({
                success: true,
                message: `Removed ${result.deletedCount} orphaned bills (deleted tenants)`,
                removed: result.deletedCount
            });
        } catch (error) {
            next(error);
        }
    }

    async downloadBill(req, res, next) {
        const fs = require("fs");
        const log = (msg) => {
            const time = new Date().toISOString();
            fs.appendFileSync("debug.log", `[${time}] ${msg}\n`);
            console.log(msg);
        };
        try {
            log(`[DownloadBill] Request for bill: ${req.params.id} by User: ${req.user.id}`);
            const bill = await billingService.getBillById(req.params.id);
            if (!bill) {
                log("[DownloadBill] ERROR: Bill not found");
                return res.status(404).json({ success: false, message: "Bill not found" });
            }

            // Ensure tenant can only download their own bill
            if (req.user.role === "tenant") {
                const tenant = await require("../tenant/tenant.repository").findByUserId(req.user.id);
                if (!tenant) {
                    log(`[DownloadBill] ERROR: No tenant record found for user ${req.user.id}`);
                    return res.status(403).json({ success: false, message: "Unauthorized: No tenant record found" });
                }

                const billTenantId = bill.tenantId._id ? bill.tenantId._id.toString() : bill.tenantId.toString();
                const loginTenantId = tenant._id.toString();

                log(`[DownloadBill] Comparing BillOwner: ${billTenantId} with CurrentUser: ${loginTenantId}`);

                if (billTenantId !== loginTenantId) {
                    log("[DownloadBill] ERROR: Bill ownership mismatch");
                    return res.status(403).json({ success: false, message: "Unauthorized access to this bill" });
                }
            }

            log("[DownloadBill] Generating PDF...");
            const filePath = await pdfService.generateBillPDF(bill);

            if (!fs.existsSync(filePath)) {
                log(`[DownloadBill] ERROR: Generated file not found on disk at ${filePath}`);
                return res.status(500).json({ success: false, message: "Failed to generate PDF file" });
            }

            log(`[DownloadBill] Sending file: ${filePath}`);
            res.download(filePath);
        } catch (error) {
            log(`[DownloadBill] CATCH ERROR: ${error.message}\n${error.stack}`);
            next(error);
        }
    }
}

module.exports = new BillingController();
