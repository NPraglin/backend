const express = require('express');
const fileUpload = require('../middleware/file-upload');
// Object destructuring is revolutionary
const { check } = require('express-validator');

const placesControllers = require('../controller/places-controller');

const checkAuth = require('../middleware/check-auth');

const router = express.Router();

// Middleware function to return place by placeID
// Function imported from places-controller
router.get('/:pid', placesControllers.getPlaceById);

// Middleware function to return place by userID
// Function imported from places-controller
router.get('/user/:uid', placesControllers.getPlacesByUserId);

router.use(checkAuth);

// Midleware function handlingg POST request for creating a place. Express-Validator.check is ensuring validity of input
// Searches for a key in the body named image and extracts image upon creation of new place
router.post('/', fileUpload.single('image'),
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