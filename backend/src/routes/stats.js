const router = require('express').Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/statsController');

router.get('/overview', auth, ctrl.overview);
router.get('/tags', auth, ctrl.tagMastery);
router.get('/weak', auth, ctrl.weakAreas);
router.get('/rating-buckets', auth, ctrl.ratingDistribution);
router.get('/timeline', auth, ctrl.timeline);

module.exports = router;
