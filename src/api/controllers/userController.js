const { sendResponse } = require("../../utility/responseFormat");
const { step1Services, step2Services } = require("../services/userServices");

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
