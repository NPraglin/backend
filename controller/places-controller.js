const { v4: uuidv4 } = require('uuid');

const HttpError = require('../models/http-error');

const DUMMY_PLACES = [
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
const getPlaceByUserId = (req, res, next) => {
  const userId = req.params.uid;
  const place = DUMMY_PLACES.find(p => {
    return p.creator === userId
  })
  // No place? => error function from import
  if (!place) {
    throw new HttpError('Could not find place for user ID.', '404');
  }
  // Place? => render place
    res.json({place}); // => { place: place }
};

// Exported to places-routes, gets data out of POST body
const createPlace = (req, res, next) => {
  // Deconstruct object and store in consts
  const { title, description, coordinates, address, creator } = req.body
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

exports.getPlaceById = getPlaceById;
exports.getPlaceByUserId = getPlaceByUserId;
exports.createPlace = createPlace;