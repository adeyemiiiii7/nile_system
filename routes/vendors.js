const express = require('express');
const { auth } = require('../middleware/auth');
const {
  createVendor,
  getAllVendors,
  getVendorById,
  updateVendor,
} = require('../controllers/vendorController');

const router = express.Router();

router.use(auth);


router.post('/', createVendor);
router.get('/', getAllVendors);
router.get('/:id', getVendorById);
router.put('/:id', updateVendor);


module.exports = router;
