const expenseRepo = require("./expense.repository");
const mongoose = require("mongoose");
const ErrorResponse = require("../../utils/errorResponse");

class ExpenseService {
    async createExpense(expenseData, userId) {
        // Validate required fields
        if (!expenseData.title || !expenseData.category || !expenseData.amount || !expenseData.date) {
            throw new ErrorResponse("Please provide all required fields (title, category, amount, date)", 400);
        }

        const expense = await expenseRepo.create({
            ...expenseData,
            createdBy: userId,
        });

        return expense;
    }

    async getAllExpenses(query) {
        const filter = {};
        const page = parseInt(query.page) || 1;
        const limit = parseInt(query.limit) || 50;
        
        // Optional filtering by category
        if (query.category) {
            filter.category = query.category;
        }
 
        // Optional filtering by date range
        if (query.startDate && query.endDate) {
            filter.date = {
                $gte: new Date(query.startDate),
                $lte: new Date(query.endDate),
            };
        }
 
        return await expenseRepo.findAll(filter, page, limit);
    }

    async getExpenseById(id) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new ErrorResponse("Invalid expense ID", 400);
        }

        const expense = await expenseRepo.findById(id);
        if (!expense) {
            throw new ErrorResponse("Expense not found", 404);
        }

        return expense;
    }

    async updateExpense(id, updateData) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new ErrorResponse("Invalid expense ID", 400);
        }

        const expense = await expenseRepo.update(id, updateData);
        if (!expense) {
            throw new ErrorResponse("Expense not found", 404);
        }

        return expense;
    }

    async deleteExpense(id) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new ErrorResponse("Invalid expense ID", 400);
        }

        const expense = await expenseRepo.delete(id);
        if (!expense) {
            throw new ErrorResponse("Expense not found", 404);
        }

        return expense;
    }

    async getExpenseSummary(year, month) {
        // Build the match stage for the aggregation pipeline
        const matchStage = {};
        
        if (year && month) {
            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 0, 23, 59, 59);
            matchStage.date = { $gte: startDate, $lte: endDate };
        } else if (year) {
             const startDate = new Date(year, 0, 1);
             const endDate = new Date(year, 11, 31, 23, 59, 59);
             matchStage.date = { $gte: startDate, $lte: endDate };
        }

        // Pipeline to calculate total, and breakdown by category
        const pipeline = [
            { $match: matchStage },
            {
                $facet: {
                    totalAmount: [
                        { $group: { _id: null, total: { $sum: "$amount" } } }
                    ],
                    categoryBreakdown: [
                        { $group: { _id: "$category", total: { $sum: "$amount" } } },
                        { $sort: { total: -1 } }
                    ]
                }
            }
        ];

        const result = await expenseRepo.aggregate(pipeline);
        
        const summary = {
            total: result[0].totalAmount[0]?.total || 0,
            byCategory: result[0].categoryBreakdown.map(cat => ({
                category: cat._id,
                amount: cat.total
            }))
        };

        return summary;
    }
}

module.exports = new ExpenseService();
