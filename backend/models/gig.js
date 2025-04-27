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
        required: [true, "A Package must have a price"],
        min: [5, "Price must be at least $5"],
        max: [10000, "Price cannot exceed $10,000"],
        validate: {
            validator: function(value) {
                // Check if the value is numeric and within range
                return !isNaN(value) && typeof value === 'number';
            },
            message: "Price must be numeric"
        }
    },
    deliveryTime: {
        type: Number,
        required: [true, "A Package must have a delivery time"],
        min: [1, "Delivery time must be at least 1 day"],
        max: [90, "Delivery time cannot exceed 90 days"],
        validate: {
            validator: function(value) {
                // Check if the value is a whole number
                return Number.isInteger(value);
            },
            message: "Delivery time must be a whole number"
        }
    },
    numberOfRevisions: {
        type: Number,
        required: [true, "A Package must have revision"],
        default: 1
    },
    featuresIncluded: {
        type: [String],
        default: []
    },

});

const gigSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "A gig must have a title"],
            minlength: [5, "Title too short - minimum 5 characters required"],
            maxlength: [70, "Title too long - maximum 70 characters allowed"],
            validate: {
                validator: function(value) {
                    return value.length >= 5 && value.length <= 70;
                },
                message: props => 
                    props.value.length < 5 ? "Title too short" :
                    props.value.length > 70 ? "Title too long" :
                    "Invalid title length"
            }
        },
        slug: String,
        description: {
            type: String,
            required: [true, "A gig must have a description"],
            maxlength: [5000, "Message exceeds maximum length"],
            minlength: [1, "Message cannot be empty"],
            validate: {
                validator: function(value) {
                    return value.length >= 1 && value.length <= 5000;
                },
                message: props => 
                    props.value.length < 1 ? "Message cannot be empty" :
                    props.value.length > 5000 ? "Message exceeds maximum length" :
                    "Invalid message length"
            }
        },
        category: {
            type: String,
            enum: [
                "Graphic Design",
                "Writing",
                "Web Development",
                "Mobile Development",
                "Digital Marketing",
                "Video Editing",
            ],
            default: "None",
        },
        tags: {
            type: [String],
            default: [],
        },
        basic: {
            type: packageSchema,
            required: [true, "Basic package is required"],
        },
        standard: {
            type: packageSchema,
            required: [true, "Standard package is required"],
        },
        premium: {
            type: packageSchema,
            required: [true, "Premium package is required"],
        },
        images: {
            type: [String],
            default: [],
        },
        orders: {
            type: Number,
            default: 0,
        },
        rating: {
            type: Number,
            default: 0,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        userID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, "Gig must have a user ID"]
        },
        minPrice: { 
            type: Number, 
            default: 0 
        }
    },
    {
        timestamps: true,
    }
);

gigSchema.pre("save", function (next) {
    this.slug = slugify(this.title, { lower: true })
    this.minPrice = Math.min(this.basic.price, this.standard.price, this.premium.price);
    next()
})

const gig = mongoose.model("gigs", gigSchema, "gigs")

module.exports = gig;