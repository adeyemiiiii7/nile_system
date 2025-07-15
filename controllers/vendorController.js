const Joi = require('joi');

// Return only the logged-in user's vendor
const getMyVendor = async (req, res) => {
  try {
    if (!req.vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }
    res.json(req.vendor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update only the logged-in user's vendor
const updateVendor = async (req, res) => {
  try {
    if (!req.vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }
    const schema = Joi.object({
      name: Joi.string().min(2).max(50),
      storeName: Joi.string().min(2).max(50),
      email: Joi.string().email(),
      bankAccount: Joi.string().min(10).max(20)
    });
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    await req.vendor.update(req.body);
    res.json({
      message: 'Vendor updated successfully',
      vendor: req.vendor
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getMyVendor,
  updateVendor
};