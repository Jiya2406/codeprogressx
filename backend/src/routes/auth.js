const router = require('express').Router();
const { signup, login } = require('../controllers/authController');
const { googleLogin } = require('../controllers/googleAuthController');

router.post('/signup', signup);
router.post('/login', login);
router.post('/google', googleLogin);

module.exports = router;
