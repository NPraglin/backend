const HttpError = require("../models/http-error");
const jwt = require('jsonwebtoken');

// Authenticates user via token validation! And then adds data to request!
module.exports = (req, res, next) => {
  if (req.method === 'OPTIONS') {
    return next();
  }
  // Check the headers for the token rather than the body (some reqs dont have body)
  // Headers are case SENSITIVE
  try {
  const token = req.headers['authorization'].split(' ')[1]; // Authorization: 'Bearer TOKEN'
  if (!token) {
    throw new Error('Authentication failed! Line 14 check-auth');
  }
  // Step 1: Validate/Verify that token
  const decodedToken = jwt.verify(token, process.env.JWT_KEY);

  // Step 2: Add data to req.. Adds data to the request! Adding the user ID
  req.userData = {userId: decodedToken.userId}
  next();
} catch (err) {
  const error = new HttpError('Authentication failed! Line 22 check-auth', 401);
    return next(error)
}
};