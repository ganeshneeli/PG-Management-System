const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Expense title is required"],
            trim: true,
        },
        category: {
            type: String,
            required: [true, "Expense category is required"],
            enum: [
                "Electricity",
                "Water",
                "Food Supplies",
                "Staff Salary",
                "Maintenance",
                "Internet",
                "Cleaning",
                "Other",
            ],
            default: "Other",
        },
        amount: {
            type: Number,
            required: [true, "Expense amount is required"],
            min: [0, "Amount cannot be negative"],
        },
        date: {
            type: Date,
            required: [true, "Expense date is required"],
            default: Date.now,
        },
        description: {
            type: String,
            trim: true,
            default: "",
        },
        billImage: {
            type: String,
            default: "",
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for common queries
expenseSchema.index({ date: -1 });
expenseSchema.index({ category: 1 });
expenseSchema.index({ createdBy: 1 });

const Expense = mongoose.model("Expense", expenseSchema);

module.exports = Expense;
