const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
    },
    phone:{
        type:String,
        required:true,
    },
    image:{
        type:String,
        required:true,
        default:Date.now,
    }
});

module.exports = mongoose.model('user',userSchema)