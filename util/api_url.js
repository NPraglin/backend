// Dev URL w/ dev environ vars
require('dotenv').config()

const url = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@npraglin1.2scbg.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`

exports.url = url;