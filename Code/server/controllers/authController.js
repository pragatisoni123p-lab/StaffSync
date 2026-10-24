const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Employee = require("../models/Employee");

// Helper to generate JWT
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || "staffsync_jwt_secret_token_key_2026_antigravity",
    {
      expiresIn: "7d",
    }
  );
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { name, email, password, role, department, position, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please provide all required fields (name, email, password)" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "A user with this email already exists" });
    }

    // Role can be HR, Manager, or Employee (default: Employee)
    const assignedRole = role && ["HR", "Manager", "Employee"].includes(role) ? role : "Employee";
    const assignedDept = department || "Engineering";

    const user = await User.create({
      name,
      email,
      password,
      role: assignedRole,
      department: assignedDept,
    });

    // Auto-create an employee record linked to this user
    await Employee.create({
      userId: user._id,
      name: user.name,
      email: user.email,
      department: assignedDept,
      position: position || (assignedRole === "HR" ? "HR Specialist" : assignedRole === "Manager" ? "Team Lead" : "Associate Engineer"),
      phone: phone || "",
      salary: assignedRole === "HR" ? 75000 : assignedRole === "Manager" ? 85000 : 55000,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
      },
    });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ message: error.message || "Server registration error" });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: "This account has been deactivated. Contact HR." });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: error.message || "Server login error" });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    const employee = await Employee.findOne({ userId: req.user._id });

    res.json({
      success: true,
      user,
      employee,
    });
  } catch (error) {
    console.error("GetMe Error:", error);
    res.status(500).json({ message: error.message || "Failed to fetch user profile" });
  }
};

module.exports = {
  register,
  login,
  getMe,
};
