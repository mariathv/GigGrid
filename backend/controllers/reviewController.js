const Review = require("./../models/review");
const Order = require("./../models/order")
const catchAsync = require("./../utils/catchAsync")
const AppError = require("./../utils/appError")

exports.postReview = catchAsync(async (req, res, next) => {
    const { rating, comment } = req.body;
    const userID = req.user._id;
    const orderID = req.params.id

    const order = await Order.findById(orderID);

    if (!order) {
        return next(new AppError(`Order not found for order ID: ${orderID}`, 404));
    }

    if (userID.toString() !== order.clientID.toString()) {
        return next(new AppError(`You are not authorized to review this order`, 403));
    }

    if (order.status !== "completed") {
        return next(new AppError(`You can only review a completed order`, 400));
    }
    const existingReview = await Review.findOne({ orderID });
    if (existingReview) {
        return next(new AppError(`A review already exists for this order`, 400));
    }

    // Create the review
    const newReview = await Review.create({
        orderID,
        rating,
        comment
    });

    res.status(201).json({
        status: "success",
        message: "Review posted successfully",
        data: {
            review: newReview
        }
    });
});


