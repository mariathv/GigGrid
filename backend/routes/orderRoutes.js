const express = require("express");
const orderController = require("./../controllers/orderController");
const authController = require("./../controllers/authController");

const router = express.Router();

router
  .route("/")
  .post(
    authController.protect,
    authController.restrictTo("Client"),
    orderController.createOrder
  );

router
  .route("/client")
  .get(
    authController.protect,
    authController.restrictTo("Client"),
    orderController.getClientOrders
  );

router
  .route("/freelancer")
  .get(
    authController.protect,
    authController.restrictTo("Freelancer"),
    orderController.getFreelancerOrders
  );

router
  .route("/:id")
  .get(
    authController.protect,
    authController.restrictTo("Freelancer", "Client"),
    orderController.getOrder
  );

router
  .route("/:id/confirm")
  .patch(
    authController.protect,
    authController.restrictTo("Freelancer"),
    orderController.confirmOrder
  );

module.exports = router;
