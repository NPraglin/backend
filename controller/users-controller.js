const { validationResult } = require('express-validator');
const User = require('../models/user');

const HttpError = require('../models/http-error')

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
    console.log(errors);
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
  // create new user and add to users list
  const createdUser = new User({
    name,
    email,
    password,
    image: 'https://picsum.photos/200'
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
  // Success code returning place
  res.status(201).json({user: createdUser.toObject({getters: true})})
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

  // Checks user exists or password matches
  if (!existingUser || existingUser.password !== password) {
    const error = new HttpError(
      'Invalid credentials, could not log you in.', 401
    );
    return next(error)
  }

  res.json(
    {
      message: 'Loggged in!', 
      user: existingUser.toObject({ getters: true })
  });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;