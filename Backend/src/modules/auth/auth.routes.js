const express = require("express");
const authController = require("./auth.controller");
const { registerValidation, loginValidation } = require("./auth.validation");
const { authenticate } = require("../../middleware/auth.middleware");

const router = express.Router();

router.post("/register", registerValidation, authController.register);
router.post("/login", loginValidation, authController.login);
router.get("/profile", authenticate, authController.getProfile);
router.put("/profile", authenticate, authController.updateProfile);

module.exports = router;
