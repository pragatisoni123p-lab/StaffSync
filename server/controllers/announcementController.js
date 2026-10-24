const Announcement = require("../models/Announcement");
const User = require("../models/User");
const Notification = require("../models/Notification");

// @desc    Get announcements for the current user
// @route   GET /api/announcements
// @access  Private
const getAnnouncements = async (req, res) => {
  try {
    const userRole = req.user ? req.user.role : "Employee";

    // Show announcements targeted to All or matching user's specific role
    const announcements = await Announcement.find({
      targetAudience: { $in: ["All", userRole] },
    })
      .populate("createdBy", "name role department")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: announcements.length, announcements });
  } catch (error) {
    console.error("Get Announcements Error:", error);
    res.status(500).json({ message: error.message || "Failed to fetch announcements" });
  }
};

// @desc    Create new announcement (HR, Manager)
// @route   POST /api/announcements
// @access  Private (HR, Manager)
const createAnnouncement = async (req, res) => {
  try {
    const { title, message, targetAudience, priority } = req.body;

    if (!title || !message) {
      return res.status(400).json({ message: "Title and message are required" });
    }

    const audience = targetAudience || "All";

    const announcement = await Announcement.create({
      title,
      message,
      targetAudience: audience,
      priority: priority || "Normal",
      createdBy: req.user._id,
    });

    // Notify targeted users
    try {
      let recipientQuery = { isActive: true };
      if (audience !== "All") {
        recipientQuery.role = audience;
      }

      const usersToNotify = await User.find(recipientQuery).select("_id");
      for (const u of usersToNotify) {
        // Don't notify the author
        if (u._id.toString() !== req.user._id.toString()) {
          await Notification.create({
            userId: u._id,
            type: "Announcement",
            message: `New Announcement: "${title}" by ${req.user.name}`,
            link: audience === "Manager" ? "/manager" : audience === "HR" ? "/hr" : "/employee",
          });
        }
      }
    } catch (notifErr) {
      console.warn("Notification error during announcement:", notifErr.message);
    }

    res.status(201).json({
      success: true,
      message: "Announcement published successfully",
      announcement,
    });
  } catch (error) {
    console.error("Create Announcement Error:", error);
    res.status(500).json({ message: error.message || "Failed to publish announcement" });
  }
};

// @desc    Delete announcement
// @route   DELETE /api/announcements/:id
// @access  Private (HR, Creator)
const deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    // Allow HR or creator to delete
    if (req.user.role !== "HR" && announcement.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized to delete this announcement" });
    }

    await Announcement.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: "Announcement deleted successfully" });
  } catch (error) {
    console.error("Delete Announcement Error:", error);
    res.status(500).json({ message: error.message || "Failed to delete announcement" });
  }
};

module.exports = {
  getAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
};
