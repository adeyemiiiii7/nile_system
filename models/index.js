const { sequelize } = require('../config/database');

// Import models
const User = require('./user')(sequelize);
const Vendor = require('./vendor')(sequelize);
const Order = require('./order')(sequelize);

// Set up associations
Vendor.hasMany(Order, { foreignKey: 'vendorId', as: 'orders' });
Order.belongsTo(Vendor, { foreignKey: 'vendorId', as: 'vendor' });

User.hasMany(Vendor, { foreignKey: 'userId', as: 'vendors' });
Vendor.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = {
  sequelize,
  User,
  Vendor,
  Order
};