
'use strict'

let express = require('express');
const cors = require('cors');
let app = express();
app.use(cors());
require('dotenv').config();
let superagent = require('superagent');
const PORT = process.env.PORT;


app.get('/location', handelLocation);

function handelLocation(req, res) {
    let searchQuery = req.query.city;
    getLocationData(searchQuery,res)

    ;
};


function getLocationData(searchQuery,res) {
    let url =`https://us1.locationiq.com/v1/search.php?key=pk.b66bb6def07a3a462a9859a5f7a3bb71&q=${searchQuery}&format=json`
superagent.get(url).then(data=>{
   try{
    let longitude = data.body[0].lon;
    let latitude = data.body[0].lat;
    let displayName = data.body[0].display_name;
    let responseObject = new Citylocation(searchQuery, displayName, latitude, longitude)
    res.status(200).send(responseObject);

   }catch(error){
       res.status(500).send(error);
   }
}).catch(error=> {
    res.status(500).send('there was an error getting data from API' + error);

});

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


app.use('*', (req, res) => {
    res.status(500).send('Sorry, something went wrong');
})



app.listen(PORT, () => {
    console.log('the app is listining on port ' + PORT);
});





