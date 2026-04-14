const express = require('express');
const router = express.Router();
// Currently no direct API is integrated for a complete global stadium directory.
// This route acts as a placeholder or can dynamically fetch venues in future updates from match info.

// GET /api/stadiums
router.get('/', (req, res) => {
  res.json({ source: 'api', stadiums: [], message: 'Live stadium API integration currently unavailable. We strictly fetch live data without placeholder fallbacks.' });
});

// GET /api/stadiums/:id
router.get('/:id', (req, res) => {
  res.status(501).json({ error: 'Not Implemented: Live stadium specifics are not available in current API tier.' });
});

module.exports = router;
