const Order = require("./../models/order")
const Gig = require('./../models/gig');
const Chat = require('./../models/chat');
const catchAsync = require("./../utils/catchAsync")
const AppError = require("./../utils/appError");
const e = require("express");
const APIFeatures = require("./../utils/apiFeatures")
const Review = require('../models/review');

exports.createOrder = catchAsync(async (req, res, next) => {
    const { gigID, selectedPackage } = req.body; 
    const clientID = req.user._id

    if (!gigID || !clientID || !selectedPackage) {
        return next(new AppError('gigID, clientID, and selectedPackage are required', 400));
    }

    const gig = await Gig.findById(gigID);
    if (!gig) {
        return next(new AppError('No gig found with that ID', 404));
    }

    const packageDetails = gig[selectedPackage];
    if (!packageDetails) {
        return next(new AppError('Invalid package type selected', 400));
    }

    const currentTime = new Date();
    const deliveryTime = new Date(currentTime.getTime() + packageDetails.deliveryTime * 24 * 60 * 60 * 1000)

    const newOrder = await Order.create({
        gigID,
        clientID,
        freelancerID: gig.userID,
        selectedPackage,
        status: "pending",
        createdAt: currentTime,
        deliveryTime: deliveryTime
    })

    // Create a new chat for this order
    await Chat.create({
        freelancer: gig.userID,
        client: clientID,
        orderId: newOrder._id,
        messages: []
    });

    res.status(201).json({
        status: 'success',
        data: {
            order: newOrder,
        },
    });
})

exports.getClientOrders = catchAsync(async (req, res, next) => {
    const clientID = req.user._id;

    let features = new APIFeatures(Order.find({ clientID }), req.query)
        .sort()
        .limit()

    const clientOrders = await features.query;

    const ordersWithGigDetails = await Promise.all(
        clientOrders.map(async (order) => {
            const gig = await Gig.findById(order.gigID);

            if (!gig) {
                return next(new AppError(`Gig not found for order ID: ${order._id}`, 404));
            }

            const selectedPackageType = order.selectedPackage[0];
            const selectedPackage = gig[selectedPackageType];

            return {
                _id: order._id,
                clientID: order.clientID,
                freelancerID: order.freelancerID,
                status: order.status,
                createdAt: order.createdAt,
                deliveryTime: order.deliveryTime,
                gig: {
                    title: gig.title,
                    description: gig.description,
                    category: gig.category,
                    tags: gig.tags,
                    images: gig.images,
                    rating: gig.rating,
                    minPrice: gig.minPrice,
                    selectedPackage: {
                        type: selectedPackageType,
                        description: selectedPackage.description,
                        price: selectedPackage.price,
                        deliveryTime: selectedPackage.deliveryTime,
                        numberOfRevisions: selectedPackage.numberOfRevisions,
                        featuresIncluded: selectedPackage.featuresIncluded,
                    }
                }
            };
        })
    );

    res.status(200).json({
        status: 'success',
        results: ordersWithGigDetails.length,
        data: {
            orders: ordersWithGigDetails
        }
    });
});


exports.getFreelancerOrders = catchAsync(async (req, res, next) => {
    const freelancerID = req.user._id;

    const features = new APIFeatures(Order.find({ freelancerID }), req.query)
        .sort()
        .limit();

    const freelancerOrders = await features.query;

    const ordersWithGigAndReview = await Promise.all(
        freelancerOrders.map(async (order) => {
            const gig = await Gig.findById(order.gigID);
            if (!gig) {
                return next(new AppError(`Gig not found for order ID: ${order._id}`, 404));
            }

            const selectedPackageType = order.selectedPackage[0];
            const selectedPackage = gig[selectedPackageType];

            const review = await Review.findOne({ orderID: order._id });

            return {
                _id: order._id,
                clientID: order.clientID,
                freelancerID: order.freelancerID,
                status: order.status,
                createdAt: order.createdAt,
                deliveryTime: order.deliveryTime,
                gig: {
                    title: gig.title,
                    description: gig.description,
                    category: gig.category,
                    tags: gig.tags,
                    images: gig.images,
                    rating: gig.rating,
                    minPrice: gig.minPrice,
                    selectedPackage: {
                        type: selectedPackageType,
                        description: selectedPackage.description,
                        price: selectedPackage.price,
                        deliveryTime: selectedPackage.deliveryTime,
                        numberOfRevisions: selectedPackage.numberOfRevisions,
                        featuresIncluded: selectedPackage.featuresIncluded,
                    }
                },
                review: review
                    ? {
                        rating: review.rating,
                        comment: review.comment
                    }
                    : null
            };
        })
    );

    res.status(200).json({
        status: 'success',
        results: ordersWithGigAndReview.length,
        data: {
            orders: ordersWithGigAndReview
        }
    });
});

exports.getOrder = catchAsync(async (req, res, next) => {
    const orderID = req.params.id;
    const userID = req.user._id;

    const order = await Order.findById(orderID);

    if (!order) {
        return next(new AppError(`Order not found for order ID: ${orderID}`, 404))
    }

    //check if user requesting belong to this order
    if (userID.toString() != order.clientID.toString() && userID.toString() != order.freelancerID.toString()) {
        return next(new AppError(`You are not authorized to access this order`, 403));
    }

    const gig = await Gig.findById(order.gigID);

    if (!gig) {
        return next(new AppError(`Gig not found for order ID: ${order._id}`, 404));
    }

    const selectedPackageType = order.selectedPackage[0];
    const selectedPackage = gig[selectedPackageType];

    const response = {
        _id: order._id,
        clientID: order.clientID,
        freelancerID: order.freelancerID,
        status: order.status,
        createdAt: order.createdAt,
        deliveryTime: order.deliveryTime,
        gig: {
            title: gig.title,
            description: gig.description,
            category: gig.category,
            tags: gig.tags,
            selectedPackage: {
                type: selectedPackageType,
                description: selectedPackage.description,
                price: selectedPackage.price,
                deliveryTime: selectedPackage.deliveryTime,
                numberOfRevisions: selectedPackage.numberOfRevisions,
                featuresIncluded: selectedPackage.featuresIncluded,
            }
        }
    };

    res.status(200).json({
        status: 'success',
        data: {
            orders: response
        }
    });
})


exports.confirmOrder = catchAsync(async (req, res, next) => {
    const orderID = req.params.id;
    const userID = req.user._id;

    const order = await Order.findById(orderID);

    if (!order) {
        return next(new AppError(`Order not found for order ID: ${orderID}`, 404));
    }

    if (userID.toString() !== order.freelancerID.toString()) {
        return next(new AppError(`You are not authorized to confirm this order`, 403));
    }

    order.status = "completed";
    await order.save();

    res.status(200).json({
        status: "success",
        message: "Order confirmed successfully",
        data: {
            order
        }
    });
})


exports.cancelOrder = catchAsync(async (req, res, next) => {
    const orderID = req.params.id;
    const userID = req.user._id;

    const order = await Order.findById(orderID);

    if (!order) {
        return next(new AppError(`Order not found for order ID: ${orderID}`, 404));
    }

    if (userID.toString() !== order.freelancerID.toString()) {
        return next(new AppError(`You are not authorized to cancel this order`, 403));
    }

    if (order.status === "completed") {
        return next(new AppError(`You cannot cancel a completed order`, 400));
    }

    order.status = "cancelled";
    await order.save();

    res.status(200).json({
        status: "success",
        message: "Order cancelled successfully",
        data: {
            order
        }
    });
});



