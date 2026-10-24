const express = require("express");
const router = express.Router();
const {
  getAllTrainings,
  getMyTrainings,
  createTraining,
  updateTraining,
  deleteTraining,
} = require("../controllers/trainingController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.get("/", protect, getAllTrainings);
router.get("/my", protect, getMyTrainings);
router.post("/", protect, authorize("Manager", "HR"), createTraining);
router.put("/:id", protect, authorize("Manager", "HR"), updateTraining);
router.delete("/:id", protect, authorize("Manager", "HR"), deleteTraining);

module.exports = router;
