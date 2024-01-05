// ? modules
const mongoose = require('mongoose');

// функция подключения к базе данных по адресу _address_
async function connectMongo(address) {
  mongoose.set('strictQuery', true);
  // ? подключаемся к серверу mongo
  await mongoose.connect(address, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log('Connecting to MongoDB');
}

module.exports = { connectMongo };
