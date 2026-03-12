const express = require("express");
const {
    createExpense,
    getExpenses,
    getExpense,
    updateExpense,
    deleteExpense,
    getExpenseSummary,
} = require("./expense.controller");

const { authenticate, authorize } = require("../../middleware/auth.middleware");
const ROLES = require("../../constants/roles");

const router = express.Router();

// All expense routes are protected and restricted to admins
router.use(authenticate);
router.use(authorize([ROLES.ADMIN]));

router.route("/summary").get(getExpenseSummary);

router
    .route("/")
    .post(createExpense)
    .get(getExpenses);

router
    .route("/:id")
    .get(getExpense)
    .put(updateExpense)
    .delete(deleteExpense);

module.exports = router;
