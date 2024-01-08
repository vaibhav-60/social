const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async (req, res, next) => {
    if (
        !req.headers ||
        !req.headers.authorization ||
        !req.headers.authorization.startsWith("Bearer")
    ) {
        return res.status(401).send('Authorization header is require');
    }

    const accessToken = req.headers.authorization.split(" ")[1];


    try {

        const verify = jwt.verify(accessToken, process.env.ACCESS_TOKEN_PRIVATE_KEY)
        req._id = verify._id;

        const user = await User.findById(req._id);
        if (!user) {
            return res.send(error(404, 'User Not found'));
        }

        next();
    } catch (e) {
        console.log(e);
        return res.status(401).send('Invalid Access Key');
    }

};