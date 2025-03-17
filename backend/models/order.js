const mongoose = require("mongoose")


const orderSchema = new mongoose.Schema({
    clientID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, "Order must have a client ID"]
    },
    gigID : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "gigs",
        required: [true , "Order must have a gig ID"]
    },
    freelancerID : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, "Order must have a freelancer ID"]
    },
    selectedPackage : {
        type : [String],
        enum : ["basic" , "standard" , "premium"],
        default : "basic",
        required: [true, "Order must have a selectedPackage"]
    },
    status : {
        type : String,
        enum : ["pending" , "completed" , "cancelled"],
        default : "pending"
    },
    createdAt : {
        type : Date
    },
    deliveryTime : {
        type : Date
    }
})

orderSchema.pre("save" , function(next) {
    this.set({createdAt: Date.now()})
    next()
})


const order = mongoose.model("orders", orderSchema, "orders")

module.exports = order;

