// Schema to make users object

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const placeSchema = new Schema({
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true,     minlength: 6},
    image: {type: String, required: true},
    places: {type: String, required: true},
});

// Mongoose specific model export for schemas
module.exports = mongoose.model('Place', placeSchema);