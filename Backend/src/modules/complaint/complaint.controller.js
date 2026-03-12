const complaintService = require("./complaint.service");
const tenantRepository = require("../tenant/tenant.repository");
const ROLES = require("../../constants/roles");
const redis = require("../../config/redis");

function detectPriority(text) {
    if (!text) return "LOW";
    const message = text.toLowerCase();
    
    if (
        message.includes("leak") ||
        message.includes("fire") ||
        message.includes("electric") ||
        message.includes("gas") ||
        message.includes("urgent") ||
        message.includes("emergency")
    ) {
        return "HIGH";
    }
  
    if (
        message.includes("broken") ||
        message.includes("damage") ||
        message.includes("not working") ||
        message.includes("repair")
    ) {
        return "MEDIUM";
    }
  
    return "LOW";
}

class ComplaintController {
    async getAllComplaints(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 50;
            const result = await complaintService.getAllComplaints(page, limit);
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
 
    async fileComplaint(req, res, next) {
        try {
            let complaintData = { ...req.body };
            
            // Auto detect priority based on description
            complaintData.priority = detectPriority(complaintData.description);
 
            // If Admin is filing on behalf of a tenant, use the tenantId from body
            if (req.user.role === ROLES.ADMIN) {
                // Admin can directly specify tenantId or file without one
                if (!complaintData.tenantId) {
                    complaintData.tenantId = null;
                }
            } else {
                // Tenant filing their own complaint
                const tenant = await require("../tenant/tenant.repository").findByUserId(req.user.id);
                if (!tenant) {
                    return res.status(403).json({ success: false, message: "Only tenants can file complaints" });
                }
                complaintData.tenantId = tenant._id;
                complaintData.roomNumber = tenant.roomId?.roomNumber || complaintData.roomNumber;
            }
 
            const complaint = await complaintService.fileComplaint(complaintData);
 
            // Send real-time notification to admin/owner
            const socketServer = require("../../sockets/socket.server");
            socketServer.emitSyncEvent("sync_complaints");
 
            // If filed by a tenant, notify the owner
            if (req.user.role === ROLES.TENANT) {
                socketServer.sendNotification({
                    title: "New Complaint Filed",
                    message: `A new complaint has been reported for room ${complaint.roomNumber || 'N/A'}.`,
                    type: "complaint"
                });
            }
 
            await redis.del("dashboard_stats");
            res.status(201).json({ success: true, data: complaint });
        } catch (error) {
            next(error);
        }
    }
 
    async updateComplaint(req, res, next) {
        try {
            const complaint = await complaintService.updateComplaint(req.params.id, req.body);
 
            const socketServer = require("../../sockets/socket.server");
            socketServer.emitSyncEvent("sync_complaints");
 
            // If resolved, notify the tenant specifically
            if (req.body.status === "resolved" && complaint.tenantId) {
                const tenantUserId = complaint.tenantId.userId || complaint.tenantId; // populated or not
                if (tenantUserId) {
                    socketServer.sendNotificationToUser(tenantUserId, {
                        title: "Complaint Resolved",
                        message: `Your complaint "${complaint.title}" has been marked as resolved.`,
                        type: "success"
                    });
                }
            }
 
            await redis.del("dashboard_stats");
            res.status(200).json({ success: true, data: complaint });
        } catch (error) {
            next(error);
        }
    }
 
    async getMyComplaints(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 50;
            const tenant = await require("../tenant/tenant.repository").findByUserId(req.user.id);
            if (!tenant) return res.status(404).json({ success: false, message: "Tenant record not found" });
            const result = await complaintService.getMyComplaints(tenant._id, page, limit);
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
}

module.exports = new ComplaintController();
