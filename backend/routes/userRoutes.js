const express = require("express");
const userController = require("./../controllers/userController");
const authController = require("./../controllers/authController");
const multer = require("multer");
const { GridFsStorage } = require("multer-gridfs-storage");

const dotenv = require("dotenv");

dotenv.config({
  path: "./config.env",
});

const router = express.Router();

const storage = new GridFsStorage({
  url: process.env.DATABASE.replace(
    "<PASSWORD>",
    process.env.DATABASE_PASSWORD
  ),
  file: (req, file) => {
    return {
      filename: `${Date.now()}-${file.originalname}`,
      bucketName: "newBucket",
    };
  },
});

const upload = multer({ storage });

router.post("/auth/register", authController.register);

router.post("/auth/login", authController.login);

// Get current authenticated user
router.get(
  "/user/me", 
  authController.protect, 
  userController.getCurrentUser
);

//will add authentication middleware here later
router.post(
  "/user/:userid/pfp-upload",
  upload.single("file"),
  userController.uploadPfp
);

router.get("/user/:userid/pfp", userController.getPfp);

router.get("/user/:userid", userController.getUser);


router.put(
  "/users/update",
  authController.protect,
  userController.updateUser
);

module.exports = router;

/*
    userController -> common
    freelancerController -> specific
    clientController -> specific

*/
