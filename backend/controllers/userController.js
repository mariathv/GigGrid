const User = require("../models/user")
const { default: mongoose } = require("mongoose")
const { getBucket } = require("../utils/gridfs");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

const userController = {
    uploadPfp: async (req, res) => {
        try {
            const userId = req.params.userid;
            const file = req.file;

            if (!file) return res.status(400).send("No file uploaded");

            const user = await User.findById(userId);
            if (!user) return res.status(404).json({ message: "User not found" });



            if (user.pfp?.fileId) {
                const oldFileId = user.pfp.fileId;

                if (mongoose.Types.ObjectId.isValid(oldFileId)) {
                    try {
                        const bucket = getBucket();
                        await bucket.delete(oldFileId);
                    } catch (err) {
                    }
                } else {
                    console.warn("Skipping deletion: Invalid ObjectId for old file:", oldFileId);
                }

            }


            user.pfp = {
                filename: file.filename,
                fileId: mongoose.Types.ObjectId.isValid(file.id)
                    ? new mongoose.Types.ObjectId(file.id.toString())
                    : file.id,
            };

            const updatedUser = await user.save({ validateBeforeSave: false });

            return res.status(200).json({
                message: "Profile picture uploaded and updated!",
                user: updatedUser,
            });

        } catch (err) {
            console.error("Upload error:", err);
            return res.status(500).send("Upload failed");
        }
    },
    getPfp: async (req, res) => {
        try {
            const userid = req.params.userid;

            const user = await User.findById(userid);
            if (!user || !user.pfp || !user.pfp.fileId) {
                return res.status(404).send("Profile picture not found");
            }

            const fileId = new mongoose.Types.ObjectId(user.pfp.fileId);

            const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
                bucketName: "newBucket",
            });

            const downloadStream = bucket.openDownloadStream(fileId);

            downloadStream.on("error", (err) => {
                console.error("Download stream error:", err);
                return res.status(404).send("Could not retrieve image");
            });

            res.set("Content-Type", "image/jpeg");

            downloadStream.pipe(res);

        } catch (err) {
            console.error("PFP Error:", err);
            res.status(500).send("Internal Server Error");
        }
    },
    updateUser: async (req, res, next) => {
        const { name } = req.body;

        if (!name) {
            return next(new AppError("Name is required", 400));
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            { name },
            { new: true, runValidators: true }
        )

        if (!updatedUser) {
            return next(new AppError("User not found", 400));
        }

        res.status(200).json({
            status: "success",
            data: {
                user: updatedUser
            }
        });
    },
    getUser: async (req, res, next) => {
        try {
            const userId = req.params.userid;

            const user = await User.findById(userId).select("-password");
            if (!user) {
                return next(new AppError("User not found", 404));
            }

            res.status(200).json({
                status: "success",
                data: {
                    user
                }
            });
        } catch (err) {
            console.error("Get user error:", err);
            next(new AppError("Failed to fetch user", 500));
        }
    },
    getCurrentUser: catchAsync(async (req, res, next) => {
        // The user is already authenticated, so req.user should contain the user's ID
        // from the auth middleware
        
        // If somehow user is not authenticated, return error
        if (!req.user || !req.user._id) {
            return next(new AppError('You are not logged in. Please log in to get access.', 401));
        }
        
        // Find the current user by ID
        const user = await User.findById(req.user._id).select('-password');
        
        if (!user) {
            return next(new AppError('The user belonging to this token no longer exists.', 401));
        }
        
        // Send the user data back
        res.status(200).json({
            status: 'success',
            user
        });
    }),
};


module.exports = userController;