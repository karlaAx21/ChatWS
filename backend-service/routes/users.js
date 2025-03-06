const express = require('express');
const axios = require('axios');
const router = express.Router();

const MOCK_API_URL = 'https://67c8d76f0acf98d07087de29.mockapi.io/chat/ws/user';

// Get all users
router.get('/', async (req, res) => {
  try {
    const response = await axios.get(MOCK_API_URL);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching users from MockAPI:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Add more routes as needed

module.exports = router;
