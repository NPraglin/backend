const { v4: uuidv4 } = require('uuid');
const { validationResult} = require('express-validator');
const HttpError = require('../models/http-error');
const getCoordsForAddress = require('../util/location');

let DUMMY_PLACES = [
  {
    id: 'p1',
    title: 'The Bean',
    description: 'Cool place in Chicao',
    location: {
      lat: 41.8827,
      lng: 87.6233
    },
    address: '201 E Randolph St, Chicago, IL 60602',
    creator: 'u1'
  }
]
// Exported to places-routes, gets value of parameter in GET request from params
const getPlaceById = (req, res, next) => {
  const placeId = req.params.pid; // holds an object of my dynamic segments as KEYS. Value is sent in the url

  // must return true
  const place = DUMMY_PLACES.find(p => {
    return p.id === placeId
  })
  // No place? => error function from import
  if (!place) {
    throw new HttpError('Could not find place for place ID.', '404');
  }
  // Place? => render place
    res.json({place}); // => { place: place }
};

// Exported to places-routes, gets value of parameter in GET request from params
const getPlacesByUserId = (req, res, next) => {
  const userId = req.params.uid;
  const places = DUMMY_PLACES.filter(p => {
    return p.creator === userId
  })
  // No place? => error function from import
  if (!places || places.length === 0) {
    throw new HttpError('Could not find places for the provideduser ID.', '404');
  }
  // Place? => render place
    res.json({places}); // => { place: place }
};

// Exported to places-routes, gets data out of POST body
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
  const createdPlace = {
    id: uuidv4(),
    title,
    description,
    location: coordinates,
    address,
    creator
  };

  DUMMY_PLACES.push(createdPlace); //unshift(createdPlace)

  // Success code returning place
  res.status(201).json({place: createdPlace})
};

// Middleware Function to update the place
const updatePlace = (req, res, next) => {
  // Looks intio this function and detects validation errors and returns them form the initial middleware validation
  const errors = validationResult(req);
  if(!errors.isEmpty()) {
    console.log(errors)
    throw new HttpError('Invalid inputs, please check your data', 422)
  }

  const { title, description } = req.body;
  // Part of request is in url using req.params to take that parameter
  const placeID = req.params.pid;

  // Const is able to be updated because it stores the address of the object rather than the actual object
  const updatedPlace = {...DUMMY_PLACES.find(p => p.id == placeID)};
  const placeIndex = DUMMY_PLACES.findIndex(p => p.id === placeID);
  updatedPlace.title = title;
  updatedPlace.description = description;

  DUMMY_PLACES[placeIndex] = updatedPlace;

  // Returns the updated place via HTTP
  res.status(200).json({place: updatedPlace});
  
};

// Middleware Function to delete the place
const deletePlace = (req, res, next) => {
  // Part of request is in url using req.params to take that parameter
  const placeId = req.params.pid;
  if (!DUMMY_PLACES.find(p => p.id === placeId)) {
    throw new HttpError('Could not find place for that id', 404)
  }

  // Return true if ID's do not match and keep the place, if false => drop the place
  DUMMY_PLACES = DUMMY_PLACES.filter(p => p.id =!! placeId);
  res.status(200).json({message: "Deleted place."});
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;