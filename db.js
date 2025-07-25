const mongoose = require('mongoose');
require('dotenv').config();

const mongoURI = process.env.MONGO_URI;

const connectToMongo = async () => {
    await mongoose.connect(mongoURI)
    console.log("connected to mongo successfully")
}

module.exports = connectToMongo;