const { sendResponse } = require("../../utility/responseFormat");
const {
  postFeedServices,
  getFeedServices,
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
