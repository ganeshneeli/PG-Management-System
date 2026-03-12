const expenseService = require("./expense.service");
const { asyncHandler } = require("../../middleware/error.middleware");

// @desc    Create a new expense
// @route   POST /api/v1/expenses
// @access  Private/Admin
exports.createExpense = asyncHandler(async (req, res) => {
    const expense = await expenseService.createExpense(req.body, req.user.id);
    res.status(201).json({
        success: true,
        data: expense,
    });
});

// @desc    Get all expenses
// @route   GET /api/v1/expenses
// @access  Private/Admin
exports.getExpenses = asyncHandler(async (req, res) => {
    const result = await expenseService.getAllExpenses(req.query);
    res.status(200).json({
        success: true,
        count: result.data.length,
        total: result.total,
        page: result.page,
        totalPages: result.totalPages,
        data: result.data,
    });
});

// @desc    Get an expense by ID
// @route   GET /api/v1/expenses/:id
// @access  Private/Admin
exports.getExpense = asyncHandler(async (req, res) => {
    const expense = await expenseService.getExpenseById(req.params.id);
    res.status(200).json({
        success: true,
        data: expense,
    });
});

// @desc    Update an expense
// @route   PUT /api/v1/expenses/:id
// @access  Private/Admin
exports.updateExpense = asyncHandler(async (req, res) => {
    const expense = await expenseService.updateExpense(req.params.id, req.body);
    res.status(200).json({
        success: true,
        data: expense,
    });
});

// @desc    Delete an expense
// @route   DELETE /api/v1/expenses/:id
// @access  Private/Admin
exports.deleteExpense = asyncHandler(async (req, res) => {
    await expenseService.deleteExpense(req.params.id);
    res.status(200).json({
        success: true,
        message: "Expense deleted successfully",
    });
});

// @desc    Get expense summary (total and by category)
// @route   GET /api/v1/expenses/summary
// @access  Private/Admin
exports.getExpenseSummary = asyncHandler(async (req, res) => {
    const { year, month } = req.query;
    const summary = await expenseService.getExpenseSummary(year, month);
    res.status(200).json({
        success: true,
        data: summary,
    });
});
