const express = require('express');
const router = express.Router();

// Endpoint to get the OMDB API key
router.get('/api/omdb-key', (req, res) => {
  res.json({ apiKey: process.env.OMDB_API_KEY });
});

module.exports = router;
