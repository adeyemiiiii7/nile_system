const express = require('express');
const { auth, adminAuth } = require('../middleware/auth');
const {
  getVendorPayout,
  getAllVendorPayoutsCompleted,
  getAdminVendorPayout
} = require('../controllers/payoutController');

const router = express.Router();

// Vendor payout summary (vendor owners only)
router.get('/vendors/:vendorId/summary', auth, getVendorPayout);

// Admin access to any vendor's payout (platform oversight)
router.get('/admin/vendors/:vendorId/summary', adminAuth, getAdminVendorPayout);

// Get all completed payouts 
router.get('/completed', auth, getAllVendorPayoutsCompleted);

module.exports = router;