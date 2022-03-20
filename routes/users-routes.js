const express = require('express');
const { check } = require('express-validator');
const fileUpload = require('../middleware/file-upload');

const usersController = require('../controller/users-controller');

const router = express.Router();

// Function imported from places-controller
router.get('/', usersController.getUsers)

// Midleware function grabbing post req from signup
router.post('/signup', 
// Multer middlware single call file upload image
fileUpload.single('image'),
[
  check('name').not().isEmpty(),
  check('email').normalizeEmail().isEmail(), // valoidates an email addy
  check('password').isLength({min: 6}),
],
usersController.signup);

// Middleware grabbing post req from login
router.post('/login', usersController.login)

module.exports = router;