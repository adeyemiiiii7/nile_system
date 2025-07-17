const bcrypt = require('bcryptjs');
const { User, Vendor, Product, Order, OrderItem } = require('../models');

const mockVendorUsers = [
  { name: 'Adebayo Ogundimu', email: 'adebayo.ogundimu@example.com', password: 'password123' },
  { name: 'Chioma Okechukwu', email: 'chioma.okechukwu@example.com', password: 'password123' }
];

const mockCustomerUsers = [
  { name: 'Customer One', email: 'customer1@example.com', password: 'password123' },
  { name: 'Customer Two', email: 'customer2@example.com', password: 'password123' }
];

const mockVendors = [
  {
    name: 'Adebayo Ogundimu',
    storeName: 'Lagos Fashion Hub',
    email: 'adebayo.ogundimu@example.com',
    bankAccount: '0123456789',
    userIndex: 0
  },
  {
    name: 'Chioma Okechukwu',
    storeName: 'Igbo Delicacies',
    email: 'chioma.okechukwu@example.com',
    bankAccount: '0987654321',
    userIndex: 1
  }
];

const mockProducts = [
  // Products for Lagos Fashion Hub
  { name: 'Denim Jacket', price: 15000, stock: 10, vendorIndex: 0, description: 'Classic denim jacket.' },
  { name: 'Sneakers', price: 12000, stock: 20, vendorIndex: 0, description: 'Trendy sneakers.' },
  // Products for Igbo Delicacies
  { name: 'Igbo Soup', price: 5000, stock: 30, vendorIndex: 1, description: 'Delicious Igbo soup.' },
  { name: 'Efo Riro', price: 3000, stock: 25, vendorIndex: 1, description: 'Yoruba vegetable soup.' }
];

const mockOrders = [
  // Customer One buys 2 Denim Jackets and 1 Sneakers from Lagos Fashion Hub
  {
    customerIndex: 2, // Customer One (index in allUsers)
    vendorIndex: 0, // Lagos Fashion Hub
    items: [
      { productIndex: 0, quantity: 2 }, // Denim Jacket
      { productIndex: 1, quantity: 1 }  // Sneakers
    ]
  },
  // Customer Two buys 3 Igbo Soup from Igbo Delicacies
  {
    customerIndex: 3, // Customer Two (index in allUsers)
    vendorIndex: 1, // Igbo Delicacies
    items: [
      { productIndex: 2, quantity: 3 } // Igbo Soup
    ]
  }
];

const seedDatabase = async () => {
  try {
    console.log('Starting database seeding...');

    // Clear existing data
    await OrderItem.destroy({ where: {} });
    await Order.destroy({ where: {} });
    await Product.destroy({ where: {} });
    await Vendor.destroy({ where: {} });
    await User.destroy({ where: {} });

    // Create users (vendors, customers, admins)
    const allUsers = [...mockVendorUsers, ...mockCustomerUsers];
    // Only vendor and customer users are seeded. Admins must be created manually or via a separate admin seeder.
    const createdUsers = [];
    for (const userData of allUsers) {
      const user = await User.create(userData);
      createdUsers.push(user);
    }
    console.log(`${createdUsers.length} users created`);

    // Create vendors (link to vendor users only)
    const createdVendors = [];
    for (const vendorData of mockVendors) {
      const vendorUser = createdUsers[vendorData.userIndex];
      const vendor = await Vendor.create({
        name: vendorData.name,
        storeName: vendorData.storeName,
        email: vendorData.email,
        bankAccount: vendorData.bankAccount,
        userId: vendorUser.id
      });
      createdVendors.push(vendor);
    }
    console.log(`${createdVendors.length} vendors created`);

    // Create products
    const createdProducts = [];
    for (const productData of mockProducts) {
      const product = await Product.create({
        ...productData,
        vendorId: createdVendors[productData.vendorIndex].id
      });
      createdProducts.push(product);
    }
    console.log(`${createdProducts.length} products created`);

    // Create orders and order items
    for (const orderData of mockOrders) {
      const customer = createdUsers[orderData.customerIndex];
      const vendor = createdVendors[orderData.vendorIndex];
      let totalAmount = 0;
      // Calculate total and check stock
      for (const item of orderData.items) {
        const product = createdProducts[item.productIndex];
        if (product.stock < item.quantity) throw new Error(`Insufficient stock for ${product.name}`);
        totalAmount += item.quantity * parseFloat(product.price);
      }
      // Create order
      const order = await Order.create({
        orderId: `ORD-${Date.now()}-${Math.floor(Math.random()*10000)}`,
        amount: totalAmount,
        status: 'pending',
        customerId: customer.id,
        vendorId: vendor.id
      });
      // Create order items and decrement stock
      for (const item of orderData.items) {
        const product = createdProducts[item.productIndex];
        await OrderItem.create({
          orderId: order.id,
          productId: product.id,
          product: product.name,
          quantity: item.quantity,
          unitPrice: product.price
        });
        await product.update({ stock: product.stock - item.quantity });
      }
    }
    console.log(`${mockOrders.length} orders created`);

    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
};

module.exports = {
  seedDatabase
};