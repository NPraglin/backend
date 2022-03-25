const axios = require('axios');
const HttpError = require('../models/http-error');
require('dotenv').config()

const API_KEY = process.env.GOOGLE_API;

// Get coordinates of address
async function getCoordsForAddress(address) {
  const response = await axios.get(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${API_KEY}`
    );

  const data = response.data;

  // Google returns 'ZERO_RESULTS' if no results
  if (!data || data.status === 'ZERO_RESULTS') {
    const error = new HttpError('Could not find location for the specified address', 422);
    throw error;
  }
  // First element is coords from google's documentation
  const coordinates = data.results[0].geometry.location;

  return coordinates;
}

module.exports = getCoordsForAddress;