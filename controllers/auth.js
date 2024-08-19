const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.signup = async (req, res) => {
    try {
        const {name, email, password, role} = req.body;
        if(!name || !email || !password || !role) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        // check for duplicate user
        const existingUser = await User.findOne({email});
        if(existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exist, please log in",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role,
        });
        
        const payload = {
            id: user._id,
            email: user.email,
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: '24h',
        });

        return res.status(200).json({
            success: true,
            message: "User created successfully",
            user,
            token
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal Server error",
        });
    }
};

exports.login = async (req, res) => {
    try {
        const {email, password} = req.body;
        if(!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required',
            });
        }

        const user = await User.findOne({email});
        if(!user) {
            return res.status(400).json({
                success: false,
                message: "User not exist, please signup first"
            });
        }

        if(await bcrypt.compare(password, user.password)) {
            const payload = {
                id: user._id,
                email: user.email,
            }

            const token = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn: "24h",
            });

            user.token = token;

            return res.status(200).json({
                success: true,
                message: 'LoggedIn successfully',
                user,
                token,
            });

        } else {
            return res.status(400).json({
                success: false,
                message: "Invalid Password",
            });
        }
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal Server error",
        });   
    }
};

exports.getUser = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await User.findById(userId).populate('problems').exec();

        return res.status(200).json({
            success: true,
            message: "User fetched successfully",
            user,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};