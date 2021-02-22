
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

    
};


function getLocationData(searchQuery,res) {
    let keyOne=process.env.GEOCODE_API_KEY 
    let url =`https://us1.locationiq.com/v1/search.php?key=${keyOne}&q=${searchQuery}&format=json`
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



app.get('/weather', (req, res) => {
    let arrayOfWeather = [];
    const weatherCity = req.query.city;
    // const getData = require('./data/weather.json');
    let key = process.env.WEATHER_API_KEY;
    let url = `https://api.weatherbit.io/v2.0/forecast/daily?city=${weatherCity}&key=${key}`;

    superagent.get(url)
        .then(getData => {

            arrayOfWeather = getData.body.data.map((val) => {
                return new Weather(val);
            })
            res.status(200).send(arrayOfWeather);
        })
})

function Weather(getData) {
    // this.search_query = weatherCity;
    this.description = getData.weather.description;
    this.time = getData.valid_date;
}


app.get('/parks', (req, res) => {
    let arrayOfPark=[];
    let thirdKey =process.env.PARKS_API_KEY;
    let lat = req.query.lat;
    let lon = req.query.lon;
    let url = `https://developer.nps.gov/api/v1/parks?lat=${lat}&lon=${lon}&parkCode=acad&api_key=${thirdKey}`;

    superagent.get(url).then(getData=>{
        arrayOfPark=getData.body.data.map((val)=>{
            return new Parkto(val);

        })
        res.status(200).json(arrayOfPark);
        
    })

  
})

function Parkto(element) {
    this.name=element.name;
    this.address=element.address;
    this.fee=element.fee;
    this.description=element.description;

    
}



app.use('*', (req, res) => {
    res.status(500).send('Sorry, something went wrong');
})



app.listen(PORT, () => {
    console.log('the app is listining on port ' + PORT);
});





