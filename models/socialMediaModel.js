const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../db.js');
const PersonalInfo = require('./personalInfoModel.js');
const Platform = require('./platformModel.js');
const Organization = require('./organizationModel.js');

const SocialMedia = sequelize.define('social_media_mental_health', {
    Age: {
      type: DataTypes.INTEGER,
    },
    Gender: {
      type: DataTypes.STRING,
    },
    OrganizationID: {
      type: DataTypes.INTEGER,
    },
    PlatformID: {
       type: DataTypes.INTEGER,
    },
  }, {
        timestamps: true,
        createdAt: 'Timestamp',
        updatedAt: false,
  });

SocialMedia.belongsTo(PersonalInfo, {
    foreignKey: 'EntryID'
  });

SocialMedia.hasMany(Platform, {
    foreignKey: 'PlatformID'
});

SocialMedia.hasMany(Organization, {
    foreignKey: 'OrganizationID'
});

module.exports = SocialMedia;