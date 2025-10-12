const { sendResponse } = require("../../utility/responseFormat");
const {
  postFeedServices,
  getFeedServices,
  postReactionServices,
  getReactedFeedServices,
  getExploreFeedServices,
  deleteFeedService,
  applyFeedService,
  getApplicantsService,
  editFeedService,
} = require("../services/postFeedServices");

exports.postFeedController = async (req, res, next) => {
  try {
    console.log("Request body in postFeedController:--", req.body);
    const data = await postFeedServices(req);
    sendResponse(res, data);
    console.log("Response in postFeedController:--", data);
  } catch (error) {
    console.log("Error in postFeedController:--", error);
    next(error);
  }
};

exports.getFeedController = async (req, res, next) => {
  try {
    console.log("Request body in getFeedController:--", req.body);
    const data = await getFeedServices(req);
    sendResponse(res, data);
    console.log("Response in getFeedController:--", data);
  } catch (error) {
    console.log("Error in getFeedController:--", error);
    next(error);
  }
};

exports.getExploreFeedController = async (req, res, next) => {
  try {
    console.log("Request body in getExploreFeedController:--", req.body);
    const data = await getExploreFeedServices(req);
    sendResponse(res, data);
    console.log("Response in getExploreFeedController:--", data);
  } catch (error) {
    console.log("Error in getExploreFeedController:--", error);
    next(error);
  }
};

exports.postReactionController = async (req, res, next) => {
  try {
    console.log("Request body in postReactionController:--", req.body);
    const data = await postReactionServices(req);
    sendResponse(res, data);
    console.log("Response in postReactionController:--", data);
  } catch (error) {
    console.log("Error in postReactionController:--", error);
    next(error);
  }
};

exports.getReactedController = async (req, res, next) => {
  try {
    console.log("Request body in getReactedController:--", req.body);
    const data = await getReactedFeedServices(req);
    sendResponse(res, data);
    console.log("Response in getReactedController:--", data);
  } catch (error) {
    console.log("Error in getReactedController:--", error);
    next(error);
  }
};

exports.editFeedController = async (req, res, next) => {
  try {
    console.log("Request body in editFeedController:--", req.body);
    // Assuming editFeedService is a service function to handle the edit logic
    const data = await editFeedService(req);
    sendResponse(res, data);
    console.log("Response in editFeedController:--", data);
  } catch (error) {
    console.log("Error in editFeedController:--", error);
    next(error);
  }
};

exports.deleteFeedController = async (req, res, next) => {
  try {
    console.log("Request body in deleteFeedController:--", req.body);
    const data = await deleteFeedService(req);
    sendResponse(res, data);
    console.log("Response in deleteFeedController:--", data);
  } catch (error) {
    console.log("Error in deleteFeedController:--", error);
    next(error);
  }
};

// New controller for applying to a feed
exports.applyFeedController = async (req, res, next) => {
  try {
    console.log("Request body in applyFeedController:--", req.body);
    // Assuming applyFeedService is a service function to handle the apply logic
    const data = await applyFeedService(req);
    sendResponse(res, data);
    console.log("Response in applyFeedController:--", data);
  } catch (error) {
    console.log("Error in applyFeedController:--", error);
    next(error);
  }
};

exports.getApplicantsController = async (req, res, next) => {
  try {
    console.log("Request body in getApplicantsController:--", req.body);
    // Assuming getApplicantsService is a service function to fetch applicants for a feed
    const data = await getApplicantsService(req);
    sendResponse(res, data);
    console.log("Response in getApplicantsController:--", data);
  } catch (error) {
    console.log("Error in getApplicantsController:--", error);
    next(error);
  }
};
