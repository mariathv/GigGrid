const { promisify } = require('util');
const user = require("../models/user");
const jwt = require("jsonwebtoken");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");

const signTokken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
}

exports.register = catchAsync(async (req, res, next) => {
  const newUser = await user.create({
    email: req.body.email,
    name: req.body.name,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    userType: req.body.userType,
  });

  const token = signTokken(newUser._id)

  res.status(201).json({
    status: "success",
    token,
    data: {
      user: newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  //1. Check if email and password exist
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Please provide email and password", 400));
  }

  const existingUser = await user.findOne({ email }).select("+password");

  if(!existingUser || !(await existingUser.correctPassword(password , existingUser.password))){
    return next(new AppError("Incorrect Email or Password"))
  }

  const token = signTokken(existingUser._id);

  res.status(200).json({
    status: "success",
    token,
    data: {
      user: existingUser,
    },
  });
});

exports.protect = catchAsync(async (req , res , next) => {

  //1.getting Token and check if it exits
  console.log("--------->" , req.header.authorization)
  let token;
  if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if(!token) {
    return next(new AppError("You are not logged in! Please login in to get access" , 401));
  }

  //2. Verification Token
  const decoded = await promisify(jwt.verify)(token , process.env.JWT_SECRET);

  //3. Check if user still exists
  const freshUser = await  user.findById(decoded.id)
  if(!freshUser) {
    return next(new AppError("The user belonging to this token no longer exist" , 401));
  }

  //4. Check if user changed after the token was issued
  if(freshUser.changedPasswordAfter(decoded.iat)) {
    return next(new AppError('user recently change password! please login again' , 401))
  }

  req.user = freshUser;
  next()
})

exports.restrictTo = (...roles) => {
  return (req , res , next) => {
    if(!roles.includes(req.user.userType)) {
      return next(new AppError("You do not have permissions to perform this action" , 403));
    }

    next()
  }
}

