const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();


const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('database connected');
  } catch (err) {
    console.error('database connection error:', err);

    process.exit(1);
  }
};

module.exports = connectDB;
