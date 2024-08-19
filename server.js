// Load environment variables from .env file
require('dotenv').config();
const express = require("express");
const app = express();
const Port = process.env.PORT || 8000;
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const cron = require('node-cron');

const runCodeRoute = require("./routes/runCode");
const problemsRoute = require("./routes/problemsRoute");
const authRoute = require('./routes/auth');
const contesRoutes = require('./routes/contest');

app.use(
    cors({
        origin: "*",
    })
);

// Connect to database
require('./config/db');

// Parse request bodies as JSON
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/api', problemsRoute);
app.use("/api", runCodeRoute);
app.use('/api', contesRoutes);
app.use('/api', authRoute);

// function to clean the file buffer
const codesDir1 = path.join(__dirname, './codes');
const codesDir2 = path.join(__dirname, './playground');
const maxAge = 5 * 60 * 1000;

function deleteOldFiles() {
    fs.readdir(codesDir1, (err, files) => {
        if (err) {
            console.error('Failed to list files in codes directory:', err);
            return;
        }

        files.forEach(file => {
            const filePath = path.join(codesDir1, file);
            fs.stat(filePath, (err, stats) => {
                if (err) {
                    console.error('Failed to get file stats:', err);
                    return;
                }

                // Ensure that the path is a file (not a directory)
                if (stats.isFile()) {
                    const now = Date.now();
                    const fileAge = now - stats.mtimeMs;

                    if (fileAge > maxAge) {
                        fs.unlink(filePath, err => {
                            if (err) {
                                console.error('Failed to delete file:', err);
                            } else {
                                console.log(`Deleted old file: ${filePath}`);
                            }
                        });
                    }
                }
            });
        });
    });

    fs.readdir(codesDir2, (err, files) => {
        if (err) {
            console.error('Failed to list files in codes directory:', err);
            return;
        }

        files.forEach(file => {
            const filePath = path.join(codesDir2, file);
            fs.stat(filePath, (err, stats) => {
                if (err) {
                    console.error('Failed to get file stats:', err);
                    return;
                }

                // Ensure that the path is a file (not a directory)
                if (stats.isFile()) {
                    const now = Date.now();
                    const fileAge = now - stats.mtimeMs;

                    if (fileAge > maxAge) {
                        fs.unlink(filePath, err => {
                            if (err) {
                                console.error('Failed to delete file:', err);
                            } else {
                                console.log(`Deleted old file: ${filePath}`);
                            }
                        });
                    }
                }
            });
        });
    });
}

setInterval(deleteOldFiles,5 * 60 * 1000); 

const Contest = require('./models/Contest');
cron.schedule('* * * * *', async () => {
    const now = new Date();
    const expiredContests = await Contest.find({
        $expr: {
            $lt: [{ $add: ["$createdAt", { $multiply: ["$expiresIn", 3600000] }] }, now]
        }
    });

    expiredContests.forEach(async (contest) => {
        await Contest.findByIdAndDelete(contest._id);
        console.log(`Deleted contest: ${contest.name}`);
    });
});


// Start server and listen to specified port
app.listen(Port, () => console.log(`Listening to Port ${Port}`));