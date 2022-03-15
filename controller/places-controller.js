const { v4: uuidv4 } = require('uuid');
const { validationResult} = require('express-validator');
const HttpError = require('../models/http-error');
const getCoordsForAddress = require('../util/location');
const Place = require('../models/place');

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

  let places;
  try {
  places = await Place.find({ creator: userId })
  } catch (err) {
    const error = new HttpError('Could not find any locations for user', 500);
    return next(error);
  }
  // No place? => error function from import
  if (!places || places.length === 0) {
    return next(HttpError('Could not find places for the provideduser ID.', '404'));
  }
  // Place? => render place and map them to objects for each place
  res.json({places: places.map(place => place.toObject({getters: true}))}); // => { place: place }
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

  let coordinates;
  try {
    coordinates = await getCoordsForAddress(address);
  } catch (error) {
    return next(error);
  }
  // Place constructor (object constructor with Schema)
  const createdPlace = new Place({
    title: title,
    description: description,
    image: 'https://picsum.photos/400',
    location: coordinates,
    address: address,
    creator: creator
  });

  // Saves object to be prepared to store in DB and generates unique ID's
  try {await createdPlace.save()}
  catch (err) {
    console.log(err)
    const error = new HttpError(
      'Creating place failed', 500
    );
    return next(error);
  }

  // Success code returning place
  res.status(201).json({place: createdPlace})
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
    place = await Place.findById(placeID);
  } catch (err) {
    const error = new HttpError('Could not delete place', 500);
    return next(error);
  }
  try {
    // Remove
    await place.remove();
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