const { createUserServices, signInUserServices, userListServices, addUserServices, getUserServices, editUserServices, createJobService, getJobService, searchJobsService, createMatchService, listMatchesByCandidateService, sendMessageService, listMessagesByMatchService } = require("../services/apiServices");

exports.createUserController = async (req, res, next) => {
    try {
        console.log("Request parameters in register user API controller:--", req.body);
        const data = await createUserServices(req);
        res.send(data);
        console.log("Response parameters in register user API controller:--", data);
    } catch (error) {
        console.log("Error in register user API controller:--", error);
        next(error);
    }
};

exports.editUserController = async (req, res, next) => {
    try {
        console.log("Request parameters in edit user API controller:--", req.body);
        const data = await createUserServices(req);
        res.send(data);
        console.log("Response parameters in edit user API controller:--", data);
    } catch (error) {
        console.log("Error in edit user API controller:--", error);
        next(error);
    }
};

exports.signInUserController = async (req, res, next) => {
    try {
        console.log("Request parameters in Sign-in User API controller:--", req.body);
        const data = await signInUserServices(req);
        res.send(data);
        console.log("Response parameters in Sign-in User API controller:--", data);
    } catch (error) {
        console.log("Error in Sign-in User API controller:--", error);
        next(error);
    }
};

exports.userListController = async (req, res, next) => {
    try {
        console.log("Request parameters in User List API controller:--");
        const data = await userListServices(req);
        res.send(data);
        console.log("Response parameters in User List API controller:--", data);
    } catch (error) {
        console.log("Error in User List API controller:--", error);
        next(error);
    }
};

exports.addUserController = async (req, res, next) => {
    try {
        console.log("Request parameters in add User API controller:--", req.body);
        const data = await addUserServices(req);
        res.send(data);
        console.log("Response parameters in add User API controller:--", data);
    } catch (error) {
        console.log("Error in add User API controller:--", error);
        next(error);
    }
};

exports.editUserController = async (req, res, next) => {
    try {
        console.log("Request parameters in edit User API controller:--", req.body);
        const data = await editUserServices(req);
        res.send(data);
        console.log("Response parameters in edit User API controller:--", data);
    } catch (error) {
        console.log("Error in edit User API controller:--", error);
        next(error);
    }
};

exports.getUserController = async (req, res, next) => {
    try {
        console.log("Request parameters in get User API controller:--");
        const data = await getUserServices(req);
        res.send(data);
        console.log("Response parameters in get User API controller:--", data);
    } catch (error) {
        console.log("Error in get User API controller:--", error);
        next(error);
    }
};

// Jobs
exports.createJobController = async (req, res, next) => {
    try {
        const data = await createJobService(req);
        res.send(data);
    } catch (error) { next(error); }
};

exports.getJobController = async (req, res, next) => {
    try {
        const data = await getJobService(req);
        res.send(data);
    } catch (error) { next(error); }
};

exports.searchJobsController = async (req, res, next) => {
    try {
        const data = await searchJobsService(req);
        res.send(data);
    } catch (error) { next(error); }
};

// Matches
exports.createMatchController = async (req, res, next) => {
    try {
        const data = await createMatchService(req);
        res.send(data);
    } catch (error) { next(error); }
};

exports.listMatchesByCandidateController = async (req, res, next) => {
    try {
        const data = await listMatchesByCandidateService(req);
        res.send(data);
    } catch (error) { next(error); }
};

// Messages
exports.sendMessageController = async (req, res, next) => {
    try {
        const data = await sendMessageService(req);
        res.send(data);
    } catch (error) { next(error); }
};

exports.listMessagesByMatchController = async (req, res, next) => {
    try {
        const data = await listMessagesByMatchService(req);
        res.send(data);
    } catch (error) { next(error); }
};