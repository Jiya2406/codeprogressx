const router = require('express').Router();
const ctrl = require('../controllers/cronController');

router.post('/reminders', ctrl.runReminders);

module.exports = router;
