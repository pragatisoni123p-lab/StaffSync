const express = require("express");
const router = express.Router();
const {
  applyLeave,
  getMyLeaves,
  getTeamLeaves,
  getAllLeaves,
  reviewLeave,
} = require("../controllers/leaveController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.post("/apply", protect, applyLeave);
router.get("/me", protect, getMyLeaves);
router.get("/team", protect, authorize("Manager", "HR"), getTeamLeaves);
router.get("/all", protect, authorize("HR"), getAllLeaves);
router.put("/:id/review", protect, authorize("Manager", "HR"), reviewLeave);

module.exports = router;
