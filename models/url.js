'use strict';
module.exports = (sequelize, DataTypes) => {
  var URL = sequelize.define('URL', {
    url: DataTypes.STRING
  });

  URL.associate = function(models) {
    URL.hasOne(models.ShadyURL);
  }

  return URL;
};
