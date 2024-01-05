// ? Modules
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// ? Constants
const { VALID_VALUES, MESSAGE } = require('../utils/constants');

// * Errors
const { BadRequestError, NotFoundError } = require('../errors/AllErrors');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: false
    },
    photo: {
      type: String,
      required: false
    },
    points: {
      type: Number,
      default: 0,
    },
    referralCode: {
      type: String,
      required: false,
    },
    referrer: {
      type: String,
      required: false,
    },
    wallet: {
      type: String
    },
  },
  { versionKey: false },
);

const user = mongoose.model('user', userSchema);

module.exports = { user };
