const billingRepository = require("./billing.repository");
const tenantRepository = require("../tenant/tenant.repository");
const pdfService = require("../../services/pdf.service");
const whatsappService = require("../../services/whatsapp.service");
const STATUS = require("../../constants/status");
const Bill = require("../../models/bill.model");
const Tenant = require("../../models/tenant.model");
const Room = require("../../models/room.model");

class BillingService {
    async getAllBills(page, limit) {
        return await billingRepository.findAll(page, limit);
    }

    async getBillById(id) {
        return await billingRepository.findById(id);
    }

    async generateBill(billData) {
        const bill = await billingRepository.create(billData);
        
        // Background Job Processing: PDF + Notification via BullMQ
        const { billingQueue } = require("../../queues/billing.queue");
        
        billingQueue.add('process-bill', {
            type: 'GENERATE_PDF',
            data: { billId: bill._id }
        }, { 
            attempts: 3, 
            backoff: { type: 'exponential', delay: 1000 } 
        });

        billingQueue.add('process-bill', {
            type: 'SEND_WHATSAPP',
            data: { tenantId: billData.tenantId, billData }
        }, { 
            attempts: 3, 
            backoff: { type: 'exponential', delay: 5000 } 
        });

        return bill;
    }

    async generateMonthlyBills() {
        const now = new Date();
        const currentMonth = now.toLocaleString("default", { month: "long" });
        const currentYear = now.getFullYear();
        const dueDate = new Date(currentYear, now.getMonth(), 5); // 5th of current month

        console.log(`[BillingCycle] Starting for ${currentMonth} ${currentYear}...`);

        // Fetch active tenants with their room populated
        const activeTenants = await Tenant.find({ status: "active" }).populate("roomId");
        console.log(`[BillingCycle] Found ${activeTenants.length} active tenants.`);

        const results = [];
        const skipped = [];
        const errors = [];

        for (const tenant of activeTenants) {
            try {
                // ── Duplicate guard: direct DB check ─────────────────────────
                const existingBill = await Bill.findOne({
                    tenantId: tenant._id,
                    month: currentMonth,
                    year: currentYear
                });

                if (existingBill) {
                    skipped.push(tenant.name);
                    console.log(`[BillingCycle] SKIP: ${tenant.name} already has a bill for ${currentMonth}.`);
                    continue;
                }

                // ── Get rent from the room ────────────────────────────────────
                const room = tenant.roomId;
                if (!room) {
                    console.warn(`[BillingCycle] WARN: No room assigned to ${tenant.name}. Skipping.`);
                    continue;
                }

                // PRIORITIZE rentPerBed. 
                // FALLBACK to rentAmount directly (user uses rentAmount field for per-bed price in UI).
                const billAmount = room.rentPerBed > 0 ? room.rentPerBed : room.rentAmount;

                if (!billAmount || billAmount <= 0) {
                    console.warn(`[BillingCycle] WARN: Rent is 0 for ${tenant.name} in Room ${room.roomNumber}.`);
                }

                const billData = {
                    tenantId: tenant._id,
                    roomId: room._id,
                    amount: billAmount,
                    month: currentMonth,
                    year: currentYear,
                    electricity: 0,
                    extraCharges: 0,
                    status: STATUS.BILL.PENDING,
                    dueDate
                };

                const bill = await this.generateBill(billData);
                results.push(bill);
                console.log(`[BillingCycle] SUCCESS: Created ₹${billAmount} bill for ${tenant.name} (Room ${room.roomNumber})`);

            } catch (err) {
                if (err.code === 11000) {
                    skipped.push(tenant.name);
                    console.log(`[BillingCycle] SKIP (Duplicate Index): ${tenant.name}`);
                } else {
                    errors.push({ tenant: tenant.name, error: err.message });
                    console.error(`[BillingCycle] ERROR for ${tenant.name}:`, err.message);
                }
            }
        }

        console.log(`[BillingCycle] Completed. Success: ${results.length}, Skipped: ${skipped.length}, Errors: ${errors.length}`);
        return results;
    }

    async remindAllUnpaid() {
        const now = new Date();
        const currentMonth = now.toLocaleString("default", { month: "long" });
        const currentYear = now.getFullYear();

        const unpaidBills = await Bill.find({
            status: STATUS.BILL.PENDING,
            month: currentMonth,
            year: currentYear
        }).populate("tenantId");

        const notificationService = require("../notification/notification.service");
        const results = [];
        
        const reminderPromises = unpaidBills.map(async (bill) => {
            try {
                const tenant = bill.tenantId;
                if (tenant) {
                    const dueDate = new Date(bill.dueDate);
                    const isOverdue = now > dueDate;
                    const urgencyText = isOverdue ? "OVERDUE" : "Due Soon";
                    
                    const message = `Reminder: Your rent for ${bill.month} ${bill.year} (₹${bill.amount}) is ${urgencyText}. Please pay immediately to avoid late fees.`;
                    
                    const tasks = [];
                    
                    // 1. WhatsApp Reminder
                    if (tenant.phone) {
                        tasks.push(whatsappService.sendReminder(tenant.phone, message).catch(err => {
                            console.error(`[Billing] WhatsApp reminder failed for bill ${bill._id}:`, err.message);
                        }));
                    }
                    
                    // 2. In-App Notification
                    if (tenant.userId) {
                        tasks.push(notificationService.createNotification({
                            userId: tenant.userId,
                            title: isOverdue ? "🚨 Rent Overdue" : "📝 Rent Reminder",
                            message: message,
                            type: "bill"
                        }).catch(err => {
                            console.error(`[Billing] App notification failed for tenant ${tenant.name}:`, err.message);
                        }));
                    }
                    
                    await Promise.all(tasks);
                    results.push(bill._id);
                }
            } catch (err) {
                console.error(`[Billing] Reminder processing failed for bill ${bill._id}:`, err.message);
            }
        });

        await Promise.all(reminderPromises);
        return results;
    }

    async updatePayment(id, paymentData) {
        // If marking as paid, set paidDate automatically
        if (paymentData.status === STATUS.BILL.PAID && !paymentData.paidDate) {
            paymentData.paidDate = new Date();
        } else if (paymentData.status === STATUS.BILL.PENDING) {
            // Nullify paidDate if marked as unpaid/pending
            paymentData.paidDate = null;
        }
        return await billingRepository.update(id, paymentData);
    }

    async remindRoomUnpaid(roomId, month) {
        const bills = await billingRepository.findByRoomId(roomId, month);
        const unpaidBills = bills.filter(b => b.status !== STATUS.BILL.PAID);
        const notificationService = require("../notification/notification.service");

        const results = [];
        const notificationPromises = unpaidBills.map(async (bill) => {
            if (bill.tenantId) {
                const message = `Reminder: Your rent for ${bill.month} ${bill.year} ₹${bill.amount} is still pending.`;
                
                const tasks = [];
                // 1. WhatsApp Reminder
                if (bill.tenantId.phone) {
                    tasks.push(whatsappService.sendReminder(bill.tenantId.phone, message).catch(err => {
                        console.error(`[Billing] WhatsApp reminder failed for tenant ${bill.tenantId.name}:`, err.message);
                    }));
                }

                // 2. In-App Notification
                if (bill.tenantId.userId) {
                    tasks.push(notificationService.createNotification({
                        userId: bill.tenantId.userId,
                        title: "Rent Pending",
                        message: message,
                        type: "bill"
                    }).catch(err => {
                        console.error(`[Billing] App notification failed for tenant ${bill.tenantId.name}:`, err.message);
                    }));
                }

                await Promise.all(tasks);
                results.push(bill._id);
            }
        });

        await Promise.all(notificationPromises);
        return results;
    }

    async remindUpcomingBills(daysBefore = 5) {
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + daysBefore);
        targetDate.setHours(0, 0, 0, 0);

        const nextDay = new Date(targetDate);
        nextDay.setDate(nextDay.getDate() + 1);

        console.log(`[AutoReminder] Checking for bills due on ${targetDate.toLocaleDateString()}...`);

        // Find bills due on targetDate (ignoring time)
        const upcomingBills = await Bill.find({
            status: STATUS.BILL.PENDING,
            dueDate: {
                $gte: targetDate,
                $lt: nextDay
            }
        }).populate("tenantId");

        if (upcomingBills.length === 0) {
            console.log("[AutoReminder] No upcoming bills found for this date.");
            return [];
        }

        const notificationService = require("../notification/notification.service");
        const results = [];

        const reminderPromises = upcomingBills.map(async (bill) => {
            if (bill.tenantId) {
                const message = `Upcoming Due: Dear ${bill.tenantId.name}, your bill for ${bill.month} ${bill.year} (₹${bill.amount}) is due in ${daysBefore} days (${new Date(bill.dueDate).toLocaleDateString()}). Please pay to avoid late fees.`;
                
                const tasks = [];
                if (bill.tenantId.phone) {
                    tasks.push(whatsappService.sendReminder(bill.tenantId.phone, message).catch(err => {
                        console.error(`[AutoReminder] WhatsApp failed for ${bill.tenantId.name}:`, err.message);
                    }));
                }

                if (bill.tenantId.userId) {
                    tasks.push(notificationService.createNotification({
                        userId: bill.tenantId.userId,
                        title: "Bill Due Soon",
                        message: message,
                        type: "bill"
                    }).catch(err => {
                        console.error(`[AutoReminder] App Notification failed for ${bill.tenantId.name}:`, err.message);
                    }));
                }

                await Promise.all(tasks);
                results.push(bill._id);
            }
        });

        await Promise.all(reminderPromises);
        console.log(`[AutoReminder] Sent ${results.length} reminders.`);
        return results;
    }
}

module.exports = new BillingService();
