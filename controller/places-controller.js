const { validationResult} = require('express-validator');
const HttpError = require('../models/http-error');
const getCoordsForAddress = require('../util/location');
const Place = require('../models/place');
const User = require('../models/user');
const { default: mongoose } = require('mongoose');

// Exported to places-routes, gets value of parameter in GET request from params
// Http Get Request returns place
const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid; // holds an object of my dynamic segments as KEYS. Value is sent in the url

  let place;
  // Mongoose static method that finds records by ID.. returns place by id
  try {place = await Place.findById(placeId);} catch (err) {
    const error = new HttpError('Could not find place for id', 500);
    return next(error);
  }

  // No place? => error function from import
  if (!place) {
    throw new HttpError('Could not find place for place ID.', '404');
  }
  // Place? => render place with getters to avoid non-id
    res.json({place: place.toObject({getters: true})}); // => { place: place }
};

// Exported to places-routes, gets value of parameter in GET request from params
// Http Get Request returns place
const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid;

  //let places;
  let userWithPlaces
  try {
    // populate method to get corresponding places for the user ID (similar to joining two DB's)
    userWithPlaces = await User.findById(userId).populate('places')
  } catch (err) {
    const error = new HttpError('Could not find any locations for user', 500);
    return next(error);
  }
  // No place? => error function from import
  if (!userWithPlaces || userWithPlaces.places.length === 0) {
    return next(HttpError('Could not find places for the provideduser ID.', '404'));
  }
  // Place? => render place and map them to objects for each place
  res.json({places: userWithPlaces.places.map(place => place.toObject({getters: true}))}); // => { place: place }
};

// Exported to places-routes, gets data out of POST body - Http Post Request
const createPlace = async (req, res, next) => {
  // Looks intio this function and detects validation errors and returns them form the initial middleware validation
  const errors = validationResult(req);
  if(!errors.isEmpty()) {
    console.log(errors)
    // Async code requires the use of next() on errors rather than throw
    return next(new HttpError('Invalid inputs, please check your data', 422))
  }

  // Deconstruct object and store in consts
  const { title, description, address, creator } = req.body;

  // Using our Google API to return coords by address
  let coordinates;
  try {
    coordinates = await getCoordsForAddress(address);
  } catch (error) {
    return next(error);
  }
  // Place constructor (object constructor with Schema).. taking user input from POST body
  const createdPlace = new Place({
    title: title,
    description: description,
    image: 'https://picsum.photos/400',
    location: coordinates,
    address: address,
    creator: creator
  });

  // Debugger console log
  console.log(createdPlace);

  // Next block of code is to get the user for place assignment
  let user;
  try {
    // Finds the user we want to put the place under by selecting from creator id (they should match otherwise throw error)
    user = await User.findById(creator);
  } catch (err) {
    const error = new HttpError('Creating Place Failed at step: finding user, please try again', 500);s
    return next(error)
  }
  // If no user... return error
  if (!user) {
    const error = new HttpError('Could not find user for provided ID', 404);
    return next(error);
  }
  // Just to confirm, we'll console log the user
  console.log(user)

  // Transaction allows use of multiple operations.. built upon sessions
  // Start a session!
  try {
    console.log('step1: create sesh')
    const sesh = await mongoose.startSession();
    // Start a transaction and tell mongoose what we want to do
    // Transaction will not create a new collection
    console.log('step2: start transaction')
    sesh.startTransaction();
    // Now we save, with our session passed in as an object
    console.log('step3: save place')
    await createdPlace.save({session: sesh});
    // Now that place is created/stored..  ensure the ID is added to the user's list
    // This is a MONGOOSE PUSH, not a standard array PUSH.. allows mongoose to connect two models
    console.log('step4: push place')
    user.places.push(createdPlace);
    // Update user now that we pushed the place on
    console.log('step5: save sesh')
    await user.save({session: sesh});
    // Commit and close
    console.log('step6: commit trans')
    sesh.commitTransaction();
  }
  catch (err) {
    console.log(err)
    const error = new HttpError(
      'Creating place failed', 500
    );
    return next(error);
  }

  // Success code returning place
  res.status(201).json({place: createdPlace.toObject({getters: true})})
};

// Middleware Function to update the place via Http Patch Request
const updatePlace = async (req, res, next) => {
  // Looks into this function and detects validation errors and returns them form the initial middleware validation
  const errors = validationResult(req);
  if(!errors.isEmpty()) {
    console.log(errors);
    return next (HttpError('Invalid inputs, please check your data', 422));
  }

  const { title, description } = req.body;
  // Part of request is in url using req.params to take that parameter
  const placeID = req.params.pid;

  let place;
  // Mongoose static method that finds records by ID.. returns place by id
  try {
    place = await Place.findById(placeID);
  } catch (err) {
    const error = new HttpError('Could not find place for id', 500);
    return next(error);
  }

  // Const is able to be updated because it stores the address of the object rather than the actual object
  place.title = title;
  place.description = description;

  try {
    await place.save();
  } catch (err) {
    const error = new HttpError('Something went wrong, could not update place', 500);
    return next(error)
  }

  // Returns the updated place via HTTP
  res.status(200).json({place: place.toObject({ getters: true })});
  
};

// Middleware Function to delete the place via Http Delete Request
const deletePlace = async (req, res, next) => {
  // Part of request is in url using req.params to take that parameter
  const placeID = req.params.pid;

  let place;
  // Mongoose static method that finds records by ID.. returns place by id
  try {
    // populate relates the two collections by parameter
    place = await Place.findById(placeID).populate('creator');
  } catch (err) {
    const error = new HttpError('Could not delete place', 500);
    return next(error);
  }

  // General error returning logic here
  if (!place) {
    const error = new HttpError('Could not find place for this ID', 404);
    return next(error);
  }

  // Transaction allows use of multiple operations.. built upon sessions
  // Start a session!
  try {
    const sesh = await mongoose.startSession();
    // Start a transaction and tell mongoose what we want to do
    // Transaction will not create a new collection
    sesh.startTransaction();
    // Now we save, with our session passed in as an object
    await place.remove({session: sesh});
    // Access our place via creator, and MONGOOSE PULL it out of the array.. remove place
    place.creator.places.pull(place);
    // Update user now that we removed the place.. save that boi
    await place.creator.save({session: sesh});
    // Commit and close
    sesh.commitTransaction();
  } catch (err) {
    const error = new HttpError('Could not delete place', 500);
    return next(error);
  }
  
  res.status(200).json({message: "Deleted place."});
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;