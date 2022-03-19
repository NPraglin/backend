// Schema to make users object
const Place = require('./place');
const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true,     minlength: 6},
    image: {type: String, required: true},
    places: [{type: String, required: true}]
});

// Mongoose function to plugin the validator which validates our email field
// userSchema.plugin(uniqueValidator);


// Mongoose specific model export for schemas
module.exports = mongoose.model('User', userSchema);