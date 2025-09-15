const User = require("../../models/userSchema");
const Feed = require("../../models/feedSchema");

// --- postFeed Profile Service ---
exports.postFeedServices = async (req) => {
  try {
    const userId = req.user.sub;
    const { content, media } = req.body;

    // Check user exists
    const user = await User.findById(userId);
    if (!user) {
      return {
        status: false,
        statusCode: 404,
        message: "User not found",
        data: {},
      };
    }

    // Create feed
    const feed = await Feed.create({
      authorId: userId,
      content,
      media,
    });

    // Populate author details
    const populatedFeed = await Feed.findById(feed._id)
      .populate("authorId", "name username email role")
      .lean();

    // Rename authorId -> authorDetails & add isReacted
    const { authorId, ...rest } = populatedFeed;
    const feedResponse = {
      ...rest,
      authorDetails: authorId,
      isReacted: false, // just created, current user hasn't reacted yet
    };

    return {
      status: true,
      statusCode: 200,
      message: "Feed posted successfully",
      data: feedResponse,
    };
  } catch (error) {
    return {
      status: false,
      statusCode: 500,
      message: "Error posting feed",
      data: { error: error.message },
    };
  }
};

// --- getFeed Service ---
exports.getFeedServices = async (req) => {
  try {
    const currentUserId = req.user.sub; // current logged-in user
    const { page = 1, limit = 10, ratingValue } = req.query;
    const skip = (page - 1) * limit;

    // Build query
    const query = {};
    if (ratingValue) {
      query["reactions"] = {
        $elemMatch: { type: "rating", ratingValue: parseInt(ratingValue) },
      };
    }

    const feeds = await Feed.find(query)
      .sort({ createdAt: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .populate("authorId", "name username email role")
      .lean();

    // Transform authorId to authorDetails and add isReacted
    const feedsWithExtras = feeds.map((feed) => {
      const reacted = feed.reactions.some(
        (r) => r.userId.toString() === currentUserId
      );

      // Rename authorId -> authorDetails
      const { authorId, ...rest } = feed;
      return { ...rest, authorDetails: authorId, isReacted: reacted };
    });

    return {
      status: true,
      statusCode: 200,
      message: "Feeds fetched successfully",
      data: feedsWithExtras,
    };
  } catch (error) {
    return {
      status: false,
      statusCode: 500,
      message: "Error fetching feeds",
      data: { error: error.message },
    };
  }
};
