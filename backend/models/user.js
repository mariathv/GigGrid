const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs")

const userSchema = new mongoose.Schema({
    email : {
        type : String,
        require : [true , "A user must have a email"],
        unique : true,
        lowercase : true,
        validator : [validator.isEmail , "Please provide a valid email"]
    },
    name : {
        type : String,
        requires : [true , "A user must have a name"],   
    },
    password : {
        type : String,
        required : [true , "A user must have a password"],
        minlength : 7,
        select : false
    },
    passwordConfirm : {
        type : String,
        required : [true , "A user must have a password"],
        validate : {
            validator : function(el) {
                return el === this.password;
            },
            message : "passwords are not same"
        }
    },
    userType : {
        type : String,
        enum : ["Freelancer" , "Client"],
        default : "Client"
    },
    passwordChangedAt:Date
})

userSchema.methods.correctPassword = async function(candidatePasword , userPassword) {
    return await bcrypt.compare(candidatePasword , userPassword);
}

userSchema.pre("save" , async function(next) {
    //do not update password if the user is updated  ..  dont do this 😁 
    if(!this.isModified("password")) return next()
    this.password = await bcrypt.hash(this.password , 12);
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