const HttpError = require("../models/http-error");
const jwt = require('jsonwebtoken');

// Authenticates user via token validation! And then adds data to request!
module.exports = (req, res, next) => {
  // Check the headers for the token rather than the body (some reqs dont have body)
  // Headers are case insensitive
  try {
  const token = req.headers.authorization.split(' ')[1]; // Authorization: 'Bearer TOKEN'
  if (!token) {
    throw new Error('Authentication failed!', 401);
  }
  // Verify that token
  const decodedToken = jwt.verify(token, 'supersecret_dont_share');
  // Gets user ID from token
  req.userData = {userId: decodedToken.userId}
  next();
} catch (err) {
  const error = new HttpError('Authentication failed!', 401);
    return next(error)
}
};