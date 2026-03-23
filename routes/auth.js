const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const authController = require("../controllers/authController");

// Debug: Check if controller functions exist
console.log("Auth Controller Functions:");
console.log("- register:", typeof authController.register);
console.log("- login:", typeof authController.login);
console.log("- logout:", typeof authController.logout);
console.log("- refreshToken:", typeof authController.refreshToken);

// Validation rules
const registerValidation = [
  body("name").notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Please enter a valid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
];

const loginValidation = [
  body("email").isEmail().withMessage("Please enter a valid email"),
  body("password").notEmpty().withMessage("Password is required"),
];

// Routes - with null checks
if (authController.register)
  router.post("/register", registerValidation, authController.register);
if (authController.login)
  router.post("/login", loginValidation, authController.login);
if (authController.logout) router.post("/logout", authController.logout);
if (authController.refreshToken)
  router.post("/refresh-token", authController.refreshToken);

module.exports = router;
