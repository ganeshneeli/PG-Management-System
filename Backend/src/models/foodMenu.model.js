const mongoose = require("mongoose");

const foodMenuSchema = new mongoose.Schema({
    day: {
        type: String,
        required: true,
        unique: true,
        enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    },
    breakfast: {
        type: String,
        required: true
    },
    lunch: {
        type: String,
        required: true
    },
    dinner: {
        type: String,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model("FoodMenu", foodMenuSchema);
