const express = require("express");
const router = express.Router();
const {
  draftAnnouncement,
  analyzeLeave,
  generateCurriculum,
} = require("../controllers/aiController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.post("/draft-announcement", protect, authorize("HR", "Manager"), draftAnnouncement);
router.post("/analyze-leave", protect, authorize("HR", "Manager"), analyzeLeave);
router.post("/generate-curriculum", protect, authorize("HR", "Manager"), generateCurriculum);

module.exports = router;
