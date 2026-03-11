const foodMenuRepository = require("./food.repository");

class FoodMenuService {
    async getAllMenus() {
        return await foodMenuRepository.findAll();
    }

    async getTodayMenu() {
        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const today = days[new Date().getDay()];
        return await foodMenuRepository.findByDay(today);
    }

    async addMenu(menuData) {
        return await foodMenuRepository.createOrUpdate(menuData);
    }

    async updateMenu(id, menuData) {
        return await foodMenuRepository.updateMenu(id, menuData);
    }
}

module.exports = new FoodMenuService();
