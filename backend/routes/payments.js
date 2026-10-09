const express = require('express');
const router = express.Router();

const { capturePayment, verifyPayment, stripeWebhook, sendPaymentSuccessEmail } = require('../controllers/payments');
const { auth, isStudent } = require('../middleware/auth');

router.post('/capturePayment', auth, isStudent, capturePayment);
router.post('/verifyPayment', auth, isStudent, verifyPayment);
router.post('/webhook', express.raw({type: 'application/json'}), stripeWebhook);
router.post('/sendPaymentSuccessEmail', auth, sendPaymentSuccessEmail);

module.exports = router
