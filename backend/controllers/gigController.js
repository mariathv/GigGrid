const gig = require("./../models/gig");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");

exports.addGig = catchAsync (async (req , res , next) => {
    const newGig = await gig.create(req.body);

    res.status(201).json({
        status : "success",
        requestedAt : req.requestTime,
        data : {
            newGig
        }
    })
})