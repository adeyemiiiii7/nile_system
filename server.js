require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { sequelize, testConnection } = require('./config/database');
const { User } = require('./models');
const vendorRoutes = require('./routes/vendors');
const orderRoutes = require('./routes/orders');
const payoutRoutes = require('./routes/payouts');
const authRoutes = require('./routes/auth');
const { seedDatabase } = require('./seeders/mockData');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payouts', payoutRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'API is running', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});
// 404 Not Found handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Initialize database
const initializeDatabase = async () => {
  await testConnection();
  await sequelize.sync({ force: false });
  console.log('Database synchronized');
  
  // Check if database is empty and seed if necessary
  const userCount = await User.count();
  if (userCount === 0) {
    console.log('Database is empty, seeding with initial data...');
    await seedDatabase();
    console.log('Database seeded successfully');
  } else {
    console.log('Database already contains data, skipping seeding');
  }
};
async function startServer() {
  try {
    await initializeDatabase();
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
    process.exit(1);
  }
}

startServer();