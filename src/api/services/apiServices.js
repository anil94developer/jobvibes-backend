const User = require("../../models/userSchema");
const Job = require("../../models/jobSchema");
const Match = require("../../models/matchSchema");
const Message = require("../../models/messageSchema");

exports.createUserServices = async (req, res) => {
    try {
        const { phone_number, email } = req.body;

        const check = await User.findOne({
            $or: [
                { email: email },
                { phone_number: phone_number }
            ]
        });

        if (check) {
            const message = email === check.email ? "Email already registered" : "Phone number already registered";
            return {
                status: true,
                message: message,
                data: {
                    user_id: check._id,
                    user_name: check.user_name,
                    phone_number: check.phone_number,
                    email: check.email
                }
            }
        }

        const userData = await User.create(req.body);


        return {
            status: true,
            message: "User registered successfully",
            data: {
                user_id: userData._id,
                user_name: userData.user_name,
                phone_number: userData.phone_number,
                email: userData.email
            }
        }

    } catch (error) {
        console.error('An error occurred register user services:', error);

        return {
            status: false,
            message: error.message,
            data: {}
        }

    }
}

exports.signInUserServices = async (req, res) => {
    try {
        const { email, password } = req.body;

        const check = await User.findOne({
            email: email,
            password: password
        });

        if (!check || check === null) {
            return {
                status: false,
                message: "Please sign-in with correct credentials",
                data: {}
            }
        }

        return {
            status: true,
            message: "User sign in successfully",
            data: {
                user_id: check._id,
                user_name: check.user_name,
                phone_number: check.phone_number,
                email: check.email
            }
        }

    } catch (error) {
        console.error('An error occurred sign-in user services:', error);

        return {
            status: false,
            message: error.message,
            data: {}
        }

    }
}

exports.userListServices = async (req, res) => {
    try {

        const result = await User.find({}, { _id: 1, user_name: 1, email: 1, phone_number: 1 });

        return {
            status: true,
            message: result ? "All users listed" : " No users listed",
            data: result || result.length > 0 ? result : []
        }

    } catch (error) {
        console.error('An error occurred register user services:', error);

        return {
            status: false,
            message: error.message,
            data: {}
        }

    }
}

exports.editUserServices = async (req, res) => {
    try {
        const { phone_number, email } = req.body;

        const check = await User.findOne({
            $or: [
                { email: email },
                { phone_number: phone_number }
            ]
        });

        if (check) {
            const message = email === check.email ? "Email already exists" : "Phone number already exists";
            return {
                status: true,
                message: message,
                data: {
                    user_id: check._id,
                    user_name: check.user_name,
                    phone_number: check.phone_number,
                    email: check.email
                }
            }
        }

        const userData = await User.create(req.body);


        return {
            status: true,
            message: "User data edit successfully",
            data: {
                user_id: userData._id,
                user_name: userData.user_name,
                phone_number: userData.phone_number,
                email: userData.email
            }
        }

    } catch (error) {
        console.error('An error occurred edit user services:', error);

        return {
            status: false,
            message: error.message,
            data: {}
        }

    }
}


exports.addUserServices = async (req, res) => {
    try {
        const { phone_number, email } = req.body;

        const check = await User.findOne({
            $or: [
                { email: email },
                { phone_number: phone_number }
            ]
        });

        if (check) {
            const message = email === check.email ? "Email already exists" : "Phone number already exists";
            return {
                status: true,
                message: message,
                data: {
                    user_id: check._id,
                    user_name: check.user_name,
                    phone_number: check.phone_number,
                    email: check.email
                }
            }
        }

        const userData = await User.create(req.body);


        return {
            status: true,
            message: "User added successfully",
            data: {
                user_id: userData._id,
                user_name: userData.user_name,
                phone_number: userData.phone_number,
                email: userData.email
            }
        }

    } catch (error) {
        console.error('An error occurred add User services:', error);

        return {
            status: false,
            message: error.message,
            data: {}
        }

    }
}

exports.editUserServices = async (req, res) => {
    try {
        const { phone_number, email, user_name, userId } = req.body;

        const check = await User.findOneAndUpdate({ _id: userId }, {
            phone_number: phone_number, email: email, user_name: user_name
        });

        if (!check) {
            return {
                status: false,
                message: "Data not found",
                data: {}
            }
        }

        return {
            status: true,
            message: "User added successfully",
            data: check
        }

    } catch (error) {
        console.error('An error occurred add User services:', error);

        return {
            status: false,
            message: error.message,
            data: {}
        }

    }
}

exports.getUserServices = async (req, res) => {
    try {

        const userId = req.query.userId;

        const check = await User.findById(userId, { _id: 1, user_name: 1, email: 1, phone_number: 1 });

        return {
            status: true,
            message: check ? `User data fetched successfully` : `Data not found`,
            data: check ? check : {}
        }

    } catch (error) {
        console.error('An error occurred add User services:', error);

        return {
            status: false,
            message: error.message,
            data: {}
        }

    }
}

// Jobs
exports.createJobService = async (req) => {
    try {
        const job = await Job.create(req.body);
        return { status: true, message: 'Job created', data: job };
    } catch (error) {
        return { status: false, message: error.message, data: {} };
    }
}

exports.getJobService = async (req) => {
    try {
        const job = await Job.findById(req.params.id);
        return { status: !!job, message: job ? 'Job fetched' : 'Job not found', data: job || {} };
    } catch (error) {
        return { status: false, message: error.message, data: {} };
    }
}

exports.searchJobsService = async (req) => {
    try {
        const q = req.query.q || '';
        const jobs = await Job.find({ $or: [{ title: new RegExp(q, 'i') }, { skills: { $in: [q] } }] });
        return { status: true, message: 'Jobs list', data: jobs };
    } catch (error) {
        return { status: false, message: error.message, data: [] };
    }
}

// Matches
exports.createMatchService = async (req) => {
    try {
        const match = await Match.create(req.body);
        return { status: true, message: 'Match created', data: match };
    } catch (error) {
        return { status: false, message: error.message, data: {} };
    }
}

exports.listMatchesByCandidateService = async (req) => {
    try {
        const matches = await Match.find({ candidate_id: req.params.id });
        return { status: true, message: 'Matches list', data: matches };
    } catch (error) {
        return { status: false, message: error.message, data: [] };
    }
}

// Messages
exports.sendMessageService = async (req) => {
    try {
        const message = await Message.create(req.body);
        return { status: true, message: 'Message sent', data: message };
    } catch (error) {
        return { status: false, message: error.message, data: {} };
    }
}

exports.listMessagesByMatchService = async (req) => {
    try {
        const messages = await Message.find({ match_id: req.params.id }).sort({ createdAt: 1 });
        return { status: true, message: 'Messages list', data: messages };
    } catch (error) {
        return { status: false, message: error.message, data: [] };
    }
}