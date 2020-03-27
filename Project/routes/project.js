const express = require('express');
const router = express.Router();
const pug = require('pug');
const compiledFunction = pug.compileFile('views/project.pug');
const request = require('request');
const db = require('../mongo/mongo');

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

