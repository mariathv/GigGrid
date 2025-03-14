const gig = require("./../models/gig");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");


exports.addGig = catchAsync (async (req , res , next) => {
    req.body.userID = req.user._id;

    const newGig = await gig.create(req.body);

    res.status(201).json({
        status : "success",
        requestedAt : req.requestTime,
        data : {
            newGig
        }
    })
})

exports.getAllGigs = catchAsync (async (req , res , next) => {
    const allGigs = await gig.find()

    res.status(200).json({
        status: "success",
        requestedAt: req.requestTime,
        data: {
            allGigs,
        },
    });
})

exports.getGig = catchAsync (async (req , res , next) => {
    const thisGig = await gig.findById(req.params.id);

    if(!thisGig) {
        return next(new AppError("No account found with that ID"));
    }

    res.status(200).json({
        status: "success",
        requestedAt: req.requestTime,
        data: {
            thisGig,
        },
    });

})

exports.updateGig = catchAsync (async (req , res , next) => {
    const thisGig = await gig.findById(req.params.id);

    if(!thisGig) {
        return next(new AppError("No account found with that ID"));
    }

    if(thisGig.userID != req.user._id) {
        return next(new AppError("Dont do this 😒" , 401))
    }

    thisGig = await gig.findByIdAndUpdate(req.params.id , req.body , {
        new : true,
        runValidators : true
    })

    res.status(200).json({
        status: "success",
        requestedAt: req.requestTime,
        data: {
          accounts,
        },
    });
})

exports.deleteGig = catchAsync (async (req , res , next) => {
    let thisGig = await gig.findById(req.params.id);

    console.log("user ID -> " , req.user._id)
    console.log("gig user ID => " , )

    if(!thisGig) {
        return next(new AppError("No account found with that ID"));
    }

    if(!thisGig.userID.equals(req.user._id)) {
        return next(new AppError("Dont do this 😒" , 401))
    }

    thisGig = await gig.findByIdAndDelete(req.params.id);


    res.status(201).json({
        status : "success",
        requestedAt : req.requestTime,
        data : {
            thisGig
        }
    })
})