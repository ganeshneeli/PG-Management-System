const QRCode = require("qrcode");
const path = require("path");

class QrService {
    async createMenuQR() {
        try {
            const env = require("../config/env");
            const baseUrl = env.FRONTEND_URL;
            const filePath = path.join(__dirname, "../../../uploads/menuQR.png");
            await QRCode.toFile(
                filePath,
                `${baseUrl}/public-menu`
            );
            return filePath;
        } catch (error) {
            console.error("QR Code Generation Error:", error.message);
            throw error;
        }
    }
}

module.exports = new QrService();
