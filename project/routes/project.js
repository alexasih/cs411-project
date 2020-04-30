const express = require('express');
const router = express.Router();
const request = require('request');
const db = require('../mongo/mongo');

router.route('/')
    .get(function (req, res, next) {
        // const apiKey = process.env.MY_WEATHER_API_KEY;
        // const city = 'boston';
        // const url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;
        // let mongo = db.getDB();
        console.log(req);
        const apiKey = process.env.MY_WEATHER_API_KEY;
        const urlPart1 = 'http://api.openweathermap.org/data/2.5/weather?q='
        const urlPart2 = '&appid=';
        const newUrl = urlPart1 + req.body.city + urlPart2 + apiKey;
        let mongo = db.getDB();

        request(url, function (err, response, body) {
            if (err) {
                console.log('error:', err);
            } else {
                let currentWeather = JSON.parse(body);
                if (currentWeather.main == undefined || currentWeather.weather == undefined) {
                    res.send(({
                        weather: 'Error, please try again'
                    }));
                } else {
                    mongo.collection('weatherdata').find({'temperature': `${currentWeather.main.temp}`}).count((err, countValue) => {
                        if (countValue > 0) {
                            mongo.collection('weatherdata').findOne({'temperature': `${currentWeather.main.temp}`}, (err, result) => {
                                if (err) throw err;
                                console.log(result);
                                console.log("Already in DB");
                                res.send(({
                                  description: `${result.description}`,
                                  temperature: `${result.temperature}`,
                                  city: `${result.city}`
                                }));
                            });
                        } else {
                            mongo.collection('weatherdata').insertOne({
                                description: `${currentWeather.weather[0].description}`,
                                temperature: `${currentWeather.main.temp}`,
                                city: `${currentWeather.name}`
                            });

                            mongo.collection('weatherdata').findOne({'temperature': `${currentWeather.main.temp}`}, (err, result) => {
                                if (err) throw err;
                              console.log("Not in DB yet");
                                res.send(({
                                    description: `${result.description}`,
                                    temperature: `${result.temperature}`,
                                    city: `${result.city}`
                                }));
                            });
                        }
                    })
                }
            }
        });
    });

router.route('/db')
  .post(function(req, res, next) {
    const apiKey = process.env.MY_WEATHER_API_KEY;
    const urlPart1 = 'http://api.openweathermap.org/data/2.5/weather?q='
    const urlPart2 = '&appid=';
    const newUrl = urlPart1 + req.body.city + urlPart2 + apiKey;
    let mongo = db.getDB();

    request(newUrl, function (err, response, body) {
      if (err) {
        console.log('error:', err);
      } else {
        let currentWeather = JSON.parse(body);
        if (currentWeather.main == undefined || currentWeather.weather == undefined) {
          res.send(({
            weather: 'Error, please try again'
          }));
        } else {

          mongo.collection('weatherdata').insertOne(({
            description: `${currentWeather.weather[0].description}`,
            temperature: `${currentWeather.main.temp}`,
            city: `${req.body.city}`
          }))

          mongo.collection('weatherdata').findOne({'city': `${req.body.city}`}, (err, result) => {
            if (err) throw err;
            res.send({
              description: `${result.description}`,
              temperature: `${result.temperature}`,
              city: `${result.city}`
            })
          })
        }
      }
    })
  });

router.route('/')
  .get(function (req, res, next) {
    let arrayIngredients = [];
    const ingredient = 'apple';
    const apiKey = process.env.API_KEY;
    const url = `https://api.spoonacular.com/recipes/findByIngredients?apiKey=${apiKey}&ingredients=${ingredient}&number=1`;

    request(url, function (err, response, body) {
      if(err){
        console.log('error:', err);
      } else {

        let current = JSON.parse(body);
        console.log(current);
        if(current[0].id == undefined){
          res.send(compiledFunction({
            info: 'Error, please try again'
          }));
        } else {
          res.send(compiledFunction({
            info: `The ingredient ID we are looking for is ${current[0].id}`
          }));
        }
      }
    });

  });



db.connect((err, client) => {
    if (err) {
        console.log(`ERR: ${err}`);
    } else {
        console.log(`Connected`);
    }
});

module.exports = router;
