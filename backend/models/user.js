const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs")

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, "Email address is required"],
        unique: true,
        lowercase: true,
        validate: [
            {
                validator: validator.isEmail,
                message: "Please provide a valid email address"
            },
            {
                validator: function(email) {
                    // Additional custom validation if needed
                    const domain = email.split('@')[1];
                    // Check if domain has at least one dot
                    return domain && domain.includes('.');
                },
                message: "Email domain appears to be invalid"
            }
        ],
        trim: true
    },
    name: {
        type: String,
        required: [true, "A user must have a name"],
        minlength: [3, "Username too short - minimum 3 characters required"],
        maxlength: [30, "Username too long - maximum 30 characters allowed"],
        validate: {
            validator: function(value) {
                return value.length >= 3 && value.length <= 30;
            },
            message: props => 
                props.value.length < 3 ? "Username too short" :
                props.value.length > 30 ? "Username too long" :
                "Invalid username length"
        }
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [8, "Password too short - minimum 8 characters required"],
        maxlength: [64, "Password too long - maximum 64 characters allowed"],
        validate: [
            {
                validator: function(password) {
                    return /[A-Z]/.test(password);
                },
                message: "Password requires uppercase letter"
            },
            {
                validator: function(password) {
                    return /[0-9]/.test(password);
                },
                message: "Password requires number"
            },
            {
                validator: function(password) {
                    return /[!@#$%^&*(),.?":{}|<>]/.test(password);
                },
                message: "Password requires special character"
            }
        ],
        select: false
    },
    passwordConfirm: {
        type: String,
        required: [true, "A user must have a password"],
        validate: {
            validator: function (el) {
                return el === this.password;
            },
            message: "passwords are not same"
        }
    },
    userType: {
        type: String,
        enum: ["Freelancer", "Client"],
        default: "Client"
    },
    expoPushToken: {
        type: String,
        default: ""
    },
    passwordChangedAt: Date,
    pfp: {
        filename: String,
        fileId: mongoose.Schema.Types.ObjectId
    }
})

userSchema.methods.correctPassword = async function(candidatePasword , userPassword) {
    return await bcrypt.compare(candidatePasword , userPassword);
}

userSchema.pre("save" , async function(next) {
    //do not update password if the user is updated  ..  dont do this 😁 
    if (!this.isModified("password")) return next()
    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;
    next();
})

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
    if(this.passwordChangedAt){
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000 , 10);
        return JWTTimestamp < changedTimestamp
    }
    return false
}


const user = mongoose.model("user" , userSchema , "user");

module.exports = user