'use strict';
module.exports = (sequelize, DataTypes) => {
  var ShadyURL = sequelize.define('ShadyURL', {
    shadyURL: DataTypes.STRING
  });

  ShadyURL.associate = function(models) {
    ShadyURL.belongsTo(models.URL);
  }

  return ShadyURL;
};
