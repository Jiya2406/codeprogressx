const router = require('express').Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/chatController');

router.post('/', auth, ctrl.chat);
router.get('/suggestions', auth, ctrl.suggestions);
router.get('/sessions', auth, ctrl.listSessions);
router.get('/sessions/:id', auth, ctrl.getSession);
router.delete('/sessions/:id', auth, ctrl.deleteSession);

module.exports = router;
