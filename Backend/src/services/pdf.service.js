const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

class PdfService {
    generateBillPDF(billData) {
        return new Promise((resolve, reject) => {
            try {
                const billId = billData._id ? billData._id.toString() : "unknown";
                console.log("[PdfService] Starting PDF generation for ID:", billId);

                const doc = new PDFDocument();

                // Ensure PDF directory exists
                const dir = path.join(__dirname, "../../bills");
                if (!fs.existsSync(dir)) {
                    console.log("[PdfService] Creating directory:", dir);
                    fs.mkdirSync(dir, { recursive: true });
                }

                const filePath = path.join(dir, `${billId}.pdf`);
                console.log("[PdfService] Writing to:", filePath);

                const writeStream = fs.createWriteStream(filePath);
                doc.pipe(writeStream);

                doc.fontSize(20).text("PG RENT BILL", { align: "center" });
                doc.moveDown();

                doc.fontSize(12).text(`Bill ID: ${billId}`);

                // Use safe strings for pdfkit
                const tenantName = String(billData.tenantId?.name || "N/A");
                const roomNumber = String(billData.roomId?.roomNumber || "N/A");
                const amount = String(billData.amount || 0);
                const status = String(billData.status || "N/A");
                const dueDate = billData.dueDate ? new Date(billData.dueDate).toLocaleDateString() : "N/A";

                doc.text(`Tenant: ${tenantName}`);
                doc.text(`Room: ${roomNumber}`);
                doc.text(`Rent: ₹${amount}`);
                doc.text(`Status: ${status}`);
                doc.text(`Due Date: ${dueDate}`);

                doc.end();

                writeStream.on("finish", () => {
                    console.log("[PdfService] WriteStream finished successfully");
                    resolve(filePath);
                });

                writeStream.on("error", (err) => {
                    console.error("[PdfService] WriteStream Error:", err);
                    reject(err);
                });
            } catch (err) {
                console.error("[PdfService] General Exception:", err);
                reject(err);
            }
        });
    }
}

module.exports = new PdfService();
