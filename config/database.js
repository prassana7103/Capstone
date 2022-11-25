const mongoose = require("mongoose");

const { MONGO_URI } = process.env;

exports.connect = () => {
    console.log("Connecting to DB!!!");
  // Connecting to the database
  mongoose
    .connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log("Successfully connected to database...");
    })
    .catch((error) => {
      console.log("Connection failed. exiting now...");
      console.error(error);
      process.exit(1);
    });
};