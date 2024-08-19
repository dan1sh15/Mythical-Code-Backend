const mongoose = require('mongoose');

const userScoreSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    score: {
        type: Number,
        default: 0,
    },
});

const contestSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    problems: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Problem",
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now,
    },
    expiresIn: {
        type: Number,
        required: true,
    },
    users: [userScoreSchema],
});

module.exports = mongoose.model('Contest', contestSchema);