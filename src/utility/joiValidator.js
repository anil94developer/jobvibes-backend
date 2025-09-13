module.exports =
  (schema, params = "body") =>
  (req, res, next) => {
    try {
      const { error } = schema.validate(req[params], { abortEarly: false });

      if (error) {
        return res.status(400).json({
          status: false,
          subCode: 400,
          message: error.details.map((d) => d.message).join(", "),
        });
      }

      next();
    } catch (err) {
      return res.status(500).json({
        status: false,
        subCode: 500,
        message: err.message,
      });
    }
  };
