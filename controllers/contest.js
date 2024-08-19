const Contest = require('../models/Contest');

exports.createContest = async (req, res) => {
    try {
        const { name, expiresIn } = req.body;

        if(!name || !expiresIn) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        const contest = await Contest.create({
            name,
            expiresIn: expiresIn+0.25,
        });

        return res.status(200).json({
            success: true,
            message: "Contest created successfully",
            contest
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

exports.addProblemToContest = async (req, res) => {
    try {
       const { problemId, contestId } = req.body;
       console.log("PRoblem", problemId);
       console.log("Contest", contestId); 
       
       
       if(!contestId || !problemId) {
            return res.status(400).json({
                success: false,
                message: "All fields are required", 
            });
       }

       const contest = await Contest.findById(contestId);
       if(!contest) {
        return res.status(400).json({
            success: false,
            message: "Contest not found",
        });
       } 

       const updatedContest = await Contest.findByIdAndUpdate(contestId, {
        $push: {
            problems: problemId
        }
       }, { new: true }).populate('problems', 'users.user').exec();

       if(!updatedContest) {
        return res.status(400).json({
            success: false,
            message: "Problem cannot be added please try again",
        });
       }

       return res.status(200).json({
        success: true,
        message: "Problem added successfully",
        contest: updatedContest,
       });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

exports.removeProblem = async (req, res) => {
    try {
        const { problemId, contestId } = req.body;
        if(!problemId || !contestId) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        const contest = await Contest.findById(contestId);
        if(!contest) {
            return res.status(400).json({
                success: false,
                message: "Contest not found",
            });
        }

        const updatedContest = await Contest.findByIdAndUpdate(contestId, {
            $pull: {
                problems: problemId,
            }
        }, { new: true });

        return res.status(200).json({
            success: true,
            message: "Problem removed successfully",
            contest: updatedContest,
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

exports.getProblems = async (req, res) => {
    try {
        const contestId = req.params.id;

        if(!contestId) {
            return res.status(400).json({
                success: false,
                message: "Contest id not found",
            });
        }

        const problems = await Contest.findById(contestId).populate('problems').exec();

        return res.status(200).json({
            success: true,
            message: "Problems fetched successfully",
            problems
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

exports.addUser = async (req, res) => {
    try {
        const { userId, contestId } = req.body;
        console.log(userId, contestId);
        

        if(!userId || !contestId) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        const contest = await Contest.findById(contestId);

        if(!contest) {
            return res.status(400).json({
                success: false,
                message: "Contest not found",
            });
        }

        if(contest.users.length !== 0) {
            const userExist = contest.users.some(user => user.user._id.toString() === userId.toString());
            console.log("USer exist", userExist);
            
            if(userExist) {
                return res.status(400).json({
                    success: false,
                    message: "User is already registered",
                });
            }
        }

        const newContest = await Contest.findByIdAndUpdate(contestId, {
            $push: {
                users: {
                    user: userId,
                }
            }
        }, {new: true}).populate('users.user').exec();

        if(!newContest) {
            return res.status(400).json({
                success: false,
                message: "Cannot add user to the contest",
            });
        }

        return res.status(200).json({
            success: true,
            message: "User added successfully",
            contest: newContest
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

exports.addScore = async (req, res) => {
    try {
        const { userId, contestId, score } = req.body;

        if(!userId || !contestId || !score) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        const contest = await Contest.updateOne({
            _id: contestId,
            "users.user": userId
        }, { $inc: {
            "users.$.score": score
        } }, { new: true }).populate("users.user").exec();

        if(!contest) {
            return res.status(400).json({
                success: false,
                message: "Cannot update score"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Score updated successfully",
            contest,
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

exports.getLeaderBoard = async (req, res) => {
    try {
        const contestId = req.params.id;

        const contest = await Contest.findById(contestId).populate("users.user").exec();

        const leaderBoard = contest?.users.sort((a, b) => b.score - a.score).map((entry, index) => ({
            rank: index+1,
            user: entry.user.name,
            score: entry.score
        }));

        return res.status(200).json({
            success: true,
            message: "Leaderboard fetched successfully",
            leaderBoard,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

exports.getContest = async (req, res) => {
    try {
        const contests = await Contest.find({});
        return res.status(200).json({
            success: true,
            message: "Contest fetched successfully",
            contests,
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

exports.getContestById = async (req, res) => {
    try {
        const contestId = req.params.id;
        if(!contestId) {
            return res.status(400).json({
                success: false,
                message: "Contest Id does not exist",
            });
        }
        const contest = await Contest.findById(contestId).populate('problems').exec();
        return res.status(200).json({
            success: true,
            message: "Contest details fetched successfully",
            contest,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        })
    }
};