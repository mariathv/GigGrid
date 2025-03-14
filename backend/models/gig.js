const mongoose = require("mongoose")
const slugify = require("slugify")
const validator = require("validator")
const bcrypt = require("bcryptjs")

const packageSchema = new mongoose.Schema({
    description: {
        type: String,
        maxlength: 500
    },
    price: {
        type: Number,
        required: [true, "A Package must have a price"]
    },
    deliveryTime: {
        type: Number, // Corrected the typo from 'Type' to 'type'
        required: [true, "A Package must have a delivery time"],
        default : 1
    },
    numberOfRevisions: {
        type: Number,
        required: [true, "A Package must have revision"],
        default : 1
    },
    featuresIncluded: {
        type: [String],
        default: []
    }
});

const gigSchema = new mongoose.Schema({
    title : {
        type : String,
        required : [true , "A gig must have a title"]
    },
    slug : String,
    description : {
        type : String,
        required : [true , "A gig must have a title"],
        maxlength : 1000,
        minlength : 50
    },
    category : {
        type : String,
        enum : ["Graphic Design" , "Writing" , "Web Development" , "Mobile Development" , "Digital Marketing" , "Video Editing"],
        default : "None"
    },
    tags : {
        type : [String],
        default : []
    },
    basic: packageSchema,
    standard: packageSchema,
    premium: packageSchema,
    images : {
        type : [String],
        default : []
    },
    userID : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User',
        required : [true , "Gig must have a user ID"]
    }
})

gigSchema.pre("save" , function(next) {
    this.slug = slugify(this.title , {lower : true})
    next()
})

const gig = mongoose.model("gigs" , gigSchema , "gigs")

module.exports = gig;