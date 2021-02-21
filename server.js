
'use strict'

let express = require('express');
const cors = require('cors');

let app = express();
app.use(cors());
require('dotenv').config();

const PORT = process.env.PORT;

app.get('/location', handelLocation);

function handelLocation(req, res) {
    let searchQuery = req.query.city;
    let locationObject = getLocationData(searchQuery);
    res.status(200).send(locationObject);
};


function getLocationData(searchQuery) {
    let locationData = require('./data/location.json');
    let longitude = locationData[0].lon;
    let latitude = locationData[0].lat;
    let displayName = locationData[0].display_name;
    let responseObject = new Citylocation(searchQuery, displayName, latitude, longitude)
    return responseObject
};

// constr
function Citylocation(searchQuery, displayName, lat, lon) {
    this.search_query = searchQuery;
    this.formatted_query = displayName;
    this.latitude = lat;
    this.longitude = lon;
}

app.get('/weather', handleWeather);

function CityWeather(weatherDesc, time) {
    this.forecast = weatherDesc;
    this.time = time;
}


function handleWeather(req, res) {
    let searchQuery = req.query.city;
    let weathrr = wetherData(searchQuery);
    res.status(200).send(weathrr);
}



function wetherData(searchQuery) {

    let weatherData = require('./data/weather.json');
    let obJectArray = [];
    for (let i = 0; i < weatherData.data.length; i++) {
        let weatherDesc = weatherData.data[i].weather['description'];
        let time = weatherData.data[i].datetime;
        time = time.replace("-", "/");
        var date = new Date(time);
        let timeData = date.toString();
        var newDate = timeData.slice(" ", 16);


        let responseObject = new CityWeather(weatherDesc, newDate);
        obJectArray.push(responseObject);
    }
    return obJectArray;
}





app.listen(PORT, () => {
    console.log('the app is listining on port ' + PORT);
});
