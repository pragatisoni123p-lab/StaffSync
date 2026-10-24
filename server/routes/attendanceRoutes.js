const express = require("express");
const router = express.Router();
const {
  markAttendance,
  getMyAttendance,
  getTeamAttendance,
  getAllAttendance,
  getAttendanceSummary,
} = require("../controllers/attendanceController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.post("/mark", protect, markAttendance);
router.get("/me", protect, getMyAttendance);
router.get("/team", protect, authorize("Manager", "HR"), getTeamAttendance);
router.get("/all", protect, authorize("HR"), getAllAttendance);
router.get("/summary", protect, authorize("Manager", "HR"), getAttendanceSummary);

module.exports = router;
