const express = require("express");
const gigController = require("./../controllers/gigController");
const authController = require("./../controllers/authController");

const router = express.Router();

router.route("/").get(gigController.getAllGigs);

router
  .route("/add")
  .post(
    authController.protect,
    authController.restrictTo("Freelancer"),
    gigController.addGig
  );

router
  .route("/:id")
  .get(gigController.getGig)
  .patch(
    authController.protect,
    authController.restrictTo("Freelancer"),
    gigController.deleteGig
  )
  .delete(
    authController.protect,
    authController.restrictTo("Freelancer"),
    gigController.deleteGig
  );

module.exports = router;
