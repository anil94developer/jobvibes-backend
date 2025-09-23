const mongoose = require("mongoose");

const User = require("../../models/userSchema");
const Feed = require("../../models/feedSchema");
const Reaction = require("../../models/reactionSchema");
const notificationEmitter = require("../../emitter/notificationEmitter");
const { getPaginatedResults } = require("../../utility/paginate");

// --- postFeed Profile Service ---
exports.postFeedServices = async (req) => {
  try {
    const userId = req.user.sub;
    const {
      content,
      media,
      job_title,
      work_place_name,
      job_type,
      cities,
      notice_period,
      is_immediate_joiner,
    } = req.body;

    // ✅ 1. Check user exists
    const user = await User.findById(userId);
    if (!user) {
      return {
        status: false,
        statusCode: 404,
        message: "User not found",
        data: {},
      };
    }

    // ✅ 2. Create feed
    const feed = await Feed.create({
      authorId: userId,
      authorRole: user.role,
      content,
      media,
      job_title,
      work_place_name,
      job_type,
      cities,
      notice_period,
      is_immediate_joiner,
    });

    // ✅ 3. Populate author details
    const populatedFeed = await Feed.findById(feed._id)
      .populate("authorId", "name profile_image username email role")
      .lean();

    // ✅ 4. Rename authorId -> authorDetails & add isReacted
    const { authorId, ...rest } = populatedFeed;
    const feedResponse = {
      ...rest,
      authorDetails: authorId,
      isReacted: false, // just created, current user hasn't reacted yet
    };

    // ✅ 5. Send notification
    notificationEmitter.emit("sendFeedNotification", {
      title: "New Feed",
      body: content ? content.substring(0, 100) : "New post available!",
      token: user.fcm_token,
      posted_by: user._id,
      data: {
        type: "feed",
        feedId: feed._id,
      },
    });

    user.status = "active";
    user.is_feed_posted = true;
    await user.save();

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

// --- getFeed Service (POST API) ---
exports.getFeedServices = async (req) => {
  try {
    const currentUserId = req.user.sub;

    // Fetch current user's role
    const currentUser = await User.findById(currentUserId).lean();
    if (!currentUser) {
      return {
        status: false,
        statusCode: 404,
        message: "User not found",
        data: {},
      };
    }
    const currentRole = currentUser.role;

    // Extract filters from body
    const {
      search,
      state = [],
      city = [],
      job_title = [],
      job_type = [],
      page = 1,
      limit = 10,
    } = req.body;

    // Ensure all filters are arrays
    const stateArr = Array.isArray(state) ? state : [state].filter(Boolean);
    const cityArr = Array.isArray(city) ? city : [city].filter(Boolean);
    const jobTitleArr = Array.isArray(job_title)
      ? job_title
      : [job_title].filter(Boolean);
    const jobTypeArr = Array.isArray(job_type)
      ? job_type
      : [job_type].filter(Boolean);

    // Build filters
    const filter = {
      authorId: { $ne: currentUserId }, // 🚫 exclude self
    };

    // Role-based visibility
    if (currentRole === "employer") {
      filter.authorRole = "candidate";
    } else if (currentRole === "candidate") {
      filter.authorRole = "employer";
    }

    // Additional filters
    if (search) filter.$or = [{ content: { $regex: search, $options: "i" } }];
    if (stateArr.length) filter.state = { $in: stateArr };
    if (cityArr.length) filter.cities = { $in: cityArr };
    if (jobTitleArr.length) filter.job_title = { $in: jobTitleArr };
    if (jobTypeArr.length) filter.job_type = { $in: jobTypeArr };

    // ✅ Use common pagination
    const paginated = await getPaginatedResults(Feed, filter, {
      page,
      limit,
      sort: { createdAt: -1 },
      populate: {
        path: "authorId",
        select:
          "name profile_image username email role company_name about_company",
      },
      lean: true,
    });

    if (!paginated.status) return paginated;

    const feeds = paginated.data.results;
    const feedIds = feeds.map((f) => f._id);

    // Get reactions by current user
    const userReactions = await Reaction.find({
      userId: currentUserId,
      feedId: { $in: feedIds },
    }).lean();

    const reactionMap = {};
    userReactions.forEach((r) => {
      reactionMap[r.feedId.toString()] = r;
    });

    // Attach extras
    const feedsWithExtras = feeds.map((feed) => {
      const reaction = reactionMap[feed._id.toString()];
      const isReacted = !!reaction;
      const ratingValue = reaction ? reaction.ratingValue : 0;
      const { authorId, ...rest } = feed;

      return { ...rest, authorDetails: authorId, isReacted, ratingValue };
    });

    return {
      status: true,
      statusCode: 200,
      message: "Feeds fetched successfully",
      data: {
        feeds: feedsWithExtras,
        pagination: paginated.data.pagination,
      },
    };
  } catch (err) {
    return {
      status: false,
      statusCode: 500,
      message: "Error fetching feeds",
      data: { error: err.message },
    };
  }
};

// --- Explore Feed Service (POST API) ---
exports.getExploreFeedServices = async (req) => {
  try {
    const currentUserId = req.user.sub;

    // Fetch current user's role
    const currentUser = await User.findById(currentUserId).lean();
    if (!currentUser) {
      return {
        status: false,
        statusCode: 404,
        message: "User not found",
        data: {},
      };
    }

    // Extract filters from body
    const { page = 1, limit = 10 } = req.query;

    // Build filters
    const filter = {
      authorId: { $ne: currentUserId }, // 🚫 exclude self
    };

    // ✅ Use common pagination
    const paginated = await getPaginatedResults(Feed, filter, {
      page,
      limit,
      sort: { createdAt: -1 },
      populate: {
        path: "authorId",
        select:
          "name profile_image username email role company_name about_company",
      },
      lean: true,
    });

    if (!paginated.status) return paginated;

    const feeds = paginated.data.results;
    const feedIds = feeds.map((f) => f._id);

    // Get reactions by current user
    const userReactions = await Reaction.find({
      userId: currentUserId,
      feedId: { $in: feedIds },
    }).lean();

    const reactionMap = {};
    userReactions.forEach((r) => {
      reactionMap[r.feedId.toString()] = r;
    });

    // Attach extras
    const feedsWithExtras = feeds.map((feed) => {
      const reaction = reactionMap[feed._id.toString()];
      const isReacted = !!reaction;
      const ratingValue = reaction ? reaction.ratingValue : 0;
      const { authorId, ...rest } = feed;

      return { ...rest, authorDetails: authorId, isReacted, ratingValue };
    });

    return {
      status: true,
      statusCode: 200,
      message: "Feeds fetched successfully",
      data: {
        feeds: feedsWithExtras,
        pagination: paginated.data.pagination,
      },
    };
  } catch (err) {
    return {
      status: false,
      statusCode: 500,
      message: "Error fetching feeds",
      data: { error: err.message },
    };
  }
};

exports.postReactionServices = async (req) => {
  try {
    const userId = req.user.sub;
    const { feedId } = req.params;
    const { type, ratingValue } = req.body;

    // ✅ Check user exists
    const user = await User.findById(userId);
    if (!user) {
      return {
        status: false,
        statusCode: 404,
        message: "User not found",
        data: {},
      };
    }

    if (user.is_feed_posted === false) {
      return {
        status: false,
        statusCode: 400,
        message: "You cannot react to this post",
        data: {},
      };
    }

    // ✅ Check feed exists
    const feed = await Feed.findById(feedId).populate(
      "authorId",
      "name profile_image username email role fcm_token"
    );
    if (!feed) {
      return {
        status: false,
        statusCode: 404,
        message: "Feed not found",
        data: {},
      };
    }

    // 🚫 Prevent user from reacting to their own feed
    if (feed.authorId._id.toString() === userId.toString()) {
      return {
        status: false,
        statusCode: 400,
        message: "You cannot react to your own post",
        data: {},
      };
    }

    // ✅ Check if reaction exists
    const reactionExist = await Reaction.findOne({ userId, feedId: feedId });

    if (reactionExist) {
      reactionExist.ratingValue = ratingValue;
      await reactionExist.save();

      return {
        status: true,
        statusCode: 200,
        message: "Reaction updated successfully",
        data: { ...feed.toObject(), isReacted: true, ratingValue },
      };
    }

    // ✅ Create new reaction
    await Reaction.create({
      userId,
      feedId: feedId,
      type,
      ratingValue,
    });

    feed.noOfReactions += 1;
    await feed.save();

    // 🔔 Send notification to feed author
    notificationEmitter.emit("sendUserNotification", {
      title: "New Feed Reaction",
      body: `${user.name} rated your feed.`,
      posted_by: feed.authorId._id,
      data: { type: "reaction", feedId: feed._id.toString() },
    });

    return {
      status: true,
      statusCode: 200,
      message: "Reaction added successfully",
      data: { ...feed.toObject(), isReacted: true, ratingValue },
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
                ratingValue: "$ratingValue", // ✅ include rating value
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
