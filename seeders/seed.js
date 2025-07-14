const { sequelize } = require('../models');
const { seedDatabase } = require('./mockData');

async function runSeeder() {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully');

    // Sync database (create tables if they don't exist)
    await sequelize.sync({ force: true }); 
    console.log('Database synchronized');
    await seedDatabase();

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

runSeeder();