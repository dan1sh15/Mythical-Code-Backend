const executeCpp = require('../compiler/executeCpp');
const executePy = require('../compiler/executePython');
const generateFile = require("../compiler/generateFile")

const runCodeController = async (req, res) => {
    try {
        const { lang, code, input } = req.body;

        if (!code) {
            res.status(400).json({ "message": "Empty Code Body" });
            return;
        }

        const filePath = await generateFile(lang, code);

        // console.log(input);

        if (lang === "cpp") {
            const output = await executeCpp(filePath, input);
            //console.log(output);
            return res.status(200).json({
                success: true,
                message: "Code executed successfully",
                output
            });
        }

        if(lang == "py") {
            const output = await executePy(filePath, input);
            return res.status(200).json({
                success: true,
                message: "Code executed successfully",
                output
            });
        }

        return res.status(200).json({
            success: false,
            message: "Something went wrong while executing code"
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error
        });
    }
}

module.exports = runCodeController;