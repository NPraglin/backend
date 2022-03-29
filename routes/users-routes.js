const express = require('express');
const { check } = require('express-validator');
const fileUpload = require('../middleware/file-upload');

const usersController = require('../controller/users-controller');
const s3Upload = require('../middleware/s3-upload');

const router = express.Router();

// Function imported from places-controller
router.get('/', usersController.getUsers)

// Midleware function grabbing post req from signup
router.post('/signup', 
// Multer middlware single call file upload image
s3Upload.s3Upload,
[
  check('name').not().isEmpty(),
  check('email').normalizeEmail().isEmail(), // valoidates an email addy
  check('password').isLength({min: 6}),
],
usersController.signup);

// Middleware grabbing post req from login
router.post('/login', usersController.login)

module.exports = router;