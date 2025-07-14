const bcrypt = require('bcryptjs');
const { User, Vendor, Order } = require('../models');

const mockUsers = [
  {
    name: 'Adebayo Ogundimu',
    email: 'adebayo.ogundimu@example.com',
    password: 'password123',
    isAdmin: false
  },
  {
    name: 'Chioma Okechukwu',
    email: 'chioma.okechukwu@example.com',
    password: 'password123',
    isAdmin: false
  },
  {
    name: 'Fatima Abdullahi',
    email: 'fatima.abdullahi@example.com',
    password: 'password123',
    isAdmin: false
  },
  {
    name: 'Emeka Nwosu',
    email: 'emeka.nwosu@example.com',
    password: 'password123',
    isAdmin: false
  },
  {
    name: 'Aisha Garba',
    email: 'aisha.garba@example.com',
    password: 'password123',
    isAdmin: false
  },

  {
    name: 'Nile Platform Admin',
    email: 'admin@nile.ng',
    password: 'admin123',
    isAdmin: true
  },
  {
    name: 'Nile Support Team',
    email: 'support@nile.ng',
    password: 'support123',
    isAdmin: true
  }
];

const mockVendors = [
  {
    name: 'Adebayo Ogundimu',
    store_name: 'Lagos Fashion Hub',
    email: 'contact@lagosfashionhub.ng',
    bank_account: '0123456789',
    userId: 1
  },
  {
    name: 'Chioma Okechukwu',
    store_name: 'Igbo Delicacies',
    email: 'orders@igbodelicacies.com',
    bank_account: '0987654321',
    userId: 2
  },
  {
    name: 'Fatima Abdullahi',
    store_name: 'Northern Crafts',
    email: 'info@northerncrafts.ng',
    bank_account: '0112233445',
    userId: 3
  },
  {
    name: 'Emeka Nwosu',
    store_name: 'Tech Gadgets NG',
    email: 'sales@techgadgetsng.com',
    bank_account: '0556677889',
    userId: 4
  },
  {
    name: 'Aisha Garba',
    store_name: 'Kano Textiles',
    email: 'business@kanotextiles.ng',
    bank_account: '0998877665',
    userId: 5
  },
  {
    name: 'Adebayo Ogundimu',
    store_name: 'Yoruba Artisans',
    email: 'contact@yorubaartisans.ng',
    bank_account: '0445566778',
    userId: 1
  }
];

const mockOrders = [
  // Lagos Fashion Hub orders
  {
    order_id: 'LFH-2024-001',
    amount: 45000.00,
    status: 'completed',
    vendorId: 1
  },
  {
    order_id: 'LFH-2024-002',
    amount: 32000.00,
    status: 'completed',
    vendorId: 1
  },
  {
    order_id: 'LFH-2024-003',
    amount: 78000.00,
    status: 'pending',
    vendorId: 1
  },
  {
    order_id: 'LFH-2024-004',
    amount: 25000.00,
    status: 'completed',
    vendorId: 1
  },

  // Igbo Delicacies orders
  {
    order_id: 'IGD-2024-001',
    amount: 15000.00,
    status: 'completed',
    vendorId: 2
  },
  {
    order_id: 'IGD-2024-002',
    amount: 28000.00,
    status: 'completed',
    vendorId: 2
  },
  {
    order_id: 'IGD-2024-003',
    amount: 12000.00,
    status: 'pending',
    vendorId: 2
  },

  // Northern Crafts orders
  {
    order_id: 'NCR-2024-001',
    amount: 65000.00,
    status: 'completed',
    vendorId: 3
  },
  {
    order_id: 'NCR-2024-002',
    amount: 42000.00,
    status: 'completed',
    vendorId: 3
  },
  {
    order_id: 'NCR-2024-003',
    amount: 38000.00,
    status: 'pending',
    vendorId: 3
  },
  {
    order_id: 'NCR-2024-004',
    amount: 55000.00,
    status: 'completed',
    vendorId: 3
  },

  // Tech Gadgets NG orders
  {
    order_id: 'TGN-2024-001',
    amount: 125000.00,
    status: 'completed',
    vendorId: 4
  },
  {
    order_id: 'TGN-2024-002',
    amount: 89000.00,
    status: 'completed',
    vendorId: 4
  },
  {
    order_id: 'TGN-2024-003',
    amount: 156000.00,
    status: 'pending',
    vendorId: 4
  },
  {
    order_id: 'TGN-2024-004',
    amount: 78000.00,
    status: 'completed',
    vendorId: 4
  },
  {
    order_id: 'TGN-2024-005',
    amount: 234000.00,
    status: 'completed',
    vendorId: 4
  },

  // Kano Textiles orders
  {
    order_id: 'KTX-2024-001',
    amount: 85000.00,
    status: 'completed',
    vendorId: 5
  },
  {
    order_id: 'KTX-2024-002',
    amount: 92000.00,
    status: 'completed',
    vendorId: 5
  },
  {
    order_id: 'KTX-2024-003',
    amount: 67000.00,
    status: 'pending',
    vendorId: 5
  },

  // Yoruba Artisans orders
  {
    order_id: 'YAR-2024-001',
    amount: 35000.00,
    status: 'completed',
    vendorId: 6
  },
  {
    order_id: 'YAR-2024-002',
    amount: 48000.00,
    status: 'completed',
    vendorId: 6
  },
  {
    order_id: 'YAR-2024-003',
    amount: 29000.00,
    status: 'pending',
    vendorId: 6
  }
];

const seedDatabase = async () => {
  try {
    console.log('Starting database seeding...');

    // Clear existing data
    await Order.destroy({ where: {} });
    await Vendor.destroy({ where: {} });
    await User.destroy({ where: {} });

    console.log('Existing data cleared');

    // Create users and store their IDs
    const createdUsers = [];
    for (const userData of mockUsers) {
      const user = await User.create(userData);
      createdUsers.push(user);
    }
    console.log(`${createdUsers.length} users created`);
    
    // Log admin users for easy access
    const adminUsers = createdUsers.filter(user => user.isAdmin);
    console.log(`Admin users: ${adminUsers.map(u => u.email).join(', ')}`);

    // Create vendors with proper user references
    const createdVendors = [];
    for (let i = 0; i < mockVendors.length; i++) {
      const vendorData = mockVendors[i];
      const userIndex = (vendorData.userId - 1) % createdUsers.length; 
      const vendor = await Vendor.create({
        name: vendorData.name,
        storeName: vendorData.store_name,
        email: vendorData.email,
        bankAccount: vendorData.bank_account,
        userId: createdUsers[userIndex].id
      });
      createdVendors.push(vendor);
    }
    console.log(`${createdVendors.length} vendors created`);

    // Create orders with proper vendor references
    for (let i = 0; i < mockOrders.length; i++) {
      const orderData = mockOrders[i];
      const vendorIndex = (orderData.vendorId - 1) % createdVendors.length; 
      await Order.create({
        orderId: orderData.order_id,
        amount: orderData.amount,
        status: orderData.status,
        vendorId: createdVendors[vendorIndex].id
      });
    }
    console.log(`${mockOrders.length} orders created`);

    console.log('Database seeding completed successfully!');
    
    // Display summary
    // const userCount = await User.count();
    // const vendorCount = await Vendor.count();
    // const orderCount = await Order.count();
    // const completedOrders = await Order.count({ where: { status: 'completed' } });
    // const pendingOrders = await Order.count({ where: { status: 'pending' } });

    // console.log('\n=== Database Summary ===');
    // console.log(`Users: ${userCount}`);
    // console.log(`Vendors: ${vendorCount}`);
    // console.log(`Orders: ${orderCount}`);
    // console.log(`  - Completed: ${completedOrders}`);
    // console.log(`  - Pending: ${pendingOrders}`);
    // console.log('========================\n');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
};

const getRandomUser = () => {
  return mockUsers[Math.floor(Math.random() * mockUsers.length)];
};

const getRandomVendor = () => {
  return mockVendors[Math.floor(Math.random() * mockVendors.length)];
};

const getUserCredentials = () => {
  return mockUsers.map(user => ({
    email: user.email,
    password: user.password
  }));
};

const getAdminCredentials = () => {
  return mockUsers
    .filter(user => user.isAdmin)
    .map(user => ({
      email: user.email,
      password: user.password
    }));
};

module.exports = {
  seedDatabase,
  getRandomUser,
  getRandomVendor,
  getUserCredentials,
  getAdminCredentials,
  mockUsers,
  mockVendors,
  mockOrders
};