const mongoose = require('mongoose');

const Vehicle = mongoose.model(
    'Vehicle',
    new mongoose.Schema({
      uuid: { type: String, required: true, unique: true, min: 1 },
      phone: { type: String, unique: true, required: true},
      coordinates: [{
        latitude: { type: "String", required: true },
        longitude: { type: String, required: true },
        timestamp: { type: String, required: true },
        distance: {type: String, required: true},
        roadName: {type: String, required: true}
      }],
      distanceTravelled: { type: Number, default: 0 },
      otp: { type: String }
    })
  );

  module.exports = { Vehicle };