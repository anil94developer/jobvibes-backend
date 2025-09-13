module.exports = (schema, params = "body") => async (req, res, next) => {
    try {
        const check = await schema.validate(req[params]);

        if (check.error) {
            return res.status(200).json({
                status: false,
                subCode: 500,
                message: check.error.details[0].message,
            })
        } else {
            next();
        }

    } catch (error) {

        return res.status(200).json({
            status: false,
            subCode: 500,
            message: error.message
        })
    }
}