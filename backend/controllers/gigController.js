const gig = require("./../models/gig");
const Order = require("./../models/order")
const Review = require("./../models/review")
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const APIFeatures = require("./../utils/apiFeatures")

exports.addGig = catchAsync(async (req, res, next) => {
    req.body.userID = req.user._id;

    const newGig = await gig.create(req.body);

    res.status(201).json({
        status: "success",
        requestedAt: req.requestTime,
        data: {
            newGig
        }
    })
})

exports.getAllGigs = catchAsync(async (req, res, next) => {
    const features = new APIFeatures(gig.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();

    const allGigs = await features.query;

    // Fetch average rating and total reviews per gig
    const ratings = await Review.aggregate([
        {
            $lookup: {
                from: "orders",
                localField: "orderID",
                foreignField: "_id",
                as: "order"
            }
        },
        { $unwind: "$order" },
        {
            $group: {
                _id: "$order.gigID",
                averageRating: { $avg: "$rating" },
                totalReviews: { $sum: 1 }
            }
        }
    ]);

    const ratingMap = {};
    ratings.forEach((rating) => {
        ratingMap[rating._id.toString()] = {
            averageRating: rating.averageRating,
            totalReviews: rating.totalReviews
        };
    });

    // Fetch total orders per gig
    const orderCounts = await Order.aggregate([
        {
            $group: {
                _id: "$gigID",
                totalOrders: { $sum: 1 }
            }
        }
    ]);

    const orderCountMap = {};
    orderCounts.forEach((order) => {
        orderCountMap[order._id.toString()] = order.totalOrders;
    });

    // Combine gig data with stats
    const allGigsWithStats = allGigs.map((gig) => {
        const rating = ratingMap[gig._id.toString()] || { averageRating: 0, totalReviews: 0 };
        const totalOrders = orderCountMap[gig._id.toString()] || 0;

        return {
            ...gig.toObject(),
            averageRating: Number(rating.averageRating.toFixed(1)),
            totalReviews: rating.totalReviews,
            totalOrders: totalOrders
        };
    });
    let finalGigs = [...allGigsWithStats];

    if (req.query.sort === "averageRating") {
        finalGigs.sort((a, b) => b.averageRating - a.averageRating);
    }


    res.status(200).json({
        status: "success",
        requestedAt: req.requestTime,
        length: finalGigs.length,
        data: {
            allGigs: finalGigs
        }
    });
});




exports.getMyGigs = catchAsync(async (req, res, next) => {
    const userID = req.user._id;

    const myGigs = await gig.find({ userID });

    const ratings = await Review.aggregate([
        {
            $lookup: {
                from: "orders",
                localField: "orderID",
                foreignField: "_id",
                as: "order"
            }
        },
        { $unwind: "$order" },
        {
            $group: {
                _id: "$order.gigID",
                averageRating: { $avg: "$rating" },
                totalReviews: { $sum: 1 }
            }
        }
    ]);

    const ratingMap = {};
    ratings.forEach((rating) => {
        ratingMap[rating._id.toString()] = {
            averageRating: rating.averageRating,
            totalReviews: rating.totalReviews
        };
    });

    const orderCounts = await Order.aggregate([
        {
            $group: {
                _id: "$gigID",
                totalOrders: { $sum: 1 }
            }
        }
    ]);

    const orderCountMap = {};
    orderCounts.forEach((order) => {
        orderCountMap[order._id.toString()] = order.totalOrders;
    });

    const myGigsWithStats = myGigs.map((gig) => {
        const rating = ratingMap[gig._id.toString()] || { averageRating: 0, totalReviews: 0 };
        const totalOrders = orderCountMap[gig._id.toString()] || 0;

        return {
            ...gig.toObject(),
            averageRating: Number(rating.averageRating.toFixed(1)),
            totalReviews: rating.totalReviews,
            totalOrders: totalOrders
        };
    });

    res.status(200).json({
        status: "success",
        requestedAt: req.requestTime,
        totalGigs: myGigsWithStats.length,
        data: {
            myGigs: myGigsWithStats
        }
    });
});


exports.getGig = catchAsync(async (req, res, next) => {
    const thisGig = await gig.findById(req.params.id);

    if (!thisGig) {
        return next(new AppError("No account found with that ID", 404));
    }

    res.status(200).json({
        status: "success",
        requestedAt: req.requestTime,
        data: {
            thisGig,
        },
    });

})

exports.updateGig = catchAsync(async (req, res, next) => {
    let thisGig = await gig.findById(req.params.id);

    console.log("user id ", req.user._id)
    console.log("check id", thisGig.userID)

    if (!thisGig) {
        return next(new AppError("No account found with that ID", 404));
    }


    if (thisGig.userID.toString() !== req.user._id.toString()) {
        return next(new AppError("You do not have permission to perform this action", 401));
    }



    thisGig = await gig.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    })

    res.status(200).json({
        status: "success",
        requestedAt: req.requestTime,
        data: {
            thisGig,
        },
    });
})

exports.deleteGig = catchAsync(async (req, res, next) => {
    let thisGig = await gig.findById(req.params.id);

    if (!thisGig) {
        return next(new AppError("No account found with that ID", 404));
    }

    if (!thisGig.userID.equals(req.user._id)) {
        return next(new AppError("Dont do this 😒", 401))
    }

    thisGig = await gig.findByIdAndDelete(req.params.id);


    res.status(201).json({
        status: "success",
        requestedAt: req.requestTime,
        data: {
            thisGig
        }
    })
})

exports.getReviewsByGigID = catchAsync(async (req, res, next) => {
    const gigID = req.params.id;

    const orders = await Order.find({ gigID });

    if (!orders || orders.length === 0) {
        res.status(200).json({
            status: "fail",
            results: 0,
            data: {
            }
        });
    }

    const orderIDs = orders.map(order => order._id);

    const reviews = await Review.find({ orderID: { $in: orderIDs } });

    if (!reviews || reviews.length === 0) {
        res.status(200).json({
            status: "fail",
            results: 0,
            data: {
            }
        });
    }

    res.status(200).json({
        status: "success",
        results: reviews.length,
        data: {
            reviews
        }
    });
});

exports.getFreelancerMonthlyEarnings = catchAsync(async (req, res, next) => {

    const freelancerID = req.user._id;


    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 59);

    const completedOrders = await Order.find({
        freelancerID,
        status: 'completed',
        createdAt: { $gte: startOfMonth, $lte: endOfMonth }
    });

    let totalEarnings = 0;

    for (const order of completedOrders) {
        const Gig = await gig.findById(order.gigID);
        if (!Gig) continue;

        const selectedPackageType = order.selectedPackage[0];
        const selectedPackage = Gig[selectedPackageType];

        totalEarnings += selectedPackage?.price || 0;
    }

    res.status(200).json({
        status: 'success',
        totalEarnings,
        completedOrders: completedOrders.length,
        month: startOfMonth.toLocaleString('default', { month: 'long' }),
        year: startOfMonth.getFullYear()
    });
});