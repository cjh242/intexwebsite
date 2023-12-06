const { Sequelize, DataTypes } = require('sequelize');
const host = process.env.RDS_HOSTNAME || 'localhost';
const UserName = process.env.RDS_USERNAME || 'postgres';
const Password = process.env.RDS_PASSWORD || 'Rut27.6161.90-3';
const name = process.env.RDS_DB_NAME || 'provo-city';
const Port = process.env.RDS_PORT || 5432;

const sequelize = new Sequelize(name, UserName, Password, {
    host: host,
    port: Port,
    dialect: 'postgres',
    dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false, // Use only if using a self-signed certificate or if not using a certificate
        },
      },
  });

// Test the database connection
sequelize.authenticate()
  .then(() => {
    console.log('Connection to the database has been established successfully.');
  })
  .catch((error) => {
    console.error('Unable to connect to the database:', error);
  });

sequelize.sync({ force: true }) // Set force to true to drop and recreate tables on every sync
  .then(() => {
    console.log('Database and tables synced successfully.');
  })
  .catch((error) => {
    console.error('Error syncing database:', error);
  });

module.exports = sequelize;