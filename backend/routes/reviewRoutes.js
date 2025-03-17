const express = require("express");
const reviewController = require("./../controllers/reviewController");
const authController = require("./../controllers/authController");

const router = express.Router();

router
  .route("/:id")
  .post(
    authController.protect,
    authController.restrictTo("Client"),
    reviewController.postReview
  );


module.exports = router;
