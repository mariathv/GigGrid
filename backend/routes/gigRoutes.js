const express = require("express");
const gigController = require("./../controllers/gigController");
const authController = require("./../controllers/authController");

const router = express.Router();

router.route("/").get();

router.route("/add").post(authController.protect,gigController.addGig);

router.route("/:id").get().patch().delete();

module.exports = router