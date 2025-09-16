const { sendResponse } = require("../../utility/responseFormat");
const { getNotificationServices } = require("../services/notificationServices");

exports.getNotificationsController = async (req, res, next) => {
  try {
    console.log("Request body in getNotificationsController:--", req.body);
    const data = await getNotificationServices(req);
    sendResponse(res, data);
    console.log("Response in getNotificationsController:--", data);
  } catch (error) {
    console.log("Error in getNotificationsController:--", error);
    next(error);
  }
};
