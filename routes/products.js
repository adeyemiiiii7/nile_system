const express = require('express');
const { auth } = require('../middleware/auth');
const {
  createProduct,
  getMyProducts,
  updateProduct,
  deleteProduct,
  getAllProducts,
  getProductById
} = require('../controllers/productController');

const router = express.Router();

// Public: Browse all products
router.get('/', getAllProducts);

// Public: Get a single product by ID
router.get('/:id', getProductById);

// Vendor-only: manage own products
router.post('/', auth, createProduct);
router.get('/mine', auth, getMyProducts);
router.put('/:id', auth, updateProduct);
router.delete('/:id', auth, deleteProduct);

module.exports = router; 