const { Product } = require('../models');
const Joi = require('joi');

// Create a new product (vendor only)
const createProduct = async (req, res) => {
  try {
    if (!req.vendor) return res.status(403).json({ error: 'No vendor account found for this user.' });
    const schema = Joi.object({
      name: Joi.string().min(2).max(100).required(),
      price: Joi.number().positive().required(),
      description: Joi.string().allow('', null),
      stock: Joi.number().integer().min(0).required()
    });
    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });
    const product = await Product.create({
      ...req.body,
      vendorId: req.vendor.id
    });
    res.status(201).json({ message: 'Product created successfully', product });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all products for the logged-in vendor
const getMyProducts = async (req, res) => {
  try {
    if (!req.vendor) return res.status(403).json({ error: 'No vendor account found for this user.' });
    const products = await Product.findAll({ where: { vendorId: req.vendor.id } });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a product (vendor only)
const updateProduct = async (req, res) => {
  try {
    if (!req.vendor) return res.status(403).json({ error: 'No vendor account found for this user.' });
    const schema = Joi.object({
      name: Joi.string().min(2).max(100),
      price: Joi.number().positive(),
      description: Joi.string().allow('', null),
      stock: Joi.number().integer().min(0)
    });
    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });
    const product = await Product.findOne({ where: { id: req.params.id, vendorId: req.vendor.id } });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    await product.update(req.body);
    res.json({ message: 'Product updated successfully', product });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a product (vendor only)
const deleteProduct = async (req, res) => {
  try {
    if (!req.vendor) return res.status(403).json({ error: 'No vendor account found for this user.' });
    const product = await Product.findOne({ where: { id: req.params.id, vendorId: req.vendor.id } });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    await product.destroy();
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Public: Get all products (for customers to browse)
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.findAll();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Public: Get a single product by ID
const getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({ where: { id: req.params.id } });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createProduct,
  getMyProducts,
  updateProduct,
  deleteProduct,
  getAllProducts,
  getProductById
}; 