// ? constants
const { MESSAGE, STATUS } = require('./constants');

function NotFound(req, res) {
  res
    .status(STATUS.ERROR.NOT_FOUND)
    .send({ message: MESSAGE.ERROR.NOT_FOUND.ROUTER });
}
module.exports = { NotFound };
