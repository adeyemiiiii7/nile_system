const { Sequelize } = require('sequelize');
const path = require('path');

// Database configuration
const config = {
  development: {
    dialect: 'sqlite',
    storage: path.join(__dirname, '..', 'database.sqlite'),
    logging: console.log
  },
  test: {
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false
  },
  production: {
    dialect: 'sqlite',
    storage: path.join(__dirname, '..', 'database.sqlite'),
    logging: false
  }
};

const env = process.env.NODE_ENV || 'development';
const sequelize = new Sequelize(config[env]);

// Test database connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log(`Database connection established successfully in ${env} mode`);
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

module.exports = { sequelize, testConnection };