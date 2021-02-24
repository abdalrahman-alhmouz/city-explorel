
'use strict'

let express = require('express');
const cors = require('cors');
let app = express();
app.use(cors());
require('dotenv').config();
let superagent = require('superagent');
const PORT = process.env.PORT;
const pg =require('pg');
// const client = new pg.Client(process.env.DATABASE_URL)
const client = new pg.Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
//{{{{{{{{location}}}}}}}} ___________________________________________________________________________________
app.get('/location', handelLocation);

function handelLocation(req, res) {
    let searchQuery = req.query.city;
    getLocationData(searchQuery,res);

    
};


function getLocationData(searchQuery,res) {
   checkDp(searchQuery).then(obj =>{
       if (obj) {
           console.log('FROM DATABASE ')
    res.status(200).send(obj);

       }else{

        let keyOne=process.env.GEOCODE_API_KEY 
        let url =`https://us1.locationiq.com/v1/search.php?key=${keyOne}&q=${searchQuery}&format=json`
    superagent.get(url).then(data=>{
       try{
        let longitude = data.body[0].lon;
        let latitude = data.body[0].lat;
        let displayName = data.body[0].display_name;
        let responseObject = new Citylocation(searchQuery, displayName, latitude, longitude)
        insertLocationData(responseObject)
        res.status(200).send(responseObject);
    
       }catch(error){
           res.status(500).send(error);
       }
    }).catch(error=> {
        res.status(500).send('there was an error getting data from API' + error);
    
    });
       }
   });
   
   
  

};

// constr

function Citylocation(searchQuery, displayName, lat, lon) {
    this.search_query = searchQuery;
    this.formatted_query = displayName;
    this.latitude = lat;
    this.longitude = lon;
}




// {{{{weather}}}}} __________________________________________________________________
app.get("/weather", handleWeather);

function handleWeather(req, res) {

    let lat = req.query.latitude;
    let log = req.query.longitude;
    getWeatherData(res, log, lat);
}
function getWeatherData(res, lat, log) {

    try {
        let weatherQuery = {
            lat: lat,
            lon: log,
            key: process.env.WEATHER_API_KEY
        }
        let weatherUrl = 'https://api.weatherbit.io/v2.0/forecast/daily';
        // let weatherData = require("./data/weather.json");


        superagent.get(weatherUrl).query(weatherQuery).then(getData => {
            let weatherArray = [];
            let casting = getData.body.data;
            // console.log(casting);

            for (let i = 0; i < casting.length; i++) {
                let newDateTime = new Date(casting[i].valid_date).toString();
                let stringDate = newDateTime.split(" ").splice(0, 4).join(" ");

                let obj = new CityWeather(casting[i].weather.description, stringDate);
                weatherArray.push(obj);
            }
            // console.log(weatherArray);
            res.status(200).send(weatherArray);
        }).catch(error => {
            res.status(500).send(error)
        })
    } catch (error) {
        res.status(500).send('there was an error getting data from API' + error);
    }

}
function CityWeather(casting, timing) {
    this.forecast = casting;
    this.time = timing;
}



// {{{{parks}}}}}_____________________________________________________________

app.get('/parks', handlePark);

function handlePark(req, res) {
    let key = process.env.PARKS_API_KEY;
    const city = req.query.search_query;
    let url =  `https://developer.nps.gov/api/v1/parks?limit=10&q=${city}&api_key=${key}&limit=2`;

    superagent.get(url)
        .then(parkData => {
            let parkArr = parkData.body.data.map(val => {
                console.log(new Park(val));
                return new Park(val);
            })
            res.status(200).send(parkArr);
        })
        .catch(() => {
            res.status(500).send('Sorry something went wrong!!');
        })
}



function Park(data) {
    this.name = data.name;
    this.address = Object.values(data.addresses[0]).join(' ');
    this.fee = data.entranceFees[0].cost;
    this.description = data.description;
    this.url = data.url;
}
// {{{{{{}}}}}} _____________________________________________________________________________
const checkDp =(city_name)=>{
    let dbQuery=`SELECT * FROM locations WHERE city_name='${city_name}'`
    return client.query(dbQuery).then(data =>{
    if (data.rows.length !==0) {
        let responseObject = new Citylocation(data.rows.city_name, data.rows.formatted_query, data.rows.latitude, data.rows.longitude)
        return responseObject;
    }else{
        return false;
    }
    }).catch(error=>{
        console.log('catch an error'+ error)
    })

    }

    
    
const insertLocationData =(city)=>{
        let dbQuery = `INSERT INTO  locations(city_name,formatted_query,latitude,longitude) VALUES ($1,$2,$3,$4)`
        let safevalues =[city.city_name,city.formatted_query,city.latitude,city.longitude]
        client.query(dbQuery,safevalues).then(data =>{
            console.log('data return back from db' ,data)
    }).catch(error=>{
        console.log('an error occured' +error)

    })

    // {{{{{{movies}}}}}} ___________________________________________________

    app.get('/movies' ,movie);

    function movie(req,res) {
      const city = req.query.search_query;
      movieGet(city)
        .then(movieData => res.status(200).json(movieData));
    
    }
    
    function movieGet(city){
      let key = process.env.MOVIE_API_KEY;
      let url = `https://api.themoviedb.org/3/search/movie?api_key=${key}&query=${city}`;
      return superagent.get(url)
        .then(movieData =>{
          console.log(movieData.body);
          return movieData.body.results.map(val => {
            return new Movie(val);
          });
        });
    }
    
function Movie(movieData){
    this.title=movieData.title;
    this.overview=movieData.overview;
    this.average_votes=movieData.average_votes;
    this.total_votes=movieData.total_votes;
    this.image_url=`https://image.tmdb.org/t/p/w500${movieData.poster_path}`;
    this.popularity=movieData.popularity;
    this.released_on=movieData.released_on;
  }
    
    



















    // {{{{{yelp}}}}} _________________________________________________________
    
    app.get('/yelp' ,yelp);

    function yelp (req,res){
      const city = req.query.search_query;
      yelpGet(city)
        .then(yelpData => res.status(200).json(yelpData));
    }
    
    function yelpGet(city)
    {
      let key = process.env.YELP_API_KEY;
      let url = `https://api.yelp.com/v3/businesses/search?location=${city}`;
      return superagent.get(url)
        .set('Authorization',`Bearer ${key}`)
        .then(yelpData => {
          console.log(yelpData.body.businesses);
          return yelpData.body.businesses.map(val =>{
            return new Yelp(val);
          });
        });
    }


    function Yelp(yelpData){
        this.name = yelpData.name;
        this.image_url=yelpData.image_url;
        this.price=yelpData.price;
        this.rating=yelpData.rating;
        this.url=yelpData.url;
      }




    // ______________________________________________________________________





app.use('*', (req, res) => {
    res.status(500).send('Sorry, something went wrong');
})
}




client.connect().then(()=>{
    app.listen(PORT, () => {
        console.log('the app is listining on port ' + PORT);
    });

}).catch(error =>{
    console.log(`there is an error ${error}`)
})