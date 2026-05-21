const router = require('express').Router();
const auth = require('../middleware/auth');
const { syncSubmissions } = require('../controllers/syncController');

router.post('/', auth, syncSubmissions);

module.exports = router;
