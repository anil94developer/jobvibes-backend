const mongoose = require("mongoose");

const User = require("../../models/userSchema");
const Feed = require("../../models/feedSchema");
const Reaction = require("../../models/reactionSchema");

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
      .populate("authorId", "name profile_image username email role")
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
    const { page = 1, limit = 10, search } = req.query;
    const skip = (page - 1) * limit;

    // Build query
    const query = {};
    if (search) {
      query.$or = [{ content: { $regex: search, $options: "i" } }];
    }

    const feeds = await Feed.find(query)
      .sort({ createdAt: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .populate(
        "authorId",
        "name profile_image username email role company_name about_company"
      )
      .lean();

    // Get all feed IDs from result
    const feedIds = feeds.map((f) => f._id);

    // Find all reactions for current user on these feeds
    const userReactions = await Reaction.find({
      userId: currentUserId,
      feedId: { $in: feedIds },
    }).lean();

    // Map reactions by feedId for quick lookup
    const reactionMap = {};
    userReactions.forEach((r) => {
      reactionMap[r.feedId.toString()] = r; // store full reaction
    });

    // Transform feeds with isReacted + rating
    const feedsWithExtras = feeds.map((feed) => {
      const reaction = reactionMap[feed._id.toString()];
      const isReacted = !!reaction;
      const ratingValue = reaction ? reaction.ratingValue : 0; // ✅ include rating
      const { authorId, ...rest } = feed;

      return { ...rest, authorDetails: authorId, isReacted, ratingValue };
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

exports.postReactionServices = async (req) => {
  try {
    const userId = req.user.sub;
    const { feedId } = req.params;
    const { type, ratingValue } = req.body;

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

    // Check feed exists
    const feed = await Feed.findById(feedId)
      .populate("authorId", "name profile_image username email role")
      .lean();
    if (!feed) {
      return {
        status: false,
        statusCode: 404,
        message: "Feed not found",
        data: {},
      };
    }

    const reactionExist = await Reaction.findOne({
      userId,
      feedId,
    });

    if (reactionExist) {
      reactionExist.ratingValue = ratingValue;
      await reactionExist.save();

      return {
        status: true,
        statusCode: 200,
        message: "Reaction updated successfully",
        data: { ...feed, isReacted: true, ratingValue },
      };
    }

    await Reaction.create({
      userId,
      feedId,
      type,
      ratingValue,
    });

    feed.noOfReactions += 1;
    await feed.save();

    return {
      status: true,
      statusCode: 200,
      message: "Reaction added successfully",
      data: { ...feed, isReacted: true, ratingValue },
    };
  } catch (error) {
    return {
      status: false,
      statusCode: 500,
      message: "Error adding reaction",
      data: { error: error.message },
    };
  }
};

exports.getReactedFeedServices = async (req) => {
  try {
    const currentUserId = new mongoose.Types.ObjectId(req.user.sub);
    const {
      page = 1,
      limit = 10,
      search,
      minRatingValue,
      maxRatingValue,
    } = req.query;
    const skip = (page - 1) * limit;

    // Build reaction match for current user
    const reactionMatch = { userId: currentUserId };

    // Rating filter (numeric only)
    const minVal = parseFloat(minRatingValue);
    const maxVal = parseFloat(maxRatingValue);
    if (!isNaN(minVal) || !isNaN(maxVal)) {
      reactionMatch.ratingValue = {};
      if (!isNaN(minVal)) reactionMatch.ratingValue.$gte = minVal;
      if (!isNaN(maxVal)) reactionMatch.ratingValue.$lte = maxVal;
    }

    const pipeline = [
      { $match: reactionMatch },

      // Join Feed
      {
        $lookup: {
          from: "feeds",
          localField: "feedId",
          foreignField: "_id",
          as: "feed",
        },
      },
      { $unwind: "$feed" },

      // Optional search filter on feed content
      ...(search && search.trim() !== ""
        ? [{ $match: { "feed.content": { $regex: search, $options: "i" } } }]
        : []),

      // Join Feed Author
      {
        $lookup: {
          from: "users",
          localField: "feed.authorId",
          foreignField: "_id",
          as: "author",
        },
      },
      { $unwind: "$author" },

      // Project feed at root + include rating
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: [
              "$feed",
              {
                authorDetails: {
                  _id: "$author._id",
                  name: "$author.name",
                  profile_image: { $ifNull: ["$author.profile_image", ""] }, // default empty string
                  username: "$author.username",
                  email: "$author.email",
                  role: "$author.role",
                  company_name: "$author.company_name",
                  about_company: "$author.about_company",
                },
                isReacted: true,
                rating: "$ratingValue", // ✅ include rating value
              },
            ],
          },
        },
      },

      // Sort & paginate
      { $sort: { createdAt: -1 } },
      { $skip: parseInt(skip) },
      { $limit: parseInt(limit) },
    ];

    const feeds = await Reaction.aggregate(pipeline);

    return {
      status: true,
      statusCode: 200,
      message: "Reacted feeds fetched successfully",
      data: feeds,
    };
  } catch (error) {
    return {
      status: false,
      statusCode: 500,
      message: "Error fetching reacted feeds",
      data: { error: error.message },
    };
  }
};
