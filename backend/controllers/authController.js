const user = require("../models/user");

exports.register = async (req, res, next) => {
  try {
    const newUser = await user.create({
      email: req.body.email,
      name: req.body.name,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      userType: req.body.userType
    });

    const token = "";

    res.status(201).json({
      status: "success",
      token,
      data: {
        user: newUser,
      },
    });
  } catch (err) {
    console.log(err.message);
    res.status(400).json({
      status: "fail",
      token,
      data: {
        err
      },
    });
  }
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next()
  }

  const user = await User.findOne({ email }).select('+password');


};
