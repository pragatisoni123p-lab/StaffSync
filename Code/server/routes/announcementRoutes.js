const express = require("express");
const router = express.Router();
const {
  getAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
} = require("../controllers/announcementController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.get("/", protect, getAnnouncements);
router.post("/", protect, authorize("HR", "Manager"), createAnnouncement);
router.delete("/:id", protect, authorize("HR", "Manager"), deleteAnnouncement);

module.exports = router;
