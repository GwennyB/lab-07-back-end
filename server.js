'use strict';

// application dependencies
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');

const app = express();

app.use(cors());

// get application constants
require('dotenv').config();
const PORT = process.env.PORT || 4000;

// set test route
// app.get('/test', (request,response) => {
//   response.send('TEST success');
// })

// establish public directory
app.use(express.static('./city-explorer-client'));

// set home route
app.get((''), (request,response) => {
  response.send(`${__dirname}/city-explorer-client/index.html`);
})

// set LOCATION route
app.get(('/location'), (request, response) => {
  getLatLng(request.query.data)
    .then (location => {
      response.send(location)
    });
})

// HELPER: get location data and return location object
function getLatLng (query) {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=seattle&key=${process.env.GEOCODE_API_KEY}`;
  return superagent.get(url)
    .then(locResult => new Location(locResult.body, query) )
    .catch(error => handleError(error));
}

// HELPER: Location constructor
function Location (data, query) {
  this.search_query = query,
  this.formatted_query = data.results[0].formatted_address,
  this.latitude = data.results[0].geometry.location.lat,
  this.longitude = data.results[0].geometry.location.lng
}

// set WEATHER route
app.get(('/weather'), getWeather)

// HELPER: get weather data and return location object
function getWeather (request, response) {
  const url = `https://api.darksky.net/forecast/${process.env.DARKSKY_API_KEY}/${request.query.data.latitude},${request.query.data.longitude}`;

  superagent.get(url)
    .then( weatherResult => {
      const weather = weatherResult.body.daily.data.map( (day,index) => {
        return new Weather(day);
      })
      response.send(weather);
    })
    .catch(error => handleError(error));

}

// HELPER: Weather constructor
function Weather(weatData) {
  this.forecast = weatData.summary;
  this.time = new Date(weatData.time * 1000).toDateString();
}

// set YELP route
app.get(('/yelp'), (request, response) => {
  getRestaurants(request, response);
})

  
// HELPER: get restaurants data
function getRestaurants(request,response) {
  const url = `https://api.yelp.com/v3/businesses/search?location=${request.query.data.search_query}`;
  superagent.get(url)
    .set('Authorization', `Bearer ${process.env.YELP_API_KEY}`)
    .then( yelpDataRaw => {
      const restaurants = yelpDataRaw.body.businesses.map(thisOne => {
        return new Restaurant(thisOne);
      });
      response.send(restaurants);
    })
    .catch(error => handleError(error));
}

// HELPER: Restaurant constructor
function Restaurant (restaurant) {
  this.name = restaurant.name,
  this.image_url = restaurant.image_url,
  this.price = restaurant.price,
  this.rating = restaurant.rating,
  this.url = restaurant.url
}




// set MOVIES route
// app.get(('/movies'), getMovies)


// error handler
function handleError (error, response) {
  // console.error(error);
  if(response) response.status(500).send('Sorry, something went wrong.');
}


// open port
app.listen(PORT, () => {
  console.log(`listening on ${PORT}`);
})
