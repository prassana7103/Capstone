require('dotenv').config();
require('./config/database').connect();
const cors = require('cors');
const axios  = require('axios');

const { getDistance } = require('./mapbox');

require('express-async-errors');

const { Vehicle } = require('./models/vehicle');

const express = require('express');
const app = express();

app.use(express.json());
app.use(cors({ origin: '*' }));

app.get('/', (req, res) => res.status(200).send('I am alive'));

app.post('/gps', async (req, res) => {
  var lat = req.body.lat;
  var lng = req.body.lng;
  var uuid = req.body.uuid;

  var vehicle = await Vehicle.findOne({ uuid: uuid });

  if (!vehicle) {
    return res.status(400).send("Failed to find vehicle");
  }

  console.log(vehicle.coordinates);

  var lastDistance = "-";

  if (vehicle.coordinates.length > 0) {
    var lastLat = vehicle.coordinates[vehicle.coordinates.length - 1].latitude;
    var lastLng = vehicle.coordinates[vehicle.coordinates.length - 1].longitude;

    var distance = await getDistance(lastLat, lastLng, lat, lng);

    vehicle.distanceTravelled += distance;

    lastDistance = distance;
  }

  vehicle.coordinates.push({latitude: lat, longitude: lng, distance: lastDistance, timestamp: new Date(), roadName: "NH48"});

  vehicle.save();

  return res.status(200).send("Success");
});

app.post('/vehicle/register', (req, res) => {
  var phone = req.body.phone;
  var uuid = req.body.uuid;

  var vehicle = new Vehicle({ uuid: uuid, phone: phone, coordinates: [] });

  vehicle.save((err, vehicle) => {
    if (err) {
      return res.status(400).send("Failed to register vehicle");
    }
  });

  return res.status(200).send("Success");
});

app.post('/login', async (req, res) => {
  var phone = req.body.phone;
  var uuid = req.body.uuid;

  var vehicle = await Vehicle.findOne({ uuid: uuid });

  if (!vehicle) {
    return res.status(400).send("Failed to find vehicle");
  }

  if (vehicle.phone != phone) {
    return res.status(400).send("Failed to login");
  }

  var otp = Math.floor(100000 + Math.random() * 900000);

  axios.post(process.env.FAST2SMS_OTP_API, {
    "route": "otp",
    "variables_values": `${otp}`,
    "numbers": `${phone}`
  }, {
    headers: {
      "authorization": process.env.FAST2SMS_AUTH
    }
  })
    .then(function (response) {
      console.log("OTP sent successfully");
    })
    .catch(function (error) {
      return res.status(500).send("Failed to send OTP");
    });

  vehicle.otp = otp;

  vehicle.save();

  return res.status(200).send("Success");
});

app.post('/verify', async (req, res) => {
  var phone = req.body.phone;
  var uuid = req.body.uuid;
  var otp = req.body.otp;

  var vehicle = await Vehicle.findOne({ uuid: uuid });

  if (!vehicle) {
    return res.status(400).send("Failed");
  }

  if (vehicle.phone == phone && vehicle.otp == otp) {
    return res.status(200).send({distanceTravelled: vehicle["distanceTravelled"], coordinates:vehicle["coordinates"], bill: vehicle["distanceTravelled"]*0.02});
  }

  return res.status(500).send("Failed");
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server listening on port ${port}!`));