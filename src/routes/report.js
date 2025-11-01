const express = require('express');
const router = express.Router();
const ReportController = require('../controllers/ReportController');
const { authenticateToken } = require('../middleware/middleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure Multer for report uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const reportsDir = path.join(__dirname, '../../uploads/reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    cb(null, reportsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'report-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Allow images and PDFs
  if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPG, PNG) and PDF files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit for medical reports
  },
  fileFilter: fileFilter
});

// Report routes
router.post('/upload', authenticateToken, upload.single('file'), ReportController.uploadReport);
router.post('/manual', authenticateToken, ReportController.createManualReport);
router.get('/', authenticateToken, ReportController.getAllReports);
router.get('/timeline', authenticateToken, ReportController.getReportsTimeline);
router.get('/:id', authenticateToken, ReportController.getReportById);
router.get('/:id/download', authenticateToken, ReportController.downloadReport);
router.delete('/:id', authenticateToken, ReportController.deleteReport);

module.exports = router;

