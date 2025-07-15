const { Order, OrderItem, Vendor } = require('../models');
const Joi = require('joi');
const { Op } = require('sequelize');

// Vendors: get all their orders
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [{
        model: Vendor,
        as: 'vendor',
        where: { userId: req.user.id }
      }]
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Vendors: get a single order by id
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({
      where: { id: req.params.id },
      include: [{
        model: Vendor,
        as: 'vendor',
        where: { userId: req.user.id }
      }]
    });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Vendors: update an order
const updateOrder = async (req, res) => {
  try {
    const schema = Joi.object({
      order_id: Joi.string(),
      amount: Joi.number().positive(),
      status: Joi.string().valid('pending', 'completed')
    });

    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const order = await Order.findOne({
      where: { id: req.params.id },
      include: [{
        model: Vendor,
        as: 'vendor',
        where: { userId: req.user.id }
      }]
    });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    await order.update(req.body);
    res.json({
      message: 'Order updated successfully',
      order
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Vendors: delete an order
const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      where: { id: req.params.id },
      include: [{
        model: Vendor,
        as: 'vendor',
        where: { userId: req.user.id }
      }]
    });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    await order.destroy();
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Vendor: get order history report
const getOrderReport = async (req, res) => {
  try {
    if (!req.vendor) return res.status(403).json({ error: 'No vendor account found for this user.' });

    const { from, to } = req.query;
    if (!from || !to) return res.status(400).json({ error: 'from and to dates are required' });

    const orders = await Order.findAll({
      where: {
        vendorId: req.vendor.id,
        status: 'completed',
        createdAt: { [Op.between]: [new Date(from), new Date(to)] }
      },
      include: [{ model: OrderItem, as: 'items' }]
    });

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.amount), 0);

    // Aggregate top-selling products
    const productSales = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        if (!productSales[item.productId]) {
          productSales[item.productId] = { name: item.product, quantity: 0 };
        }
        productSales[item.productId].quantity += item.quantity;
      });
    });

    const topProducts = Object.entries(productSales)
      .sort((a, b) => b[1].quantity - a[1].quantity)
      .map(([productId, data]) => ({ productId, name: data.name, quantity: data.quantity }))
      .slice(0, 5);

    res.json({
      totalOrders,
      totalRevenue,
      topProducts
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
  getOrderReport
}; 