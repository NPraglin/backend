const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const AWS = require('aws-sdk');
const multerS3 = require('multer-s3');

// Set up AWS bucket
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS,
  secretAccessKey: process.env.AWS_SECRET,
  region: "us-west-2"
});
// // command to put object
// s3.putObject({
//   Body: 'Profile Img', // body 4 text
//   Bucket: "workbyte",
//   Key: "HappyFace.jpg" // file name
// })

// Maps mime types
const MIME_TYPE_MAP = {
  'image/png': 'png',
  'image/jpg': 'jpg',
  'image/jpeg': 'jpeg'
}
// s3 file upload func
const upload = () => {
  multer({
    // limits: 500000, // bytes - 500kb
    storage: multerS3({
      s3: s3,
      bucket:process.env.S3_BUCKET,
      metadata: function (req, file, cb) {
        cb(null, { fieldName: file.fieldname });
      },
      key: function(req, file, cb) {
        const ext = MIME_TYPE_MAP[file.mimetype];
        cb(null, uuidv4() + '.' + ext)
      },
    }),
  });
}
// s3 multer
const s3Upload = (req, res, next) => {
  console.log(req)

  const uploadSingle = upload().single('image');

  uploadSingle(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message})
    };

    console.log(req)

    res.status(200).json({ data: req.files })
  });
}

module.exports = s3Upload;
