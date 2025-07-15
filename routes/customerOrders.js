const express = require('express');
const { auth } = require('../middleware/auth');
const {
  createOrder,
  getMyOrders,
  getMyOrderById
} = require('../controllers/customerOrderController');

const router = express.Router();

// Customers: place an order
router.post('/', auth, createOrder);
// Customers: get all their own orders
router.get('/mine', auth, getMyOrders);
// Customers: get a single order by id
router.get('/mine/:id', auth, getMyOrderById);

module.exports = router; 