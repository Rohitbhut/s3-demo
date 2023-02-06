const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require('bcryptjs');
const jwt=require('jsonwebtoken');
const Documents = require('../models/documents');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error("Invalid email address");
            }
        },
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minLength: 6,
        validate(value) {
            if (value.toLowerCase().includes("password")) {
                throw new Error('Password connot containt "password"');
            }
        },
    },
    tokens:[{
        token:{
            type: String,
            required: true,
        }
    }],
    avatar:{
        type:Buffer
    }
},{
    timestamps:true
});

//Vatuale Field
userSchema.virtual('documents',{
    ref:'Documents',
    localField:'_id',
    foreignField:'owner'
});

// Hidden output params
userSchema.methods.toJSON = function(){
    const user=this;
    const userObject=user.toObject();
    delete userObject.password;
    delete userObject.tokens;
    delete userObject.avatar;
    return userObject;
};
//JWT Token
userSchema.methods.generateAuthToken= async function(){
    const user=this;
    const token =jwt.sign({'_id':user._id.toString()},process.env.JWT_SECRET);
    user.tokens=user.tokens.concat({token});
    await user.save();
    return token;
};

// User login
userSchema.statics.findByIdCredentials = async(email,password) => {
    const user = await User.findOne({email});
    if(!user){
        throw new Error('Unable to login');
    }
    const isMatch=await bcrypt.compare(password,user.password);
    if(!isMatch){
        throw new Error('Unable to login');
    }
    return user;
};
// Plain taxt to hash password created
userSchema.pre('save',async function(next){
    const user=this;
    if(user.isModified('password')){
        user.password=await bcrypt.hash(user.password,8);
    }
    next();
});

//Delete All task realted to user
userSchema.pre('remove',async function(next){
    const user=this;
    await Documents.deleteMany({ owner:user._id });
    next();
});


const User = mongoose.model("User", userSchema);
module.exports = User;