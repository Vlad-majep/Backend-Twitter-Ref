// ? modules
require('dotenv').config();
const validator = require('validator');

// ! config.json
const config = require('./../config/config.json');

const {
  PORT = config.PORT,
  URL = config.default_url,
  DB_ADDRESS = config.DB_ADDRESS,
  STR_WEB_3 = config.strWeb3,
  JWT_SECRET = config.jwt_secret,
} = process.env;

// ? настройки сервера
const SERVER_SETTING = {
  PORT: PORT,
  URL: URL,
  DB_ADDRESS: DB_ADDRESS,
  STR_WEB_3: STR_WEB_3,
  JWT_SECRET: JWT_SECRET,
};

// ? для ответов на запросы
const MESSAGE = {
  ERROR: {
    BAD_REQUEST: 'BAD REQUEST',
    INCORRECT_DATA: {
      SIMPLE: 'Incorrect data entered',
      CODE_MISSING: 'Need a six-digit code',
      CODE: 'Six-digit code is wrong',
    },
    FORBIDDEN: 'You are not allowed to do this operation',
    NOT_FOUND: {
      REQUEST: 'Request not found',
      USER: 'User not found',
      USERS: 'No user found',
      ROUTER: 'Router not found',
      ADMIN: 'Admin not found',
      TRANSACTION: 'No transactions found',
    },
    NOT_ENOUGH_MONEY: "User don't have enough money",
    NOT_AUTHORIZED: { SIMPLE: 'User is not authorized' },
    SERVER: 'SERVER ERROR',
    PASS: 'Wrong password',
    DUPLICATE: { SIMPLE: 'You can not use these parameters, try other ones' },
    VALIDATION: {
      EMAIL: 'Email validation error',
      URL: 'URL validation error',
    },
    WORDS: 'One or more words are wrong',
  },
  INFO: {
    POST: {
      TWO_FACTOR_ON: 'Two factor now is turn on',
      TWO_FACTOR_OFF: 'Two factor now is turn off',
    },
    DELETE: 'DELETED',
    PUT: 'PUTED',
    PATCH: {
      SIMPLE: 'INFO PATCHED',
      REQUEST: 'Request has been accepted',
    },
    CREATED: {
      SIMPLE: 'CREATED',
      USER: 'User has been created'
    },
    LOGOUT: 'You have successfully logged out',
    LOGIN: 'You have successfully logged in',
  },
};
const STATUS = {
  ERROR: {
    BAD_REQUEST: 400,
    NOT_AUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    SERVER: 500,
  },
  INFO: {
    OK: 200,
    CREATED: 201,
  },
};

const VALID_VALUES = {
  ID_LENGTH: 24,
  TEXT: {
    LENGTH: {
      MIN: 7,
      MAX: 50,
    },
  },
  PASSWORD: {
    LENGTH: {
      MIN: 7,
      MAX: 50,
    },
  },
  ADDRESS_WALLET: {
    LENGTH: {
      MIN: 42,
      MAX: 42,
    },
    PATTERN: /^0x[0-9A-Fa-f]{40}$/,
  },
};

const isThisURL = (value) => {
  const result = validator.isURL(value);
  if (result) {
    return value;
  }
  throw new Error(MESSAGE.ERROR.VALIDATION.URL);
};

// * экспорт всех констант
module.exports = {
  MESSAGE,
  STATUS,
  isThisURL,
  SERVER_SETTING,
  VALID_VALUES
};
