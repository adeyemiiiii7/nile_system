const { Vendor } = require('../models');
const Joi = require('joi');

const createVendor = async (req, res) => {
  try {
    const schema = Joi.object({
      name: Joi.string().min(2).max(50).required(),
      store_name: Joi.string().min(2).max(50).required(),
      email: Joi.string().email().required(),
      bank_account: Joi.string().min(10).max(20).required()
    });

    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const vendorData = {
      ...req.body,
      userId: req.user.id
    };

    const vendor = await Vendor.create(vendorData);
    res.status(201).json({
      message: 'Vendor created successfully',
      vendor
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Vendor with this email already exists' });
    }
    res.status(500).json({ error: error.message });
  }
};

const getAllVendors = async (req, res) => {
  try {
    const vendors = await Vendor.findAll({
      where: { userId: req.user.id }
    });
    res.json(vendors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getVendorById = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({
      where: { 
        id: req.params.id,
        userId: req.user.id
      }
    });
    
    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }
    
    res.json(vendor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateVendor = async (req, res) => {
  try {
    const schema = Joi.object({
      name: Joi.string().min(2).max(50),
      store_name: Joi.string().min(2).max(50),
      email: Joi.string().email(),
      bank_account: Joi.string().min(10).max(20)
    });

    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const vendor = await Vendor.findOne({
      where: { 
        id: req.params.id,
        userId: req.user.id
      }
    });
    
    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    await vendor.update(req.body);
    res.json({
      message: 'Vendor updated successfully',
      vendor
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



module.exports = {
  createVendor,
  getAllVendors,
  getVendorById,
  updateVendor,

};