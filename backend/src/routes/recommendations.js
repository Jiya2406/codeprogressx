const router = require('express').Router();
const auth = require('../middleware/auth');
const { recommend } = require('../controllers/recommendationController');

router.get('/', auth, recommend);

module.exports = router;
