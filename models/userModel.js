const { DataTypes } = require('sequelize');
const sequelize = require('sequelize');

const User = sequelize.define('user', {
    email: {
      type: DataTypes.STRING,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
    },
  }, {
    timestamps: false,
  });

module.exports = User;