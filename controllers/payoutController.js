const { Order, Vendor } = require('../models');
const { Op } = require('sequelize');

const getVendorPayout = async (req, res) => {
  try {
    const { vendorId } = req.params;

    // Check if vendor belongs to the authenticated user
    const vendor = await Vendor.findOne({
      where: { 
        id: vendorId,
        userId: req.user.id
      }
    });

    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    // Get all completed orders for this vendor
    const completedOrders = await Order.findAll({
      where: {
        vendorId: vendorId,
        status: 'completed'
      }
    });

    // Calculate totals
    const totalOrders = completedOrders.length;
    const totalAmount = completedOrders.reduce((sum, order) => {
      return sum + parseFloat(order.amount);
    }, 0);
    // Assuming a fixed platform fee rate of 5%
    const platformFeeRate = 0.05; 
    const platformFee = totalAmount * platformFeeRate;
    const netPayout = totalAmount - platformFee;

    res.json({
      vendor: vendor.store_name,
      total_orders: totalOrders,
      total_amount: totalAmount,
      platform_fee: platformFee,
      net_payout: netPayout
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Admin function to access any vendor's payout
const getAdminVendorPayout = async (req, res) => {
  try {
    const { vendorId } = req.params;

    // Admin can access any vendor (no ownership check)
    const vendor = await Vendor.findByPk(vendorId);

    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    // Get all completed orders for this vendor
    const completedOrders = await Order.findAll({
      where: {
        vendorId: vendorId,
        status: 'completed'
      }
    });
    const totalOrders = completedOrders.length;
    const totalAmount = completedOrders.reduce((sum, order) => {
      return sum + parseFloat(order.amount);
    }, 0);

    const platformFeeRate = 0.05; 
    const platformFee = totalAmount * platformFeeRate;
    const netPayout = totalAmount - platformFee;

    res.json({
      vendor_id: vendor.id,
      vendor: vendor.store_name,
      vendor_owner: vendor.userId,
      total_orders: totalOrders,
      total_amount: totalAmount,
      platform_fee: platformFee,
      net_payout: netPayout,
      accessed_by_admin: true
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllVendorPayoutsCompleted = async (req, res) => {
  try {
    // Get all vendors for the authenticated user
    const vendors = await Vendor.findAll({
      where: { userId: req.user.id },
      include: [{
        model: Order,
        as: 'orders',
        where: { status: 'completed' },
        required: false
      }]
    });

    const payouts = vendors.map(vendor => {
      const completedOrders = vendor.orders || [];
      const totalOrders = completedOrders.length;
      const totalAmount = completedOrders.reduce((sum, order) => {
        return sum + parseFloat(order.amount);
      }, 0);

      const platformFeeRate = 0.05; 
      const platformFee = totalAmount * platformFeeRate;
      const netPayout = totalAmount - platformFee;

      return {
        vendor_id: vendor.id,
        vendor: vendor.store_name,
        total_orders: totalOrders,
        total_amount: totalAmount,
        platform_fee: platformFee,
        net_payout: netPayout
      };
    });

    res.json(payouts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getVendorPayout,
  getAdminVendorPayout,
  getAllVendorPayoutsCompleted
};
