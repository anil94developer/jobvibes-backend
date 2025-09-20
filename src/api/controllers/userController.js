const { sendResponse } = require("../../utility/responseFormat");
const {
  step1Services,
  step2Services,
  step3Services,
  uploadServices,
  skillsServices,
  updateProfileServices,
  getProfileServices,
  getUserFeedServices,
} = require("../services/userServices");

exports.step1Controller = async (req, res, next) => {
  try {
    console.log("Request body in step1Controller:--", req.body);
    const data = await step1Services(req);
    sendResponse(res, data);
    console.log("Response in step1Controller:--", data);
  } catch (error) {
    console.log("Error in step1Controller:--", error);
    next(error);
  }
};

exports.step2Controller = async (req, res, next) => {
  try {
    console.log("Request body in step2Controller:--", req.body);
    const data = await step2Services(req);
    sendResponse(res, data);
    console.log("Response in step2Controller:--", data);
  } catch (error) {
    console.log("Error in step2Controller:--", error);
    next(error);
  }
};

exports.step3Controller = async (req, res, next) => {
  try {
    console.log("Request body in step3Controller:--", req.body);
    const data = await step3Services(req);
    sendResponse(res, data);
    console.log("Response in step3Controller:--", data);
  } catch (error) {
    console.log("Error in step3Controller:--", error);
    next(error);
  }
};

exports.uploadController = async (req, res, next) => {
  try {
    console.log("Request body in uploadController:--", req.body);
    const data = await uploadServices(req);
    sendResponse(res, data);
    console.log("Response in uploadController:--", data);
  } catch (error) {
    console.log("Error in uploadController:--", error);
    next(error);
  }
};

exports.skillsController = async (req, res, next) => {
  try {
    console.log("Request body in skillsController:--", req.body);
    const data = await skillsServices(req);
    sendResponse(res, data);
    console.log("Response in skillsController:--", data);
  } catch (error) {
    console.log("Error in skillsController:--", error);
    next(error);
  }
};

exports.updateController = async (req, res, next) => {
  try {
    console.log("Request body in updateController:--", req.body);
    const data = await updateProfileServices(req);
    sendResponse(res, data);
    console.log("Response in updateController:--", data);
  } catch (error) {
    console.log("Error in updateController:--", error);
    next(error);
  }
};

exports.getProfileController = async (req, res, next) => {
  try {
    console.log("Request body in getProfileController:--", req.body);
    const data = await getProfileServices(req);
    sendResponse(res, data);
    console.log("Response in getProfileController:--", data);
  } catch (error) {
    console.log("Error in getProfileController:--", error);
    next(error);
  }
};

exports.getFeedController = async (req, res, next) => {
  try {
    console.log("Request body in getFeedController:--", req.body);
    const data = await getUserFeedServices(req);
    sendResponse(res, data);
    console.log("Response in getFeedController:--", data);
  } catch (error) {
    console.log("Error in getFeedController:--", error);
    next(error);
  }
};
