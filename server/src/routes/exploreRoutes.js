const express = require('express');
const router = express.Router();
const { getExploreData } = require('../controllers/exploreController');
const { optionalAuth } = require('../middleware/auth');

router.get('/', optionalAuth, getExploreData);

module.exports = router;
