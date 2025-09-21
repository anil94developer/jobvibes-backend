const { sendResponse } = require("../../utility/responseFormat");
const {
  postFeedServices,
  getFeedServices,
  postReactionServices,
  getReactedFeedServices,
  getExploreFeedServices,
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
