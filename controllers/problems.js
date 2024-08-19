const Problem = require("../models/Problem");
const executeCpp = require('../judges/executeCpp');
const executePy = require("../compiler/executePython");
const generateFile = require('../compiler/generateFile');
const path = require("path");
const User = require('../models/User');
const Code = require("../models/Code");

exports.addProblem = async (req, res) => {
    try {
        let problem = new Problem({...req.body, slug: "a"});
        await problem.save();
        res.status(201).json({
            success: true,
            message: "Problem added successfully",
            problem
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

exports.getAllProblems = async (req, res) => {
    try {
        const problems = await Problem.find({});

        return res.status(200).json({
            success: true,
            message: "Problems fetched successfully",
            data: problems
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
};

exports.getProblem = async (req, res) => {
    try {
        const id = req.params.id;

        if(!id) {
            return res.status(400).json({
                success: false,
                message: "Id not found",
            });
        }

        const problem = await Problem.findById(id);

        return res.status(200).json({
            success: true,
            message: "Problem fetched successfully",
            problem
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

exports.checkProblem = async (req, res) => {
    try {
        let slug = req.params.slug;
        const problem = await Problem.findOne({ slug });
        const userId = req.user.id;
        //console.log(problem.output);
        if (!problem) {
            return res.status(400).json({ 
                success: false,
                message: "No Problem Found" 
            });
        }
        // else return res.status(200).json(problem);
        const { lang, code } = req.body;
        if (!code) {
            return res.status(400).json({ 
                success: false,
                message: "Empty Code Body" 
            });
        }


        const filePath = await generateFile(lang, code);
        // console.log("File path", filePath);
        
        var inputPath = `${path.join(__dirname, '../inputs/')}`;
        inputPath=inputPath+`${slug}.txt`;
        let userOutput;
        if (lang === "cpp") {
            console.log("input path", inputPath);
            userOutput = await executeCpp(filePath, inputPath);
        }
        else if (lang == "py") {
            userOutput = await executePy(filePath, inputPath);
        }
        // console.log("aa", userOutput)
        userOutput = userOutput.trim()
        userOutput = userOutput.replace(/\r/g, '');
        console.log(JSON.stringify(userOutput));
        console.log("---");
        let problemOutput = problem.output.trim();
        console.log(JSON.stringify(problemOutput));
        const user = await User.findByIdAndUpdate(userId, {
            $push: {
                problems: problem._id,
            }
        }, {new: true}).populate('problems').exec();

        const existingCode = await Code.findOne({
            user: userId,
            problem: problem._id,
        });
        let updatedCode;
        if(existingCode) {
            updatedCode = await Code.findOneAndUpdate({
                user: userId,
                problem: problem._id,
            }, { code: code }, {new: true});
        } else {
            updatedCode = await Code.create({
                code,
                user: userId,
                problem: problem._id,
            });
        }

        if (userOutput === problemOutput) {
            updatedCode = await Code.findByIdAndUpdate(updatedCode._id, {
                status: "Solved"
            }, {new: true});
            return res.status(200).json({
                success: true,
                message: "All test case passed",
                output: userOutput,
                user,
                code: updatedCode,
            });
        }
        else {
            updatedCode = await Code.findByIdAndUpdate(updatedCode._id, {
                status: "Attempted",
            }, { new: true });
            return res.status(200).json({
                success: false,
                output: userOutput,
                message: "Failing in Hidden Test Case",
            });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error,
        });
    }
};

exports.getProblemCode = async (req, res) => {
    try {
        let slug = req.params.slug;
        const problem = await Problem.findOne({ slug });
        const userId = req.user.id;

        const codeData = await Code.findOne({
            user: userId,
            problem: problem._id,
        });

        if(!codeData) {
            return res.status(200).json({
                success: false,
                message: "Code data not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Code data found",
            code: codeData,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};