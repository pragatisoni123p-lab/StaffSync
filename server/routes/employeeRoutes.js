const express = require("express");
const router = express.Router();
const {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getMyProfile,
} = require("../controllers/employeeController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.get("/profile/me", protect, getMyProfile);
router.get("/", protect, authorize("HR", "Manager"), getAllEmployees);
router.post("/", protect, authorize("HR"), createEmployee);
router.get("/:id", protect, getEmployeeById);
router.put("/:id", protect, updateEmployee);
router.delete("/:id", protect, authorize("HR"), deleteEmployee);

module.exports = router;
