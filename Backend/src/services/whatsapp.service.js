const twilio = require("twilio");
const env = require("../config/env");

class WhatsappService {
    constructor() {
        if (env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN) {
            this.client = new twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);
        }
    }

    async sendReminder(phone, message) {
        if (!this.client) {
            console.warn("Twilio not configured. Would send WhatsApp:", message, "to", phone);
            return;
        }

        try {
            await this.client.messages.create({
                body: message,
                from: env.TWILIO_PHONE_NUMBER || "whatsapp:+14155238886",
                to: `whatsapp:${phone}`
            });
        } catch (error) {
            console.error("WhatsApp Error:", error.message);
        }
    }
}

module.exports = new WhatsappService();
