const { validationResult } = require('express-validator');
const User = require('../models/user');
require('dotenv').config();
const HttpError = require('../models/http-error')
// Library for hashing passwords
const bcrypt = require('bcryptjs');

// Cookies library
const jwt = require('jsonwebtoken');

// Gets users on the GET request
const getUsers = async (req, res, next) => {
  // Find user by email n name.. odd mongo syntax to query the db and find all matching params LESS password
  let users;
  try {
  users = await User.find({}, '-password');
  
  } catch (err) {
    const error = new HttpError('Fetching users failed. Please try again later', 500)
    return next(error)
  }
  res.json({users: users.map(user =>user.toObject({ getters: true} ))})
};


// POST Request signup handling - creates new user
const signup = async (req, res, next) => {
  // Looks intio this function and detects validation errors and returns them form the initial middleware validation
  const errors = validationResult(req);
  if(!errors.isEmpty()) {
    // Always return next in async rather than throw
    return next(
      new HttpError('Invalid inputs, please check your data', 422)
    );

  }
  const { name, email, password } = req.body;

  // Checks users object to see if user exists via Mongoose findOne()
  let existingUser;
  try {
  existingUser = await User.findOne( {email: email} )
  }
  catch (err) {
    // If invalid input
    const error = new HttpError('Signing up failed', 500);
    return next(error);
  }
  // If user exists, throw a new error.. else.. create user..
  if (existingUser) {
    const error = new HttpError('User already exists. Please login instead.', 422);
    return next(error);
  }

  // Hash password
  let hashedPassword;
  try {
  hashedPassword = await bcrypt.hash(password, 12); // 12 Salt rounds
  } catch (err) {
    const error = new HttpError('Could not create user, please try again', 500)
    return next(error)
  }

  // create new user and add to users list
  const createdUser = new User({
    name,
    email,
    password: hashedPassword,
    image: req.file.key,
    places: []
  });
  
  // await and save our user
  try {await createdUser.save()}
  catch (err) {
    console.log(err)
    const error = new HttpError(
      'Creating User failed.. Please try again', 500
    );
    return next(error);
  }

  // creating session token / cookie
  let token;
  try {
  token = jwt.sign({ userId: createdUser.id, email: createdUser.email }, process.env.JWT_KEY, { expiresIn: '1h' });
  } catch (err) {
    const error = new HttpError(
      'Creating User failed.. Please try again', 500
    );
    return next(error)
  }

  // Success code returning info and token and passes to front end!
  res.status(201).json({userId: createdUser.id, email: createdUser.email, token: token})
};


// Function logging in user. Grabs POST request and evaluates it against the
const login = async (req, res, next) => {
  const { email, password } = req.body;

  // Check for existing User
  let existingUser;
  try {
  existingUser = await User.findOne( {email: email} )
  }
  catch (err) {
    // If invalid input
    const error = new HttpError('Logging in failed', 500);
    return next(error);
  }

  // Checks user exists
  if (!existingUser) {
    const error = new HttpError(
      'Invalid credentials, could not log you in.', 401
    );
    return next(error)
  }

  // Use bcrypt to compare password to stored hashed pw in db
  let isValidPassword = false;
  try {
  isValidPassword = await bcrypt.compare(password, existingUser.password) // returns boolean
  } catch (err) {
    const error = new HttpError('Could not log you in. Please check your credentials', 500)
    return next(error)
  }

  if (!isValidPassword) {
    const error = new HttpError(
      'Invalid credentials, could not log you in.', 401
    );
    return next(error)
  }

  // Generate token for login
  // This token needs to match the token from signup
  let token;
  try {
  token = jwt.sign({ userId: existingUser.id, email: existingUser.email }, process.env.JWT_KEY, { expiresIn: '1h' });
  } catch (err) {
    const error = new HttpError(
      'Creating User failed.. Please try again', 500
    );
    return next(error)
  }

  res.json(
    {
      userId: existingUser.id, 
      email: existingUser.email,
      token: token
  });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;