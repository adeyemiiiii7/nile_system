const jwt = require('jsonwebtoken');
const { User, Vendor } = require('../models');
const Joi = require('joi');

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

// Customer registration
const registerCustomer = async (req, res) => {
  try {
    const schema = Joi.object({
      name: Joi.string().min(2).max(50).required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(6).required()
    });

    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create user (always isAdmin: false)
    const user = await User.create({ name, email, password });

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const registerVendor = async (req, res) => {
  try {
    const schema = Joi.object({
      name: Joi.string().min(2).max(50).required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(6).required(),
      storeName: Joi.string().min(2).max(100).required(),
      bankAccount: Joi.string().min(6).max(30).required()
    });

    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { name, email, password, storeName, bankAccount } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    const existingVendor = await Vendor.findOne({ where: { email } });
    if (existingUser || existingVendor) {
      return res.status(400).json({ error: 'A vendor account with this email already exists' });
    }

    // Create user (always isAdmin: false)
    const user = await User.create({ name, email, password });

    // Create vendor (linked to user)
    const vendor = await Vendor.create({
      name,
      email,
      storeName,
      bankAccount,
      userId: user.id
    });

    res.status(201).json({
      message: 'Vendor account created successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      vendor: {
        id: vendor.id,
        storeName: vendor.storeName,
        bankAccount: vendor.bankAccount
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const loginVendor = async (req, res) => {
  try {
    const schema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required()
    });

    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await user.checkPassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Find vendor
    const vendor = await Vendor.findOne({ where: { email, userId: user.id } });
    if (!vendor) {
      return res.status(401).json({ error: 'No vendor account found for this user' });
    }

    const token = generateToken(user.id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      vendor: {
        id: vendor.id,
        storeName: vendor.storeName,
        bankAccount: vendor.bankAccount
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Customer login 
const loginCustomer = async (req, res) => {
  try {
    const schema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required()
    });

    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await user.checkPassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if user is a vendor
    const vendor = await Vendor.findOne({ where: { userId: user.id } });
    if (vendor) {
      return res.status(403).json({ error: 'This account is a vendor. Please use the vendor login.' });
    }

    const token = generateToken(user.id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// /api/auth/login is for customers only
// /api/auth/login-vendor is for vendors only
// /api/auth/register-customer is for customers only
// /api/auth/register-vendor is for vendors only
module.exports = {
  registerCustomer,
  loginCustomer,
  loginVendor,
  registerVendor
};