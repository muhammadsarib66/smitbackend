const express = require('express');
const router = express.Router();
const VitalController = require('../controllers/VitalController');
const { authenticateToken } = require('../middleware/middleware');

// Vital routes
router.post('/', authenticateToken, VitalController.addVital);
router.get('/', authenticateToken, VitalController.getAllVitals);
router.get('/timeline', authenticateToken, VitalController.getVitalsTimeline);
router.get('/:id', authenticateToken, VitalController.getVitalById);
router.put('/:id', authenticateToken, VitalController.updateVital);
router.delete('/:id', authenticateToken, VitalController.deleteVital);

module.exports = router;

