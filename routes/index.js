var express = require('express');
var router = express.Router();
var models = require('../models');
var promise = require('promise');



/* GET home page. */
router.get('/', function(req, res, next) {
  models.ShadyURL.findAndCountAll({
  }).then(function(urls) {
    urls.rows = urls.rows.map(function(url) {
      url.catFact = url.shadyURL
        .split("shadify/")[1]
        .split("__")[0]
        .replace(/_/g, " ")
        + ".";
      return url;
    });
    console.log("rows:", urls.rows);
    res.render('index', { 
      title: "Cat Fact It",
      count: urls.count, 
      urls: urls.rows
    });
  });
});

/* GET API */
router.get('/api', function(req, res, next) {
  models.URL.findAndCountAll({
    include: [{
      model: models.ShadyURL,
      required: true
    }]
  }).then(function(urls) {
    res.send(urls);
  });
});

/* GET by ID API */
router.get('/api/:id', function(req, res, next) {
  models.URL.findAndCountAll({
    include: [{
      model: models.ShadyURL,
      required: true
    }]
  }).then(function(urls) {
    var response = urls.rows.filter(function(url) {
      console.log("url:", url);
      return url.dataValues.id == req.params.id;
    });
    res.send(response);
  });
});

/* POST url */
router.post('/', function(req, res) {
  req.checkBody('url', 'Enter a URL').notEmpty();
  req.sanitize('url').trim();
  var errors = req.validationErrors();
  if (errors) {
    res.render('index', { errors: errors });
  }
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
    models.URL.create({
      url: req.body.url,
      ShadyURL: { shadyURL: shadifiedURL }
    }, {
      include: [ ShadyURL ]
    })
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


/* POST API */
router.post('/api', function(req, res) {
  req.checkBody('url', 'Enter a URL').notEmpty();
  req.sanitize('url').trim();
  var errors = req.validationErrors();
  if (errors) {
    res.render('index', { errors: errors });
  }
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
      res.send(url);
    });
  })
  .catch(function(err) {
    console.log(err);
  });
});

/* DELETE API */
router.delete('/api/:id', function(req, res, next) {
  console.log('req:', req.params.id);
  models.ShadyURL.destroy({
    where: {
      id: req.params.id
    }
  })
  .then(function(response) {
      res.send(response);
  })
  .catch(function(err) {
      console.log(err);
  });
});

module.exports = router;
