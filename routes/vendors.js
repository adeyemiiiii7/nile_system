const express = require('express');
const { auth } = require('../middleware/auth');
const {
  getMyVendor,
  updateVendor
} = require('../controllers/vendorController');

const router = express.Router();

router.use(auth);

// GET /api/vendors - get the logged-in user's vendor
router.get('/', getMyVendor);
// PUT /api/vendors - update the logged-in user's vendor
router.put('/', updateVendor);

module.exports = router;
