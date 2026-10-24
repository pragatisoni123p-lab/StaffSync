const User = require("../models/User");
const Employee = require("../models/Employee");
const Announcement = require("../models/Announcement");
const Training = require("../models/Training");

const seedInitialData = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      return; // Already seeded
    }

    console.log("Seeding initial StaffSync data...");

    // Create HR User
    const hrUser = await User.create({
      name: "Pragati Soni (HR Admin)",
      email: "hr@staffsync.com",
      password: "password123",
      role: "HR",
      department: "Human Resources",
      isActive: true,
    });

    await Employee.create({
      userId: hrUser._id,
      name: hrUser.name,
      email: hrUser.email,
      department: "Human Resources",
      position: "Senior HR Director",
      salary: 95000,
      phone: "+1-555-0101",
      address: "100 Corporate Plaza, Suite 400",
      status: "Active",
    });

    // Create Manager User
    const mgrUser = await User.create({
      name: "Adnan Sai (Engineering Lead)",
      email: "manager@staffsync.com",
      password: "password123",
      role: "Manager",
      department: "Engineering",
      isActive: true,
    });

    await Employee.create({
      userId: mgrUser._id,
      name: mgrUser.name,
      email: mgrUser.email,
      department: "Engineering",
      position: "Lead Engineering Manager",
      salary: 110000,
      phone: "+1-555-0102",
      address: "24 Innovation Parkway",
      status: "Active",
    });

    // Create Employee User
    const empUser = await User.create({
      name: "Alex Rivera (Full Stack Dev)",
      email: "employee@staffsync.com",
      password: "password123",
      role: "Employee",
      department: "Engineering",
      isActive: true,
    });

    await Employee.create({
      userId: empUser._id,
      name: empUser.name,
      email: empUser.email,
      department: "Engineering",
      position: "Full Stack Engineer",
      salary: 78000,
      phone: "+1-555-0103",
      address: "742 Evergreen Terrace",
      managerId: mgrUser._id,
      status: "Active",
    });

    // Create Sample Announcement
    await Announcement.create({
      title: "Welcome to StaffSync HRMS Platform!",
      message: "We are excited to launch StaffSync — your central hub for self-service attendance, leave requests, company announcements, and career training. Please complete your profile information.",
      targetAudience: "All",
      priority: "High",
      createdBy: hrUser._id,
    });

    // Create Sample Training Program
    await Training.create({
      title: "Full Stack Architecture & MERN Best Practices",
      description: "Master modern scalable web architectures, REST API security, database indexing, and responsive React component design.",
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      trainer: "Adnan Sai",
      createdBy: mgrUser._id,
      assignedTo: [empUser._id],
      status: "Scheduled",
    });

    console.log("Initial StaffSync data seeded successfully!");
  } catch (err) {
    console.error("Error seeding initial data:", err.message);
  }
};

module.exports = seedInitialData;
