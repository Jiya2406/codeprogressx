const router = require('express').Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/goalController');

router.get('/', auth, ctrl.listGoals);
router.post('/', auth, ctrl.createGoal);
router.delete('/:id', auth, ctrl.deleteGoal);

module.exports = router;
