const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator');

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


// POST Request signup handling
const signup = (req, res, next) => {
  // Looks intio this function and detects validation errors and returns them form the initial middleware validation
  const errors = validationResult(req);
  if(!errors.isEmpty()) {
    console.log(errors)
    throw new HttpError('Invalid inputs, please check your data', 422)
  }

  const { name, email, password} = req.body;

  // Checks users object to see if user exists
  const hasUser = DUMMY_USERS.find(u => u.email === email);
  if (hasUser) {
    throw new HttpError('User already exists.', 422);
  }
  // create new user and add to users list
  const createdUser = {
    id: uuidv4(),
    name, // name: name
    email,
    password
  };
  DUMMY_USERS.push(createdUser);

  res.status(201).json({user: createdUser})
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