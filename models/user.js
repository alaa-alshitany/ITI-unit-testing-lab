const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    fullName:{
        type: String,
        required: true,
    },
    age:{
        type: Number,
        required: true,
    } ,
    job: {
        type: String,
        required: true,
    }
});

module.exports = mongoose.model('User', userSchema);