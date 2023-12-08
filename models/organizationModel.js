//GROUP 2-15
//Conway Hogan
//Tiffany Hansen
//Elliot Pi
//Jaden Gatherum

//model for our table that has organization id and organization
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../db.js');
const SocialMedia = require('./socialMediaModel.js');

const Organization = sequelize.define('organization', {
    OrganizationID: {
        type: DataTypes.INTEGER,
        unique: true,
      },
      Organization: {
        type: DataTypes.STRING,
      },
    }, {
      timestamps: false,
    });

module.exports = Organization;