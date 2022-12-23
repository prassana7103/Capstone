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

  var distance = 0;
  
  if (vehicle.trips.length == 0) {
    vehicle.trips.push({start: {latitude: 0, longitude: 0, timestamp: Date.now()}, end: {latitude: 0, longitude: 0, timestamp: Date.now()}, distance: 0, started: false, finished: false});
  }
  else if(vehicle.trips[vehicle.trips.length - 1].finished){
    vehicle.trips.push({start: {latitude: 0, longitude: 0, timestamp: Date.now()}, end: {latitude: 0, longitude: 0, timestamp: Date.now()}, distance: 0, started: false, finished: false});
  }

  if(!vehicle.trips[vehicle.trips.length - 1].started){
    var lastLat = vehicle.trips[vehicle.trips.length - 1].start.latitude;
    var lastLng = vehicle.trips[vehicle.trips.length - 1].start.longitude;

    var distance = await getDistance(lastLat, lastLng, lat, lng);

    if(distance == 0){
      vehicle.trips[vehicle.trips.length - 1].start.latitude = lat;
      vehicle.trips[vehicle.trips.length - 1].start.longitude = lng;
    }
    else{
      vehicle.trips[vehicle.trips.length - 1].started = true;
      vehicle.trips[vehicle.trips.length - 1].end.latitude = lat;
      vehicle.trips[vehicle.trips.length - 1].end.longitude = lng;
      vehicle.trips[vehicle.trips.length - 1].distance += distance;
    }
    vehicle.distanceTravelled += distance;
  }
  else{
    var lastLat = vehicle.trips[vehicle.trips.length - 1].end.latitude;
    var lastLng = vehicle.trips[vehicle.trips.length - 1].end.longitude;

    var distance = await getDistance(lastLat, lastLng, lat, lng);

    if(distance == 0){
      vehicle.trips[vehicle.trips.length - 1].finished = true;
    }
    else{
      vehicle.trips[vehicle.trips.length - 1].end.latitude = lat;
      vehicle.trips[vehicle.trips.length - 1].end.longitude = lng;
      vehicle.trips[vehicle.trips.length - 1].distance += distance;
    }

    vehicle.distanceTravelled += distance;
  }

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
    return res.status(200).send({distanceTravelled: vehicle["distanceTravelled"], trips:vehicle["trips"], bill: vehicle["distanceTravelled"]*0.02});
  }

  return res.status(500).send("Failed");
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server listening on port ${port}!`));