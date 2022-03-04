const express = require('express');
const bodyParser = require('body-parser');

const placesRoutes = require('./routes/places-routes');
const HttpError = require ('./models/http-error');

const app = express();

// Middleware parsing incoming request body, extracts data to JSON, and calls next => next middleware in-line
app.use(bodyParser.json());

// Send all requests to that start with /api/places
app.use('/api/places', placesRoutes);

// Middleware handling all failed GET requests
app.use('/', (req, res, next) => {
  const error = new HttpError('Could not find this route.', 404)
  throw error;
});

// Middleware function to render error routes
app.use((error, req, res, next) => {
  // Check if response already been sent
  if (res.headerSent) {
    return next(error)
  }
  // If no default response, let's send..
  res.status(error.code || 500);
  res.json({message: error.message || 'An unknown error occurred!'});
})


app.listen(5000)