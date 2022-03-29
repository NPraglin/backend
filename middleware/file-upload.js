const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

// Maps mime types
const MIME_TYPE_MAP = {
  'image/png': 'png',
  'image/jpg': 'jpg',
  'image/jpeg': 'jpeg'
}
// Group of middlewares.. config
const fileUpload = multer({
  limits: 500000, // bytes - 500kb
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      let path = '/uploads/images'; // path
      cb(null, path);
    },
    filename: (req, file, cb) => {
      const ext = MIME_TYPE_MAP[file.mimetype];
      cb(null, uuidv4() + '.' + ext)
    }
  }),
  fileFilter: (req, file, cb) => {
    // Store either true or false if it can find
    const isValid = !!MIME_TYPE_MAP[file.mimetype];
    let error = isValid ? null : new Error('Invalid mime type!')
    // Takes error and boolean
    cb(error, isValid);
  }
});

// module.exports = fileUpload;
