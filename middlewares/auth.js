const jwt = require('jsonwebtoken');

exports.auth = async (req, res, next) => {
    try {
        const token = req.header('auth-token') || req.body.token;

        if(!token) {
            return res.status(400).json({
                success: false,
                message: "Token not found",
            });
        }

        try {
            const decode = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decode;
        } catch (error) {
            console.log(error);
            return res.status(400).json({
                success: false,
                message: "Invalid token",
            });
        }
        next();
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while validating token",
        });
    }
};

exports.isAdmin = async (req, res, next) => {
    try {
        if(req.user.role !== "Admin") {
            return res.status(400).json({
                success: false,
                message: "This is a protected route for admins only",
            });
        }

        next();
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "User role can't be verified, please try again",
        });        
    }
};