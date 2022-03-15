const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator');
const User = require('../models/user');

const HttpError = require('../models/http-error')

const DUMMY_USERS = [
  {
    id: 'u1',
    name: 'Nathan P',
    email: 'test@test.com',
    password: 'testers'
  }
]

// Gets users on the middle
const getUsers = (req, res, next) => {
  // Need to return that array of users
  res.json({users: DUMMY_USERS})
};


// POST Request signup handling - creates new user
const signup = async (req, res, next) => {
  // Looks intio this function and detects validation errors and returns them form the initial middleware validation
  const errors = validationResult(req);
  if(!errors.isEmpty()) {
    console.log(errors);
    return next(
      new HttpError('Invalid inputs, please check your data', 422)
    );

  }
  const { name, email, password, places } = req.body;

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
    image: 'https://picsum.photos/200',
    places
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

const login = (req, res, next) => {
  const { email, password} = req.body;

  const identifiedUser = DUMMY_USERS.find(u => u.email === email);
  if (!identifiedUser || identifiedUser.password !== password) {
    throw new HttpError('Could not identify user, credentials seem to be wrong.', 401);
  }
  
  res.json({message: 'Loggged in!'});
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;