const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const api = require('./util/api_url');
const placesRoutes = require('./routes/places-routes');
const usersRoutes = require('./routes/users-routes')
const HttpError = require ('./models/http-error');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware parsing incoming request body, extracts data to JSON, and calls next => next middleware in-line
app.use(bodyParser.json());

// Middleware working around CORS by adding specific headers to the response
app.use((req, res, next) => {
  // Controls which domains are allowed (* = all)
  res.setHeader('Access-Control-Allow-Origin', '*');
  // Allows origin, x requested, content type, accept, and authorization headers through
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  // Allowss access for the following HTTP methods
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');

  next();
})

// Handling images in the middle
// Builds a new path pointing to images/uploads and any file if requested are returned
app.use('/app/uploads/images', express.static(path.join('app', 'uploads', 'images')));

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
  // Checks for file to delete
  if (req.file) {
    // Using FS import
    fs.unlink(req.file.path, (err) => {
      console.log(err);
    });
  }
  // Check if response already been sent
  if (res.headerSent) {
    return next(error)
  }
  // If no default response, let's send..
  res.status(error.status || 500);
  res.json({message: error.message || 'An unknown error occurred!'});
})

// Initialize DB connection with Mongoose
mongoose.connect(api.url).then(() => {
  app.listen(process.env.PORT || 5000)
}).catch(err => {
  console.log(err);
});