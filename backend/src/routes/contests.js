const router = require('express').Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/contestController');

router.get('/', auth, ctrl.listUpcoming);
router.post('/test-email', auth, ctrl.sendTestEmail);
router.post('/:contestId/remind', auth, ctrl.addReminder);
router.delete('/:contestId/remind', auth, ctrl.removeReminder);

module.exports = router;
