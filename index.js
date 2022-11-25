var MapboxClient = require('mapbox');
require('dotenv').config();
require('express-async-errors');
const axios = require('axios');

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb+srv://capstone:capstone@capstone.xwxrwkx.mongodb.net/test/";


const express = require('express');
const app = express();

app.use(express.json());

var client = new MapboxClient('pk.eyJ1IjoicHNwMTEzMiIsImEiOiJjbGFqdzh3ZGkwZ2phM25wajYzZzByemhkIn0.Cw9W4Cgoyalt3SPKKgc0ew');

app.get('/', (req, res) => res.status(200).send('I am alive'));

app.post('/gps', async (req, res) => {
    var lat = req.body.lat;
    var lng = req.body.lng;
    var uuid = req.body.uuid;

    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("data");
        var myquery = { uuid: uuid };
        const updateDocument = {
            $push: { "coordinates": {"lat": lat, "lng": lng} }
          };
        dbo.collection("vehicle").updateOne(myquery, updateDocument, function(err, res) {
          if (err) throw err;
          console.log("Updated");
          db.close();
        });
      });
    res.status(200).send("Success");
});

app.post('/vehicle/register', (req, res) => {
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("data");
        var myobj = { uuid: req.body.uuid, phone: req.body.phone };
        dbo.collection("vehicle").insertOne(myobj, function(err, res) {
          if (err) return res.status(200).send("Failed");
          console.log(req.body.uuid + " added in vehice collection.");
          db.close();
        });
      });

    res.status(200).send("Success");
});

app.get('/vehicle/bill', (req, res) => {
    console.log(req.body);

    res.status(200).send("Success");
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server listening on port ${port}!`));