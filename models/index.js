const { sequelize } = require('../config/database');

// Import models
const User = require('./user')(sequelize);
const Vendor = require('./vendor')(sequelize);
const Order = require('./order')(sequelize);
const OrderItem = require('./orderItem')(sequelize);
const Product = require('./product')(sequelize);

// Set up associations
Vendor.hasMany(Order, { foreignKey: 'vendorId', as: 'orders' });
Order.belongsTo(Vendor, { foreignKey: 'vendorId', as: 'vendor' });

User.hasMany(Vendor, { foreignKey: 'userId', as: 'vendors' });
Vendor.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

Vendor.hasMany(Product, { foreignKey: 'vendorId', as: 'products' });
Product.belongsTo(Vendor, { foreignKey: 'vendorId', as: 'vendor' });

Product.hasMany(OrderItem, { foreignKey: 'productId', as: 'orderItems' });
OrderItem.belongsTo(Product, { foreignKey: 'productId', as: 'productDetails' });

module.exports = {
  sequelize,
  User,
  Vendor,
  Order,
  OrderItem,
  Product
};