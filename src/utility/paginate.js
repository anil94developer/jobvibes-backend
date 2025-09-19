// src/utils/paginate.js
exports.getPaginatedResults = async (model, query = {}, options = {}) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = { createdAt: -1 },
      select = "",
    } = options;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Fetch data
    const results = await model
      .find(query)
      .select(select)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Count total
    const total = await model.countDocuments(query);

    return {
      status: true,
      data: results,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    };
  } catch (err) {
    return {
      status: false,
      message: err.message,
      data: [],
      pagination: {},
    };
  }
};
