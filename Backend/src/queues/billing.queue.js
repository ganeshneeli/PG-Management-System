const { Queue, Worker } = require('bullmq');
const IORedis = require('ioredis');
const env = require('../config/env');

const connection = new IORedis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

const billingQueue = new Queue('billing-queue', { connection });

// Initialize Worker
const initWorker = () => {
    const worker = new Worker('billing-queue', async (job) => {
        const { type, data } = job.data;
        const billingRepository = require('../modules/billing/billing.repository');
        const tenantRepository = require('../modules/tenant/tenant.repository');
        const pdfService = require('../services/pdf.service');
        const whatsappService = require('../services/whatsapp.service');

        console.log(`[Queue] Processing job ${job.id} of type ${type}`);

        if (type === 'GENERATE_PDF') {
            try {
                const { billId } = data;
                const populatedBill = await billingRepository.findById(billId);
                if (populatedBill) {
                    await pdfService.generateBillPDF(populatedBill);
                    console.log(`[Queue] PDF generated for bill ${billId}`);
                }
            } catch (err) {
                console.error(`[Queue] PDF Generation failed for bill ${data.billId}:`, err.message);
                throw err;
            }
        }

        if (type === 'SEND_WHATSAPP') {
            try {
                const { tenantId, billData } = data;
                const tenant = await tenantRepository.findById(tenantId);
                if (tenant && tenant.phone) {
                    const message = `Dear ${tenant.name}, your bill for ${billData.month} ${billData.year} has been generated. Amount: ₹${billData.amount}. Due by ${new Date(billData.dueDate).toLocaleDateString()}.`;
                    await whatsappService.sendReminder(tenant.phone, message);
                    console.log(`[Queue] WhatsApp sent to ${tenant.name}`);
                }
            } catch (err) {
                console.error(`[Queue] WhatsApp failed for tenant ${data.tenantId}:`, err.message);
                throw err;
            }
        }
    }, { connection });

    worker.on('completed', (job) => {
        console.log(`[Queue] Job ${job.id} completed`);
    });

    worker.on('failed', (job, err) => {
        console.error(`[Queue] Job ${job.id} failed:`, err.message);
    });

    return worker;
};

module.exports = { billingQueue, initWorker };
