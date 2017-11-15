var express = require('express');
var router = express.Router();
var models = require('../models');
var promise = require('promise');



/* GET home page. */
router.get('/', function(req, res, next) {
  models.ShadyURL.findAndCountAll({
  }).then(function(urls) {
    //res.send(urls);
    res.render('index', { 
      title: "Cat Fact It",
      count: urls.count, 
      urls: urls.rows
    });
  });
});

/* GET data */
router.get('/debug', function(req, res, next) {
  models.URL.findAndCountAll({
    include: [{
      model: models.ShadyURL,
      required: true
    }]
  }).then(function(urls) {
    res.send(urls);
  });
});


/* POST url */
router.post('/', function(req, res) {
  req.checkBody('url', 'Enter a URL').notEmpty();
  //req.sanitize('url').escape();
  req.sanitize('url').trim();
  var errors = req.validationErrors();
  if (errors) {
    res.render('index', { errors: errors });
  }
  console.log("req:", req.body.url);
  if (!req.body.url.match(/^https?:\/\/\S*$/)) { 
    res.render('index', { urls: {}, errors: "Invalid URL" });
    return;
  }
  var URLModel = models.URL;
  var BASE_URL = req.protocol + '://' + req.get('host') + req.originalUrl;

  function getFact() {
    return new Promise(function(resolve, reject) {
      var request = require('request');
      request('http://catfact.ninja/fact', function(error, response, body) {
        if (error) reject(error);
        resolve(response.body);
      });
    });
  }
  
  getFact().then(function(fact) {
    fact = JSON.parse(fact).fact.replace(/\W+/g, "_");

    var ShadyURL = models.ShadyURL;
    var shadifiedURL = BASE_URL + "shadify/" + fact + "_" + new Date().getTime(); 
    console.log(shadifiedURL);
    //models.URL.create({
    models.URL.create({
      url: req.body.url,
      //url: req.body.url,
      ShadyURL: { shadyURL: shadifiedURL }
    }, {
      include: [ ShadyURL ]
    })
    //.spread((url, created) => {
    .then(url => {
      res.render('index', { 
        title: "Cat Fact It",
        original: req.body.url, 
        shadifiedURL: shadifiedURL
      });
    });
  })
  .catch(function(err) {
    console.log(err);
  });
});


module.exports = router;
