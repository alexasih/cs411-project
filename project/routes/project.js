const express = require('express');
const router = express.Router();
const request = require('request');
const db = require('../mongo/mongo');

router.route('/')
    .get(function (req, res, next) {
        console.log(req);
        const apiKey = process.env.API_KEY;
        const urlPart1 = 'https://api.spoonacular.com/recipes/findByIngredients?apiKey='
        const urlPart2 = '&ingredients=';
        const urlPart3 = '&number=1';
        const newUrl = urlPart1 + apiKey + urlPart2 + req.body.ingredientName + urlPart3;

        let mongo = db.getDB();

        request(url, function (err, response, body) {
            if (err) {
                console.log('error:', err);
            } else {
                let current = JSON.parse(body);
                if (current.main == undefined || current.id == undefined) {
                    res.send(({
                        recipeID: 'Error, please try again'
                    }));
                } else {
                    mongo.collection('recipedata').find({'usedIngredients': `${req.body.ingredientName}`}).count((err, countValue) => {
                        if (countValue > 0) {
                            mongo.collection('recipedata').findOne(findOne({'usedIngredients': `${req.body.ingredientName}`}, (err, result) => {
                                if (err) throw err;
                                console.log(result);
                                console.log("Already in DB");
                                res.send(({
                                    recipeID: `${result.id}`,
                                    recipeTitle: `${result.title}`,
                                    recipeImage: `${result.image}`,
                                    missedIngredients: `${result.missedIngredients}`,
                                    usedIngredients: `${result.usedIngredients}`
                                }));
                            });
                        } else {
                            mongo.collection('recipedata').insertOne({
                                recipeID: `${current[0].id}`,
                                recipeTitle: `${current[0].title}`,
                                recipeImage: `${current[0].image}`,
                                missedIngredients: `${current[0].missedIngredients}`,
                                usedIngredients: `${current[0].usedIngredients}`
                            });

                            mongo.collection('recipedata').findOne({'usedIngredients': `${req.body.ingredientName}`}, (err, result) => {
                                if (err) throw err;
                              console.log("Not in DB yet");
                                res.send(({
                                    recipeID: `${result.id}`,
                                    recipeTitle: `${result.title}`,
                                    recipeImage: `${result.image}`,
                                    missedIngredients: `${result.missedIngredients}`,
                                    usedIngredients: `${result.usedIngredients}`
                                }));
                            });
                        }
                    })
                }
            }
        });
    });

// router.route('/')
//     .get(function (req, res, next) {
//         let arrayIngredients = [];
//         const ingredient = 'apple';
//         const apiKey = process.env.API_KEY;
//         const url = `https://api.spoonacular.com/recipes/findByIngredients?apiKey=${apiKey}&ingredients=${ingredient}&number=1`;
//
//         request(url, function (err, response, body) {
//             if(err){
//                 console.log('error:', err);
//             } else {
//
//                 let current = JSON.parse(body);
//                 console.log(current);
//                 if(current[0].id == undefined){
//                     res.send(compiledFunction({
//                         info: 'Error, please try again'
//                     }));
//                 } else {
//                     res.send(compiledFunction({
//                         info: `The ingredient ID we are looking for is ${current[0].id}`
//                     }));
//                 }
//             }
//         });
//
//     });

router.route('/db')
  .post(function(req, res, next) {
    const apiKey = process.env.API_KEY;
    const urlPart1 = 'http://api.openweathermap.org/data/2.5/weather?q='
    const urlPart2 = '&appid=';
    const newUrl = urlPart1 + req.body.city + urlPart2 + apiKey;
    let mongo = db.getDB();

    request(newUrl, function (err, response, body) {
      if (err) {
        console.log('error:', err);
      } else {
        let current = JSON.parse(body);
        if (current.main == undefined || current.id == undefined) {
          res.send(({
            recipeID: 'Error, please try again'
          }));
        } else {

          mongo.collection('recipedata').insertOne(({
              recipeID: `${current[0].id}`,
              recipeTitle: `${current[0].title}`,
              recipeImage: `${current[0].image}`,
              missedIngredients: `${current[0].missedIngredients}`,
              usedIngredients: `${current[0].usedIngredients}`
          }))

          mongo.collection('recipedata').findOne({'usedIngredients': `${req.body.ingredientName}`}, (err, result) => {
            if (err) throw err;
            res.send({
                recipeID: `${result.id}`,
                recipeTitle: `${result.title}`,
                recipeImage: `${result.image}`,
                missedIngredients: `${result.missedIngredients}`,
                usedIngredients: `${result.usedIngredients}`,
            })
          })
        }
      }
    })
  });



db.connect((err, client) => {
    if (err) {
        console.log(`ERR: ${err}`);
    } else {
        console.log(`Connected`);
    }
});

module.exports = router;
