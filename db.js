const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize('provo-city', 'postgres', 'Rut27.6161.90-3', {
    host: 'localhost',
    dialect: 'postgres',
  });

// Test the database connection
sequelize.authenticate()
  .then(() => {
    console.log('Connection to the database has been established successfully.');
  })
  .catch((error) => {
    console.error('Unable to connect to the database:', error);
  });

sequelize.sync({ force: false }) // Set force to true to drop and recreate tables on every sync
  .then(() => {
    console.log('Database and tables synced successfully.');
  })
  .catch((error) => {
    console.error('Error syncing database:', error);
  });

module.exports = sequelize;