const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

class PdfService {
    generateBillPDF(billData) {
        return new Promise((resolve, reject) => {
            try {
                const billId = billData._id ? billData._id.toString() : "unknown";
                console.log("[PdfService] Starting Enhanced PDF generation for ID:", billId);

                const doc = new PDFDocument({
                    margin: 50,
                    size: "A4"
                });

                // Ensure PDF directory exists
                const dir = path.join(__dirname, "../../bills");
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir, { recursive: true });
                }

                const filePath = path.join(dir, `${billId}.pdf`);
                const writeStream = fs.createWriteStream(filePath);
                doc.pipe(writeStream);

                // --- THEME COLORS ---
                const PRIMARY_COLOR = "#9b66ff"; // Lavender
                const SECONDARY_COLOR = "#f3e8ff"; // Light Lavender
                const TEXT_COLOR = "#1a1a1a";
                const MUTED_TEXT = "#666666";

                // --- HEADER SECTION ---
                // Background Header
                doc.rect(0, 0, 612, 120).fill(PRIMARY_COLOR);
                
                doc.fillColor("#ffffff")
                   .fontSize(24)
                   .font("Helvetica-Bold")
                   .text("LAKSHMI PUJITHA LADIES PG", 50, 40);
                
                doc.fontSize(12)
                   .font("Helvetica")
                   .text("Luxury Accommodation for Women", 50, 70);

                doc.fontSize(14)
                   .font("Helvetica-Bold")
                   .text("RENT RECEIPT", 450, 40, { align: "right" });

                // --- COMPANY/OWNER DETAILS ---
                doc.fillColor(TEXT_COLOR).fontSize(10).font("Helvetica-Bold").text("OWNER DETAILS:", 50, 140);
                doc.font("Helvetica").text("Pavan Kumar & Lakshmi Pujitha", 50, 155);
                doc.text("Ph: 7989868757, 9573171253", 50, 170);
                
                doc.font("Helvetica-Bold").text("ADDRESS:", 300, 140);
                doc.font("Helvetica").text("#16, Manjunatha Layout, Munnekollala Main Road,", 300, 155);
                doc.text("Marathahalli, Bangalore - 560037", 300, 170);

                // Separator
                doc.moveTo(50, 200).lineTo(550, 200).strokeColor("#eeeeee").stroke();

                // --- BILL & TENANT INFO ---
                const tenantName = String(billData.tenantId?.name || "N/A");
                const tenantPhone = String(billData.tenantId?.phone || "N/A");
                const roomNumber = String(billData.roomId?.roomNumber || "N/A");
                const monthYear = `${billData.month} ${billData.year}`;
                const billStatus = (billData.status || "PENDING").toUpperCase();
                const issueDate = new Date().toLocaleDateString();
                const dueDate = billData.dueDate ? new Date(billData.dueDate).toLocaleDateString() : "N/A";

                doc.fontSize(10).fillColor(MUTED_TEXT).text("BILL TO:", 50, 220);
                doc.fontSize(14).fillColor(TEXT_COLOR).font("Helvetica-Bold").text(tenantName, 50, 235);
                doc.fontSize(10).font("Helvetica").text(`Phone: ${tenantPhone}`, 50, 255);
                doc.text(`Room: ${roomNumber}`, 50, 270);

                doc.fontSize(10).fillColor(MUTED_TEXT).text("RECEIPT DETAILS:", 300, 220);
                doc.fontSize(10).fillColor(TEXT_COLOR).font("Helvetica-Bold").text(`Receipt ID: `, 300, 235).font("Helvetica").text(billId, 380, 235);
                doc.font("Helvetica-Bold").text(`Billing Period: `, 300, 250).font("Helvetica").text(monthYear, 380, 250);
                doc.font("Helvetica-Bold").text(`Issue Date: `, 300, 265).font("Helvetica").text(issueDate, 380, 265);
                doc.font("Helvetica-Bold").text(`Due Date: `, 300, 280).font("Helvetica").text(dueDate, 380, 280);

                // --- TABLE SECTION ---
                const tableTop = 320;
                doc.rect(50, tableTop, 500, 25).fill(SECONDARY_COLOR);
                doc.fillColor(PRIMARY_COLOR).font("Helvetica-Bold").fontSize(10);
                doc.text("DESCRIPTION", 70, tableTop + 8);
                doc.text("AMOUNT", 450, tableTop + 8, { align: "right" });

                const baseRent = (billData.amount || 0) - (billData.electricity || 0) - (billData.extraCharges || 0);
                const electricity = billData.electricity || 0;
                const extraCharges = billData.extraCharges || 0;
                const totalAmount = billData.amount || 0;

                doc.fillColor(TEXT_COLOR).font("Helvetica").fontSize(11);
                
                // Row 1: Base Rent
                doc.text(`Monthly Rent - ${monthYear}`, 70, tableTop + 40);
                doc.text(`₹ ${baseRent.toLocaleString()}`, 450, tableTop + 40, { align: "right" });

                // Row 2: Electricity
                doc.text("Electricity Charges", 70, tableTop + 65);
                doc.text(`₹ ${electricity.toLocaleString()}`, 450, tableTop + 65, { align: "right" });

                // Row 3: Extra Charges
                doc.text("Extra Charges / Maintenance", 70, tableTop + 90);
                doc.text(`₹ ${extraCharges.toLocaleString()}`, 450, tableTop + 90, { align: "right" });

                // Separator
                doc.moveTo(50, tableTop + 115).lineTo(550, tableTop + 115).strokeColor("#eeeeee").stroke();

                // Total
                doc.fontSize(14).font("Helvetica-Bold").fillColor(PRIMARY_COLOR);
                doc.text("TOTAL AMOUNT", 70, tableTop + 130);
                doc.text(`₹ ${totalAmount.toLocaleString()}`, 450, tableTop + 130, { align: "right" });

                // --- STATUS STAMP ---
                const statusColor = billStatus === "PAID" ? "#22c55e" : "#f59e0b"; // Success Green or Warning Orange
                doc.rect(400, tableTop + 170, 150, 40).lineWidth(2).stroke(statusColor);
                doc.fillColor(statusColor).fontSize(16).font("Helvetica-Bold").text(billStatus, 400, tableTop + 182, { width: 150, align: "center" });

                // --- FOOTER ---
                const footerTop = 750;
                doc.fillColor(MUTED_TEXT).fontSize(10).font("Helvetica-Oblique");
                doc.text("Thank you for choosing Lakshmi Pujitha Ladies PG!", 50, footerTop, { align: "center", width: 500 });
                doc.fontSize(8).text("This is a computer-generated receipt and does not require a physical signature.", 50, footerTop + 15, { align: "center", width: 500 });

                doc.end();

                writeStream.on("finish", () => {
                    console.log("[PdfService] Enhanced PDF generated successfully at:", filePath);
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
