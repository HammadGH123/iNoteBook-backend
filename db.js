const mongoose = require('mongoose');
require('dotenv').config();

const mongoURI = process.env.MONGO_URI;

const connectToMongo = async () => {
  try {
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(" Connected to MongoDB Atlas successfully");
  } catch (err) {
    console.error(" MongoDB connection error:", err.message);
    process.exit(1); // Optional: exit if unable to connect
  }
};

module.exports = connectToMongo;