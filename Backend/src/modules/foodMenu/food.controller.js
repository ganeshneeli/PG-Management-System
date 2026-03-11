const foodMenuService = require("./food.service");

class FoodMenuController {
    async getMenu(req, res, next) {
        try {
            const menu = await foodMenuService.getAllMenus();
            res.status(200).json({ success: true, data: menu });
        } catch (error) {
            next(error);
        }
    }

    async addMenu(req, res, next) {
        try {
            const menu = await foodMenuService.addMenu(req.body);
            require("../../sockets/socket.server").emitSyncEvent("sync_menu");
            res.status(201).json({ success: true, data: menu });
        } catch (error) {
            next(error);
        }
    }

    async updateMenu(req, res, next) {
        try {
            const menu = await foodMenuService.updateMenu(req.params.id, req.body);
            require("../../sockets/socket.server").emitSyncEvent("sync_menu");
            res.status(200).json({ success: true, data: menu });
        } catch (error) {
            next(error);
        }
    }

    async getTodayMenu(req, res, next) {
        try {
            const menu = await foodMenuService.getTodayMenu();
            res.status(200).json({ success: true, data: menu });
        } catch (error) {
            next(error);
        }
    }

    async generateQR(req, res, next) {
        try {
            const qrService = require("../../services/qr.service");
            const filePath = await qrService.createMenuQR();
            res.status(200).json({ success: true, message: "QR generated", path: "/uploads/menuQR.png" });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new FoodMenuController();
