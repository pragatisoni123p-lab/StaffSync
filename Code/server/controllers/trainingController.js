const Training = require("../models/Training");
const User = require("../models/User");
const Notification = require("../models/Notification");

// @desc    Get all training programs
// @route   GET /api/trainings
// @access  Private
const getAllTrainings = async (req, res) => {
  try {
    const trainings = await Training.find()
      .populate("createdBy", "name role department")
      .populate("assignedTo", "name email department")
      .sort({ date: -1 });

    res.json({ success: true, count: trainings.length, trainings });
  } catch (error) {
    console.error("Get All Trainings Error:", error);
    res.status(500).json({ message: error.message || "Failed to fetch trainings" });
  }
};

// @desc    Get trainings assigned to current employee
// @route   GET /api/trainings/my
// @access  Private
const getMyTrainings = async (req, res) => {
  try {
    const trainings = await Training.find({ assignedTo: req.user._id })
      .populate("createdBy", "name role department")
      .sort({ date: 1 });

    res.json({ success: true, count: trainings.length, trainings });
  } catch (error) {
    console.error("Get My Trainings Error:", error);
    res.status(500).json({ message: error.message || "Failed to fetch my trainings" });
  }
};

// @desc    Create new training program
// @route   POST /api/trainings
// @access  Private (Manager, HR)
const createTraining = async (req, res) => {
  try {
    const { title, description, date, trainer, assignedTo, status } = req.body;

    if (!title || !description || !date) {
      return res.status(400).json({ message: "Please provide title, description, and date" });
    }

    const training = await Training.create({
      title,
      description,
      date,
      trainer: trainer || "StaffSync Internal Specialist",
      createdBy: req.user._id,
      assignedTo: Array.isArray(assignedTo) ? assignedTo : [],
      status: status || "Scheduled",
    });

    // Notify assigned employees
    if (training.assignedTo && training.assignedTo.length > 0) {
      try {
        for (const userId of training.assignedTo) {
          await Notification.create({
            userId,
            type: "Training",
            message: `You have been assigned to training: "${title}" scheduled for ${new Date(date).toLocaleDateString()}.`,
            link: "/employee",
          });
        }
      } catch (notifErr) {
        console.warn("Notification error during training assignment:", notifErr.message);
      }
    }

    res.status(201).json({
      success: true,
      message: "Training program created successfully",
      training,
    });
  } catch (error) {
    console.error("Create Training Error:", error);
    res.status(500).json({ message: error.message || "Failed to create training program" });
  }
};

// @desc    Update training program
// @route   PUT /api/trainings/:id
// @access  Private (Manager, HR)
const updateTraining = async (req, res) => {
  try {
    const training = await Training.findById(req.params.id);
    if (!training) {
      return res.status(404).json({ message: "Training program not found" });
    }

    const { title, description, date, trainer, assignedTo, status } = req.body;

    if (title) training.title = title;
    if (description) training.description = description;
    if (date) training.date = date;
    if (trainer) training.trainer = trainer;
    if (assignedTo !== undefined) training.assignedTo = assignedTo;
    if (status) training.status = status;

    const updatedTraining = await training.save();
    res.json({ success: true, message: "Training program updated successfully", training: updatedTraining });
  } catch (error) {
    console.error("Update Training Error:", error);
    res.status(500).json({ message: error.message || "Failed to update training program" });
  }
};

// @desc    Delete training program
// @route   DELETE /api/trainings/:id
// @access  Private (Manager, HR)
const deleteTraining = async (req, res) => {
  try {
    const training = await Training.findById(req.params.id);
    if (!training) {
      return res.status(404).json({ message: "Training not found" });
    }

    await Training.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Training program deleted successfully" });
  } catch (error) {
    console.error("Delete Training Error:", error);
    res.status(500).json({ message: error.message || "Failed to delete training program" });
  }
};

module.exports = {
  getAllTrainings,
  getMyTrainings,
  createTraining,
  updateTraining,
  deleteTraining,
};
