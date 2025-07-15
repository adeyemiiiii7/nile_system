const { Order, OrderItem, Product, Vendor } = require('../models');
const Joi = require('joi');

// Customer places an order for products 
const createOrder = async (req, res) => {
  try {
    const schema = Joi.object({
      items: Joi.array().items(
        Joi.object({
          productId: Joi.string().uuid().required(),
          quantity: Joi.number().integer().min(1).required()
        })
      ).min(1).required()
    });
    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    // Fetch all products and check stock
    const productIds = req.body.items.map(item => item.productId);
    const products = await Product.findAll({ where: { id: productIds } });
    if (products.length !== productIds.length) {
      return res.status(400).json({ error: 'One or more products not found' });
    }

    // Group items by vendorId
    const itemsByVendor = {};
    for (const item of req.body.items) {
      const product = products.find(p => p.id === item.productId);
      if (!product) {
        return res.status(400).json({ error: `Product not found: ${item.productId}` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for product: ${product.name}` });
      }
      if (!itemsByVendor[product.vendorId]) itemsByVendor[product.vendorId] = [];
      itemsByVendor[product.vendorId].push({ ...item, product });
    }

    // For each vendor, create an order and order items
    const createdOrders = [];
    for (const [vendorId, items] of Object.entries(itemsByVendor)) {
      // Calculate total for this vendor
      let totalAmount = 0;
      for (const item of items) {
        totalAmount += item.quantity * parseFloat(item.product.price);
      }
      // Create order for this vendor
      const order = await Order.create({
        orderId: `ORD-${Date.now()}-${vendorId}`,
        amount: totalAmount,
        status: 'pending',
        customerId: req.user.id,
        vendorId
      });
      // Create order items and decrement stock
      for (const item of items) {
        await OrderItem.create({
          orderId: order.id,
          productId: item.product.id,
          product: item.product.name,
          quantity: item.quantity,
          unitPrice: item.product.price
        });
        await item.product.update({ stock: item.product.stock - item.quantity });
      }
      createdOrders.push({
        orderId: order.orderId,
        amount: order.amount,
        status: order.status,
        vendorId: order.vendorId
      });
    }

    res.status(201).json({
      message: 'Order(s) placed successfully',
      orders: createdOrders
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Customers: get all their own orders
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { customerId: req.user.id },
      include: [
        { model: OrderItem, as: 'items' },
        { model: Vendor, as: 'vendor' }
      ]
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Customers: get a single order by id
const getMyOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({
      where: { id: req.params.id, customerId: req.user.id },
      include: [
        { model: OrderItem, as: 'items' },
        { model: Vendor, as: 'vendor' }
      ]
    });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getMyOrderById
}; 