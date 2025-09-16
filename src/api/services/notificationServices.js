const mongoose = require("mongoose");

const User = require("../../models/userSchema");
const Feed = require("../../models/feedSchema");
const Reaction = require("../../models/reactionSchema");
const notificationEmitter = require("../../emitter/notificationEmitter");

// --- postFeed Profile Service ---
const Notification = require("../../models/notificationSchema");

exports.getNotificationServices = async (req) => {
  try {
    // Extract pagination params
    let { page = 1, limit = 10 } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    // Calculate skip
    const skip = (page - 1) * limit;

    // Fetch notifications with pagination
    const notifications = await Notification.find()
      .sort({ createdAt: -1 }) // latest first
      .skip(skip)
      .limit(limit)
      .populate(
        "posted_by",
        "name email profile_image username role company_name about_company"
      ); // populate user info if needed

    // Count total documents for pagination info
    const total = await Notification.countDocuments();

    return {
      status: true,
      statusCode: 200,
      message: "Notifications fetched successfully",
      data: {
        notifications,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  } catch (error) {
    return {
      status: false,
      statusCode: 500,
      message: "Error fetching notifications",
      data: { error: error.message },
    };
  }
};
