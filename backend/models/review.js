const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  orderID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "order",
    required: [true, "rerview must have a orderID"],
  },
  rating : {
    type : Number,
    min : 1,
    max : 5,
    default : 5,
    required: [true, "review must have a rating"]
  },
  comment : {
    type :String,
    maxlength : 100
  }
});

const review = mongoose.model("reviews" , reviewSchema , "reviews");

module.exports = review
