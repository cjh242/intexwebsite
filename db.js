const { Sequelize, DataTypes } = require('sequelize');
const host = process.env.RDS_HOSTNAME || 'awseb-e-nb7cmcmwjc-stack-awsebrdsdatabase-bopcyuvmiakw.cgflce8swton.us-east-1.rds.amazonaws.com';
const UserName = process.env.RDS_USERNAME || 'postgres';
const Password = process.env.RDS_PASSWORD || 'Elliot24Conway23';
const name = process.env.RDS_DB_NAME || 'ebdb';
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

sequelize.sync({ force: false }) // Set force to true to drop and recreate tables on every sync
  .then(() => {
    console.log('Database and tables synced successfully.');
  })
  .catch((error) => {
    console.error('Error syncing database:', error);
  });

module.exports = sequelize;