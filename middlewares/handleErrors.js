// ? constants
const { MESSAGE, STATUS } = require('../utils/constants');

module.exports.handleErrors = (err, req, res, next) => {
  const { statusCode = STATUS.ERROR.SERVER, message } = err;

  console.log('\nОшибка словлена в конце кода:\n\n', err);

  res.status(statusCode).send({
    message:
      statusCode === STATUS.ERROR.SERVER ? MESSAGE.ERROR.SERVER : message,
  });

  next();
};
