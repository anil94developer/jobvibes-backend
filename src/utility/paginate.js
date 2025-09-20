// utils/pagination.js
exports.getPaginatedResults = async (Model, filter = {}, options = {}) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = { createdAt: -1 },
      select = "",
      populate = null,
      lean = true,
    } = options;

    const skip = (page - 1) * limit;

    let query = Model.find(filter).sort(sort).skip(skip).limit(parseInt(limit));

    if (select) query = query.select(select);
    if (populate) query = query.populate(populate);
    if (lean) query = query.lean();

    const [results, total] = await Promise.all([
      query.exec(),
      Model.countDocuments(filter),
    ]);

    return {
      status: true,
      message: "Fetched successfully",
      data: {
        results: results || [], // ✅ always an array
        pagination: {
          total,
          totalPages: Math.ceil(total / limit),
          page: parseInt(page),
          limit: parseInt(limit),
        },
      },
    };
  } catch (err) {
    return {
      status: false,
      message: "Pagination failed",
      data: {
        results: [],
        pagination: { total: 0, totalPages: 0, page: 1, limit: 10 },
        error: err.message,
      },
    };
  }
};
