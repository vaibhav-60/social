const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const { error, success } = require("../utils/responseWrapper");

const signupController = async (req, res) => {

    try {
        const { name, email, password } = req.body;
        if (!email || !password || !name) {
            // return res.status(400).send('email and password are required! ');
            res.send(error(404, 'email and password are fucking required!'))
        }
        const olduser = await User.findOne({ email });
        if (olduser) {
            // return res.status(409).send('email already registered');
            return res.send(error(409, 'email already registered'));
        }

        const hashedpassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedpassword,
        })

        return res.send(success(201, 'user created successfully'));
    }
    catch (e) {
        return res.send(error(500, e.message));
    }

}

const loginController = async (req, res) => {

    try {
        const { email, password } = req.body;
        if (!email || !password) {
            // return res.status(400).send('email and password are required! ');
            return res.send(error(404, 'email and password are fucking required!'))
        }
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            // return res.status(409).send('user not found');
            return res.send(error(409, 'user not found'))
        }

        const matched = await bcrypt.compare(password, user.password);
        if (!matched) {
            // return res.status(403).send('incorrect password');
            return res.send(error(403, 'incorrect password'))
        }

        const accesstoken = generateacesstoken({ _id: user._id, });
        const refreshtoken = generaterefreshtoken({ _id: user._id, });


        res.cookie('jwt', refreshtoken, {
            httpOnly: true,
            secure: true
        })


        return res.send(success(200, { accesstoken, }));
    }
    catch (error) {
        console.log(error)
    }

}
const refreshAccessTokenController = async (req, res) => {
    const cookies = req.cookies;
    if (!cookies.jwt) {
        // return res.status(401).send("Refresh token in cookie is required");
        return res.send(error(401, "Refresh token in cookie is required"));
    }

    const refreshtoken = cookies.jwt;

    console.log('refressh', refreshtoken);

    try {
        const decoded = jwt.verify(
            refreshtoken,
            process.env.REFRESH_TOKEN_PRIVATE_KEY
        );

        const _id = decoded._id;
        const accesstoken = generateaccesstoken({ _id });

        return res.send(success(201, { accesstoken }));
    } catch (e) {
        console.log(e);
        // return res.status(401).send("Invalid refresh token");
        return res.send(error(401, "Invalid refresh token"));
    }
};

const logOutController = async (req, res) => {

    try {

        res.clearCookie('jwt', {
            httpOnly: true,
            secure: true
        })

        return res.send(success(200, 'user logged out'))


    } catch (e) {
        return res.send(error(500, e.message));
    }
}


const generateacesstoken = (data) => {
    try {
        const token = jwt.sign(data, process.env.ACCESS_TOKEN_PRIVATE_KEY, {
            expiresIn: "1d",
        });
        console.log(token);
        return token;
    } catch (e) {
        console.log(e);
    }

}

const generaterefreshtoken = (data) => {
    try {
        const token = jwt.sign(data, process.env.REFRESH_TOKEN_PRIVATE_KEY, {
            expiresIn: "1y",
        });
        console.log(token);
        return token;
    } catch (e) {
        console.log(e);
    }

}

module.exports = {
    signupController,
    loginController,
    refreshAccessTokenController,
    logOutController
}