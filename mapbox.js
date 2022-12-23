const axios = require('axios');
var MapboxClient = require('mapbox');

async function getDistance(lastLat, lastLng, lat, lng){
    
    const uri = "https://api.mapbox.com/matching/v5/mapbox/driving/" + lng + "," + lat + ";" + lastLng + "," + lastLat + "?access_token=" + process.env.MAPBOX_TOKEN;

    console.log(uri);

    try{
        response = await axios.get(uri);

        if(response["code"]=="NoSegment")
        return 0;
    
        if (response.data["matchings"][0]["legs"][0]["summary"] == "NH48"){
            return response.data["matchings"][0]["distance"];
        }
    }
    catch(ex){
        return 0;
    }

    return 0;
}

module.exports = { getDistance };