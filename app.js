const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const api = require('./util/api_url');
const placesRoutes = require('./routes/places-routes');
const usersRoutes = require('./routes/users-routes')
const HttpError = require ('./models/http-error');

const app = express();

// Middleware parsing incoming request body, extracts data to JSON, and calls next => next middleware in-line
app.use(bodyParser.json());

// Middleware working around CORS by adding specific headers to the response
app.use((req, res, next) => {
  // Controls which domains are allowed (* = all)
  res.setHeader('Access-Control-Allow-Origin', '*');
  // Allows origin, x requested, content type, accept, and authorization headers through
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested, Content-Type, Accept, Aiuthorization');
  // Allowss access for the following HTTP methods
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE')
  next();
})

// Send all requests to that start with /api/places
app.use('/api/places', placesRoutes);
app.use('/api/users', usersRoutes);

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

// Initialize DB connection with Mongoose
mongoose.connect(api.url).then(() => {
  app.listen(5000)
}).catch(err => {
  console.log(err);
});