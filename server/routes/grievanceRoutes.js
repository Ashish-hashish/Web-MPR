const express = require('express');
const router = express.Router();
const {
  createGrievance,
  getMapViewGrievances,
  updateStatus,
  getMyGrievances,
  getGrievanceById,
  getStats
} = require('../controllers/grievanceController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Map view query (Public / Worker / Citizen can explore map)
router.get('/map-view', getMapViewGrievances);

// Stats route
router.get('/stats', getStats);

// Citizen & Worker submission with photo upload
router.post('/', protect, upload.single('photo'), createGrievance);

// Current user's reported grievances
router.get('/my', protect, getMyGrievances);

// Single grievance details
router.get('/:id', getGrievanceById);

// Worker only status update
router.patch('/:id/status', protect, authorize('worker'), updateStatus);

module.exports = router;
