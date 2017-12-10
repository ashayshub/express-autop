/*jslint node: true */
/*jshint esversion: 6 */

'use strict';

module.exports = (sequelize, DataTypes) => {
  var Car = sequelize.define('Car', {
    title: DataTypes.STRING(120),
    car_type: DataTypes.STRING(20),
    car_make: DataTypes.STRING(120),
    car_model: DataTypes.STRING(120),
    year: DataTypes.STRING(120),
    summary: DataTypes.STRING(255),
    image: DataTypes.STRING(255),
    price_query: DataTypes.STRING(255)
  },
  {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    },
    freezeTableName: true
  });
  return Car;
};