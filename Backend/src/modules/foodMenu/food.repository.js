const FoodMenu = require("../../models/foodMenu.model");

class FoodMenuRepository {
    async findAll() {
        const dayOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
        const menus = await FoodMenu.find();
        // Sort by day order
        return menus.sort((a, b) => dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day));
    }

    async findByDay(day) {
        return await FoodMenu.findOne({ day });
    }

    async createMenu(menuData) {
        return await FoodMenu.create(menuData);
    }

    async updateMenu(id, menuData) {
        return await FoodMenu.findByIdAndUpdate(id, menuData, { new: true });
    }

    async createOrUpdate(menuData) {
        return await FoodMenu.findOneAndUpdate(
            { day: menuData.day },
            menuData,
            { new: true, upsert: true }
        );
    }
}

module.exports = new FoodMenuRepository();
