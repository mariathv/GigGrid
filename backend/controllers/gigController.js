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

    res.status(200).json({
        status: "success",
        requestedAt: req.requestTime,
        length: allGigs.length,
        data: {
            allGigs,
        },
    });
})

exports.getMyGigs = catchAsync(async (req, res, next) => {
    const myGigs = await gig.find({ userID: req.user._id });

    res.status(200).json({
        status: "success",
        requestedAt: req.requestTime,
        totalGigs: myGigs.length,
        data: {
            myGigs
        }
    });
})

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