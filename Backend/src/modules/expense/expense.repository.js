const Expense = require("../../models/expense.model");

class ExpenseRepository {
    async create(expenseData) {
        const expense = new Expense(expenseData);
        return await expense.save();
    }

    async findAll(filter = {}, page = 1, limit = 50) {
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            Expense.find(filter)
                .sort({ date: -1 })
                .skip(skip)
                .limit(limit)
                .populate("createdBy", "name email"),
            Expense.countDocuments(filter)
        ]);
        return { data, total, page, totalPages: Math.ceil(total / limit) };
    }

    async findById(id) {
        return await Expense.findById(id).populate("createdBy", "name email");
    }

    async update(id, updateData) {
        return await Expense.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        }).populate("createdBy", "name email");
    }

    async delete(id) {
        return await Expense.findByIdAndDelete(id);
    }
    
    async aggregate(pipeline) {
        return await Expense.aggregate(pipeline);
    }
}

module.exports = new ExpenseRepository();
