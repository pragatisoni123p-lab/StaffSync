const Employee = require("../models/Employee");
const User = require("../models/User");

// @desc    Get all employees
// @route   GET /api/employees
// @access  Private (HR, Manager)
const getAllEmployees = async (req, res) => {
  try {
    const { department, status, search } = req.query;
    let query = {};

    if (department && department !== "All") {
      query.department = department;
    }
    if (status && status !== "All") {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { position: { $regex: search, $options: "i" } },
      ];
    }

    // If Manager, optionally filter to their department or team
    if (req.user.role === "Manager" && req.query.teamOnly === "true") {
      query.department = req.user.department;
    }

    const employees = await Employee.find(query)
      .populate("userId", "role isActive email")
      .populate("managerId", "name email department")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: employees.length, employees });
  } catch (error) {
    console.error("Get All Employees Error:", error);
    res.status(500).json({ message: error.message || "Failed to fetch employees" });
  }
};

// @desc    Get single employee by ID
// @route   GET /api/employees/:id
// @access  Private
const getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate("userId", "role isActive email name")
      .populate("managerId", "name email department");

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.json({ success: true, employee });
  } catch (error) {
    console.error("Get Employee By ID Error:", error);
    res.status(500).json({ message: error.message || "Failed to fetch employee" });
  }
};

// @desc    Create new employee (HR only)
// @route   POST /api/employees
// @access  Private (HR)
const createEmployee = async (req, res) => {
  try {
    const { name, email, password, role, department, position, salary, phone, address, managerId } = req.body;

    if (!name || !email || !password || !department || !position) {
      return res.status(400).json({ message: "Please provide all required fields (name, email, password, department, position)" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "A user with this email already exists" });
    }

    const assignedRole = role && ["HR", "Manager", "Employee"].includes(role) ? role : "Employee";

    const user = await User.create({
      name,
      email,
      password,
      role: assignedRole,
      department,
      isActive: true,
    });

    const employee = await Employee.create({
      userId: user._id,
      name,
      email,
      department,
      position,
      salary: Number(salary) || 50000,
      phone: phone || "",
      address: address || "",
      managerId: managerId || null,
      status: "Active",
    });

    res.status(201).json({ success: true, message: "Employee successfully created", employee });
  } catch (error) {
    console.error("Create Employee Error:", error);
    res.status(500).json({ message: error.message || "Failed to create employee" });
  }
};

// @desc    Update employee (HR or self profile)
// @route   PUT /api/employees/:id
// @access  Private (HR or Self)
const updateEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: "Employee record not found" });
    }

    // Only HR can edit arbitrary employees; normal users can only edit their own
    const isSelf = employee.userId.toString() === req.user._id.toString();
    const isHR = req.user.role === "HR";

    if (!isSelf && !isHR) {
      return res.status(403).json({ message: "Forbidden: You are not authorized to update this profile" });
    }

    const { name, phone, address, department, position, salary, status, managerId, role } = req.body;

    // Self can only edit contact details
    if (name) employee.name = name;
    if (phone !== undefined) employee.phone = phone;
    if (address !== undefined) employee.address = address;

    // HR can edit organizational details
    if (isHR) {
      if (department) employee.department = department;
      if (position) employee.position = position;
      if (salary !== undefined) employee.salary = salary;
      if (status) employee.status = status;
      if (managerId !== undefined) employee.managerId = managerId || null;

      if (role || status) {
        const updateUserData = {};
        if (role) updateUserData.role = role;
        if (status) updateUserData.isActive = status === "Active";
        await User.findByIdAndUpdate(employee.userId, updateUserData);
      }
    }

    const updatedEmployee = await employee.save();
    res.json({ success: true, message: "Profile updated successfully", employee: updatedEmployee });
  } catch (error) {
    console.error("Update Employee Error:", error);
    res.status(500).json({ message: error.message || "Failed to update employee" });
  }
};

// @desc    Delete or deactivate employee (HR only)
// @route   DELETE /api/employees/:id
// @access  Private (HR)
const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Soft delete / deactivation or full delete
    const { permanent } = req.query;

    if (permanent === "true") {
      await User.findByIdAndDelete(employee.userId);
      await Employee.findByIdAndDelete(req.params.id);
      return res.json({ success: true, message: "Employee record deleted permanently" });
    } else {
      employee.status = "Inactive";
      await employee.save();
      await User.findByIdAndUpdate(employee.userId, { isActive: false });
      return res.json({ success: true, message: "Employee deactivated successfully" });
    }
  } catch (error) {
    console.error("Delete Employee Error:", error);
    res.status(500).json({ message: error.message || "Failed to deactivate employee" });
  }
};

// @desc    Get current employee profile
// @route   GET /api/employees/profile/me
// @access  Private
const getMyProfile = async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.user._id })
      .populate("userId", "role isActive email name")
      .populate("managerId", "name email department");

    if (!employee) {
      return res.status(404).json({ message: "Employee profile not found" });
    }

    res.json({ success: true, employee });
  } catch (error) {
    console.error("Get My Profile Error:", error);
    res.status(500).json({ message: error.message || "Failed to fetch profile" });
  }
};

module.exports = {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getMyProfile,
};
