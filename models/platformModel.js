//GROUP 2-15
//Conway Hogan
//Tiffany Hansen
//Elliot Pi
//Jaden Gatherum

//model for the platforms table

const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../db.js');
const SocialMedia = require('./socialMediaModel.js');

const Platform = sequelize.define('platform', {
    PlatformID: {
      type: DataTypes.INTEGER,
      unique: true,
    },
    Platform: {
      type: DataTypes.STRING,
    },
  }, {
    timestamps: false,
  });

module.exports = Platform;