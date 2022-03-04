// Class with a parent class of Error => super()
class HttpError extends Error {
  constructor(message, errorCode) {
    super(message); // Add a "message" property from super
    this.code = errorCode; // Adds 'code' property
  }
}

module.exports = HttpError;