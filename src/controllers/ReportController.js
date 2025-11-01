const Report = require('../models/Report.model');
const geminiService = require('../utils/geminiService');
const fs = require('fs');
const path = require('path');

/**
 * Upload report file and process with Gemini AI
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const uploadReport = async (req, res) => {
  try {
    const { reportType, date } = req.body;
    const file = req.file;

    // Validation
    if (!reportType || !date) {
      // Delete uploaded file if validation fails
      if (file) {
        fs.unlinkSync(file.path);
      }
      return res.status(400).json({
        success: false,
        message: 'Please provide reportType and date'
      });
    }

    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file'
      });
    }

    // Validate report type
    const validTypes = ['CBC', 'X-Ray', 'Ultrasound', 'Blood Test', 'Other'];
    if (!validTypes.includes(reportType)) {
      fs.unlinkSync(file.path);
      return res.status(400).json({
        success: false,
        message: `Invalid report type. Must be one of: ${validTypes.join(', ')}`
      });
    }

    // Create report entry
    const report = new Report({
      userId: req.user._id,
      reportType,
      date: new Date(date),
      fileUrl: `/uploads/reports/${file.filename}`
    });

    // Process with Gemini AI
    try {
      const aiAnalysis = await geminiService.analyzeReport(file.path, reportType);
      report.aiSummary = aiAnalysis.summary;
      report.abnormalities = aiAnalysis.abnormalities;
      report.doctorQuestions = aiAnalysis.doctorQuestions;
    } catch (aiError) {
      console.error('Gemini AI processing error:', aiError);
      // Continue without AI analysis if it fails
      report.aiSummary = 'AI analysis pending. Please try again later.';
    }

    await report.save();

    res.status(201).json({
      success: true,
      message: 'Report uploaded and processed successfully',
      data: report
    });
  } catch (error) {
    console.error('Upload report error:', error);
    // Delete file if error occurs
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting file:', unlinkError);
      }
    }
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Create manual report entry
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createManualReport = async (req, res) => {
  try {
    const { reportType, date, manualData } = req.body;

    // Validation
    if (!reportType || !date) {
      return res.status(400).json({
        success: false,
        message: 'Please provide reportType and date'
      });
    }

    if (!manualData || typeof manualData !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Please provide manualData as an object'
      });
    }

    // Validate report type
    const validTypes = ['CBC', 'X-Ray', 'Ultrasound', 'Blood Test', 'Other'];
    if (!validTypes.includes(reportType)) {
      return res.status(400).json({
        success: false,
        message: `Invalid report type. Must be one of: ${validTypes.join(', ')}`
      });
    }

    // Create report entry
    const report = new Report({
      userId: req.user._id,
      reportType,
      date: new Date(date),
      manualData
    });

    // Process with Gemini AI if manual data provided
    try {
      const aiAnalysis = await geminiService.generateSummary(manualData, reportType);
      report.aiSummary = aiAnalysis.summary;
      report.abnormalities = aiAnalysis.abnormalities;
      report.doctorQuestions = aiAnalysis.doctorQuestions;
    } catch (aiError) {
      console.error('Gemini AI processing error:', aiError);
      // Continue without AI analysis if it fails
      report.aiSummary = 'AI analysis pending. Please try again later.';
    }

    await report.save();

    res.status(201).json({
      success: true,
      message: 'Manual report created successfully',
      data: report
    });
  } catch (error) {
    console.error('Create manual report error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get all reports for logged-in user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllReports = async (req, res) => {
  try {
    const userId = req.user._id;
    const { date, reportType } = req.query;

    let query = { userId };

    // Filter by date if provided
    if (date) {
      const filterDate = new Date(date);
      query.date = {
        $gte: new Date(filterDate.setHours(0, 0, 0, 0)),
        $lte: new Date(filterDate.setHours(23, 59, 59, 999))
      };
    }

    // Filter by report type if provided
    if (reportType) {
      query.reportType = reportType;
    }

    const reports = await Report.find(query)
      .sort({ date: -1 });

    res.json({
      success: true,
      message: 'Reports retrieved successfully',
      count: reports.length,
      data: reports
    });
  } catch (error) {
    console.error('Get all reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get report by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getReportById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const report = await Report.findOne({ _id: id, userId });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    res.json({
      success: true,
      message: 'Report retrieved successfully',
      data: report
    });
  } catch (error) {
    console.error('Get report by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Delete report
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteReport = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const report = await Report.findOne({ _id: id, userId });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Delete associated file if exists
    if (report.fileUrl) {
      const filePath = path.join(__dirname, '../../', report.fileUrl);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (fileError) {
          console.error('Error deleting file:', fileError);
        }
      }
    }

    await Report.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Report deleted successfully'
    });
  } catch (error) {
    console.error('Delete report error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Download report file
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const downloadReport = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const report = await Report.findOne({ _id: id, userId });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    if (!report.fileUrl) {
      return res.status(400).json({
        success: false,
        message: 'No file available for this report'
      });
    }

    const filePath = path.join(__dirname, '../../', report.fileUrl);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    res.download(filePath, (err) => {
      if (err) {
        console.error('Download error:', err);
        res.status(500).json({
          success: false,
          message: 'Error downloading file'
        });
      }
    });
  } catch (error) {
    console.error('Download report error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get reports timeline (date-sorted)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getReportsTimeline = async (req, res) => {
  try {
    const userId = req.user._id;
    const { startDate, endDate } = req.query;

    let query = { userId };

    // Filter by date range if provided
    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        query.date.$lte = new Date(endDate);
      }
    }

    const reports = await Report.find(query)
      .sort({ date: -1 })
      .select('reportType date aiSummary abnormalities createdAt');

    res.json({
      success: true,
      message: 'Reports timeline retrieved successfully',
      count: reports.length,
      data: reports
    });
  } catch (error) {
    console.error('Get reports timeline error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  uploadReport,
  createManualReport,
  getAllReports,
  getReportById,
  deleteReport,
  downloadReport,
  getReportsTimeline
};

