const { Order, Vendor } = require('../models');
const Joi = require('joi');

const createOrder = async (req, res) => {
  try {
    const schema = Joi.object({
      orderId: Joi.string().required(),
      amount: Joi.number().positive().required(),
      status: Joi.string().valid('pending', 'completed').default('pending'),
      vendorId: Joi.string().uuid().required()
    });

    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    const vendor = await Vendor.findOne({
      where: { 
        id: req.body.vendorId,
        userId: req.user.id
      }
    });

    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    const order = await Order.create(req.body);
    res.status(201).json({
      message: 'Order created successfully',
      order
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Order ID already exists' });
    }
    res.status(500).json({ error: error.message });
  }
};

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

module.exports = {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
  deleteOrder
};
