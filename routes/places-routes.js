const express = require('express');
// Object destructuring is revolutionary
const { check } = require('express-validator');

const placesControllers = require('../controller/places-controller');

const checkAuth = require('../middleware/check-auth');
const s3Upload = require('../middleware/s3-upload');

const router = express.Router();

// Handling rendering ALL places for dev build
router.get('/all', placesControllers.getAllPlaces)

// Middleware function to return place by placeID
// Function imported from places-controller
router.get('/:pid', placesControllers.getPlaceById);

// Middleware function to return place by userID
// Function imported from places-controller
router.get('/user/:uid', placesControllers.getPlacesByUserId);

// Middleware function to handle validation of session
router.use(checkAuth);

// Midleware function handlingg POST request for creating a place. Express-Validator.check is ensuring validity of input
// Searches for a key in the body named image and extracts image upon creation of new place
router.post('/', s3Upload.upload.single('image'),
[
  check('title').not().isEmpty(),
  check('description').isLength({ min: 5 }),
  check('address').not().isEmpty()
], 
// Note: This will not return any errors. We handle errors in the controller function 'createPlace'
placesControllers.createPlace
);

// Does not clash with get requests route
router.patch('/:pid', [
  check('title').not().isEmpty(),
  check('description').isLength({ min: 5 })
], 
placesControllers.updatePlace
);

router.delete('/:pid', placesControllers.deletePlace);


module.exports = router;