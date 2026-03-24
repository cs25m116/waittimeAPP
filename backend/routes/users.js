const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const usersController = require("../controllers/usersController");

// Debug: Check if controller functions exist
console.log("Users Controller Functions:");
console.log("- getProfile:", typeof usersController.getProfile);
console.log("- updateProfile:", typeof usersController.updateProfile);
console.log("- updatePassword:", typeof usersController.updatePassword);
console.log("- getAllUsers:", typeof usersController.getAllUsers);
console.log("- getUserById:", typeof usersController.getUserById);
console.log("- updateUser:", typeof usersController.updateUser);
console.log("- deleteUser:", typeof usersController.deleteUser);
console.log("- updateUserRole:", typeof usersController.updateUserRole);

// All routes below this are protected
router.use(protect);

// Routes accessible by authenticated users
if (usersController.getProfile)
  router.get("/profile", usersController.getProfile);
if (usersController.updateProfile)
  router.put("/profile", usersController.updateProfile);
if (usersController.updatePassword)
  router.put("/password", usersController.updatePassword);

// Admin only routes
if (usersController.getAllUsers)
  router.get("/", authorize("admin"), usersController.getAllUsers);
if (usersController.getUserById)
  router.get("/:id", authorize("admin"), usersController.getUserById);
if (usersController.updateUser)
  router.put("/:id", authorize("admin"), usersController.updateUser);
if (usersController.deleteUser)
  router.delete("/:id", authorize("admin"), usersController.deleteUser);
if (usersController.updateUserRole)
  router.put("/:id/role", authorize("admin"), usersController.updateUserRole);

module.exports = router;
