const { candidateStep1Services } = require("../services/candidateServices");

exports.candidateStep1Controller = async (req, res, next) => {
  try {
    console.log(
      "Request parameters in candidateStep1Controller controller:--",
      req.body
    );
    const data = await candidateStep1Services(req);
    res.send(data);
    console.log(
      "Response parameters in candidateStep1Controller controller:--",
      data
    );
  } catch (error) {
    console.log("Error in candidateStep1Controller controller:--", error);
    next(error);
  }
};
