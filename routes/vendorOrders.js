const express = require('express');
const { auth } = require('../middleware/auth');
const {
  getAllOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
  getOrderReport
} = require('../controllers/vendorOrderController');

const router = express.Router();

// Vendors: view their orders
router.get('/', auth, getAllOrders);
router.get('/:id', auth, getOrderById);
router.put('/:id', auth, updateOrder);
router.delete('/:id', auth, deleteOrder);
// Vendor: get order history report
router.get('/report', auth, getOrderReport);

module.exports = router; 