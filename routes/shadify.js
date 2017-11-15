var express = require('express');
var router = express.Router();
var models = require('../models');

/* GET Redirect to matching URL */
router.get('/:shady_url', function(req, res) {
  var requestURL = req.protocol + '://' + req.get('host') + req.originalUrl;
  console.log('requestURL:', requestURL);
  models.URL.findAndCountAll({
    include: [{
      model: models.ShadyURL,
      where: { shadyURL: requestURL},
      required: true
    }],
    limit: 1
  })
  .then(response => {
    console.log("redirecting to:", response.rows[0].url);
    res.redirect(response.rows[0].url);
  });
});

module.exports = router;
