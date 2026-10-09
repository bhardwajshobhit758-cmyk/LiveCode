const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Dev-only token debug endpoint. Returns decoded payload or error.
router.get('/token', (req, res) => {
    if (process.env.NODE_ENV === 'production') {
        return res.status(403).json({ success: false, message: 'Not allowed in production' });
    }

    const authHeader = req.header('Authorization') || req.headers['authorization'] || '';
    let token = null;
    if (authHeader && typeof authHeader === 'string') {
        token = authHeader.toLowerCase().startsWith('bearer ') ? authHeader.split(' ')[1] : authHeader;
    }
    token = token || req.query.token || req.body?.token || null;

    if (!token) return res.status(400).json({ success: false, message: 'Token not provided' });

    // Mask token for logs
    const masked = token.length > 10 ? token.slice(0, 6) + '...' + token.slice(-4) : token;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return res.json({ success: true, token: masked, decoded });
    }
    catch (err) {
        return res.status(401).json({ success: false, token: masked, error: err.message });
    }
});

module.exports = router;
