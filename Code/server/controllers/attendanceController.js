const Attendance = require("../models/Attendance");
const Employee = require("../models/Employee");
const User = require("../models/User");

// Helper to format Date to YYYY-MM-DD in local time
const getTodayDateStr = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// @desc    Check-in or Check-out attendance
// @route   POST /api/attendance/mark
// @access  Private
const markAttendance = async (req, res) => {
  try {
    const todayStr = getTodayDateStr();
    const userId = req.user._id;

    let record = await Attendance.findOne({ employeeId: userId, date: todayStr });

    if (!record) {
      // First check-in for today
      record = await Attendance.create({
        employeeId: userId,
        date: todayStr,
        checkIn: new Date(),
        status: "Present",
      });

      return res.status(201).json({
        success: true,
        action: "check-in",
        message: "Successfully checked in for today!",
        attendance: record,
      });
    }

    // Already checked in, check if already checked out
    if (record.checkOut) {
      return res.status(400).json({
        success: false,
        message: "You have already completed check-in and check-out for today.",
        attendance: record,
      });
    }

    // Perform check-out
    record.checkOut = new Date();
    const diffHours = (record.checkOut.getTime() - record.checkIn.getTime()) / (1000 * 60 * 60);
    record.workHours = parseFloat(diffHours.toFixed(2));

    // If worked less than 4 hours, mark as Half Day
    if (record.workHours < 4) {
      record.status = "Half Day";
    } else {
      record.status = "Present";
    }

    await record.save();

    return res.json({
      success: true,
      action: "check-out",
      message: `Successfully checked out! Logged ${record.workHours} hours.`,
      attendance: record,
    });
  } catch (error) {
    console.error("Mark Attendance Error:", error);
    res.status(500).json({ message: error.message || "Failed to mark attendance" });
  }
};

// @desc    Get current user's attendance records
// @route   GET /api/attendance/me
// @access  Private
const getMyAttendance = async (req, res) => {
  try {
    const records = await Attendance.find({ employeeId: req.user._id })
      .sort({ date: -1 })
      .limit(60);

    const todayStr = getTodayDateStr();
    const todayRecord = await Attendance.findOne({ employeeId: req.user._id, date: todayStr });

    res.json({
      success: true,
      today: todayRecord || null,
      history: records,
    });
  } catch (error) {
    console.error("Get My Attendance Error:", error);
    res.status(500).json({ message: error.message || "Failed to fetch attendance records" });
  }
};

// @desc    Get team attendance (Manager)
// @route   GET /api/attendance/team
// @access  Private (Manager, HR)
const getTeamAttendance = async (req, res) => {
  try {
    const { date } = req.query;
    const queryDate = date || getTodayDateStr();

    // Find employees in manager's department
    const deptEmployees = await Employee.find({ department: req.user.department }).select("userId name department position");
    const userIds = deptEmployees.map((e) => e.userId);

    const records = await Attendance.find({
      employeeId: { $in: userIds },
      date: queryDate,
    }).populate("employeeId", "name email department");

    res.json({
      success: true,
      date: queryDate,
      totalDepartmentMembers: deptEmployees.length,
      presentCount: records.length,
      records,
    });
  } catch (error) {
    console.error("Get Team Attendance Error:", error);
    res.status(500).json({ message: error.message || "Failed to fetch team attendance" });
  }
};

// @desc    Get all attendance records (HR)
// @route   GET /api/attendance/all
// @access  Private (HR)
const getAllAttendance = async (req, res) => {
  try {
    const { date, department, status } = req.query;
    let query = {};

    if (date) {
      query.date = date;
    }

    if (status && status !== "All") {
      query.status = status;
    }

    let records = await Attendance.find(query)
      .populate("employeeId", "name email department role")
      .sort({ date: -1, createdAt: -1 })
      .limit(100);

    if (department && department !== "All") {
      records = records.filter(
        (r) => r.employeeId && r.employeeId.department === department
      );
    }

    res.json({
      success: true,
      count: records.length,
      records,
    });
  } catch (error) {
    console.error("Get All Attendance Error:", error);
    res.status(500).json({ message: error.message || "Failed to fetch organization attendance" });
  }
};

// @desc    Get attendance summary analytics (HR & Manager)
// @route   GET /api/attendance/summary
// @access  Private (HR, Manager)
const getAttendanceSummary = async (req, res) => {
  try {
    const todayStr = getTodayDateStr();
    const totalEmployees = await User.countDocuments({ role: "Employee", isActive: true });
    const todayPresent = await Attendance.countDocuments({ date: todayStr, status: { $in: ["Present", "Half Day"] } });
    const todayHalfDay = await Attendance.countDocuments({ date: todayStr, status: "Half Day" });
    const todayAbsent = Math.max(0, totalEmployees - todayPresent);

    const attendanceRate = totalEmployees > 0 ? Math.round((todayPresent / totalEmployees) * 100) : 0;

    res.json({
      success: true,
      todayStr,
      totalEmployees,
      todayPresent,
      todayHalfDay,
      todayAbsent,
      attendanceRate,
    });
  } catch (error) {
    console.error("Attendance Summary Error:", error);
    res.status(500).json({ message: error.message || "Failed to calculate summary" });
  }
};

module.exports = {
  markAttendance,
  getMyAttendance,
  getTeamAttendance,
  getAllAttendance,
  getAttendanceSummary,
};
