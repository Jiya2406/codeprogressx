const router = require('express').Router();
const auth = require('../middleware/auth');
const { me, linkCodeforces, refreshCodeforces } = require('../controllers/userController');

router.get('/me', auth, me);
router.post('/codeforces', auth, linkCodeforces);
router.post('/codeforces/refresh', auth, refreshCodeforces);

module.exports = router;
