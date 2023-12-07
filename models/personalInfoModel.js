const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../db.js');
const SocialMedia = require('./socialMediaModel.js');

const PersonalInfo = sequelize.define('peoples', {
    EntryID: {
      type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        unique: true,
    },
    Age: {
        type: DataTypes.INTEGER,
      },
    Gender: {
        type: DataTypes.STRING,
      },
    RelationshipStatus: {
        type: DataTypes.STRING,
      },
    OccupationStatus: {
        type: DataTypes.STRING,
      },
    Location: {
        type: DataTypes.STRING,
      },
    UseSocialMedia: {
        type: DataTypes.STRING,
      },
    AvgTimeSpent: {
        type: DataTypes.STRING,
      },
    OftenSpent: {
        type: DataTypes.INTEGER,
      },
    Restless: {
        type: DataTypes.INTEGER,
      },
    Distracted: {
        type: DataTypes.INTEGER,
      },
    Worries: {
        type: DataTypes.INTEGER,
      },
    Concentration: {
        type: DataTypes.INTEGER,
      },
    CompareSuccess: {
        type: DataTypes.INTEGER,
      },
    FeelAboutComparison: {
        type: DataTypes.INTEGER,
      },
    SeekValidation: {
        type: DataTypes.INTEGER,
      },
    Depressed: {
        type: DataTypes.INTEGER,
      },
    InterestDailyActivites: {
        type: DataTypes.INTEGER,
      },
    Sleep: {
        type: DataTypes.INTEGER,
      },
  }, {
        timestamps: true,
        createdAt: 'Timestamp',
        updatedAt: false, // Disable the updatedAt timestamp
  });

//   PersonalInfo.hasMany(SocialMedia, { as: 'socialMedia', foreignKey: 'EntryID' });

module.exports = PersonalInfo;