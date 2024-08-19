const mongoose = require('mongoose');

const codeSchema = new mongoose.Schema({
    code: {
        type: String,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    problem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Problem",
    },
    status: {
        type: String, 
        enum: ["Not Attempted", "Attempted", "Solved"],
        default: "Not Attempted",
    },
});

module.exports = mongoose.model("Code", codeSchema);