const express = require('express');

const HttpError = require('../models/http-error');

const placesControllers = require('../controller/places-controller');

const router = express.Router();

// Middleware function to return place by placeID
// Function imported from places-controller
router.get('/:pid', placesControllers.getPlaceById)

// Middleware function to return place by userID
// Function imported from places-controller
router.get('/user/:uid', placesControllers.getPlaceByUserId);

// Midleware function handlingg POST requests
router.post('/', placesControllers.createPlace)



module.exports = router;