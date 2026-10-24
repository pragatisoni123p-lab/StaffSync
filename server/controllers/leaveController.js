const Leave = require("../models/Leave");
const Employee = require("../models/Employee");
const User = require("../models/User");
const Notification = require("../models/Notification");

// @desc    Apply for a leave
// @route   POST /api/leaves/apply
// @access  Private
const applyLeave = async (req, res) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;

    if (!leaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({ message: "Please provide all required fields (leaveType, startDate, endDate, reason)" });
    }

    if (new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({ message: "Start date cannot be after end date" });
    }

    const leave = await Leave.create({
      employeeId: req.user._id,
      leaveType,
      startDate,
      endDate,
      reason,
      status: "Pending",
    });

    // Notify Managers in the department and HR
    try {
      const managersAndHR = await User.find({
        $or: [
          { role: "Manager", department: req.user.department },
          { role: "HR" },
        ],
      });

      for (const recipient of managersAndHR) {
        await Notification.create({
          userId: recipient._id,
          type: "Leave",
          message: `${req.user.name} applied for ${leaveType} leave (${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}).`,
          link: recipient.role === "Manager" ? "/manager" : "/hr",
        });
      }
    } catch (notifErr) {
      console.warn("Notification error during applyLeave:", notifErr.message);
    }

    res.status(201).json({
      success: true,
      message: "Leave application submitted successfully",
      leave,
    });
  } catch (error) {
    console.error("Apply Leave Error:", error);
    res.status(500).json({ message: error.message || "Failed to apply for leave" });
  }
};

// @desc    Get current user's leaves
// @route   GET /api/leaves/me
// @access  Private
const getMyLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({ employeeId: req.user._id })
      .populate("reviewedBy", "name role")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: leaves.length, leaves });
  } catch (error) {
    console.error("Get My Leaves Error:", error);
    res.status(500).json({ message: error.message || "Failed to fetch leaves" });
  }
};

// @desc    Get team leaves (Manager)
// @route   GET /api/leaves/team
// @access  Private (Manager, HR)
const getTeamLeaves = async (req, res) => {
  try {
    const deptEmployees = await Employee.find({ department: req.user.department }).select("userId");
    const userIds = deptEmployees.map((e) => e.userId);

    const leaves = await Leave.find({ employeeId: { $in: userIds } })
      .populate("employeeId", "name email department")
      .populate("reviewedBy", "name role")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: leaves.length, leaves });
  } catch (error) {
    console.error("Get Team Leaves Error:", error);
    res.status(500).json({ message: error.message || "Failed to fetch team leaves" });
  }
};

// @desc    Get all leaves (HR)
// @route   GET /api/leaves/all
// @access  Private (HR)
const getAllLeaves = async (req, res) => {
  try {
    const { status, leaveType } = req.query;
    let query = {};

    if (status && status !== "All") query.status = status;
    if (leaveType && leaveType !== "All") query.leaveType = leaveType;

    const leaves = await Leave.find(query)
      .populate("employeeId", "name email department")
      .populate("reviewedBy", "name role")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: leaves.length, leaves });
  } catch (error) {
    console.error("Get All Leaves Error:", error);
    res.status(500).json({ message: error.message || "Failed to fetch organization leaves" });
  }
};

// @desc    Review leave request (Approve / Reject)
// @route   PUT /api/leaves/:id/review
// @access  Private (Manager, HR)
const reviewLeave = async (req, res) => {
  try {
    const { status, comment } = req.body;

    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({ message: "Status must be either 'Approved' or 'Rejected'" });
    }

    const leave = await Leave.findById(req.params.id);
    if (!leave) {
      return res.status(404).json({ message: "Leave request not found" });
    }

    leave.status = status;
    leave.reviewedBy = req.user._id;
    leave.approverRole = req.user.role;
    if (comment !== undefined) {
      leave.comment = comment;
    }

    await leave.save();

    // Create notification for employee
    try {
      await Notification.create({
        userId: leave.employeeId,
        type: "Leave",
        message: `Your ${leave.leaveType} leave application has been ${status} by ${req.user.name} (${req.user.role}). ${comment ? `Note: "${comment}"` : ""}`,
        link: "/employee",
      });
    } catch (notifErr) {
      console.warn("Notification error during reviewLeave:", notifErr.message);
    }

    res.json({
      success: true,
      message: `Leave successfully ${status.toLowerCase()}`,
      leave,
    });
  } catch (error) {
    console.error("Review Leave Error:", error);
    res.status(500).json({ message: error.message || "Failed to review leave" });
  }
};

module.exports = {
  applyLeave,
  getMyLeaves,
  getTeamLeaves,
  getAllLeaves,
  reviewLeave,
};
