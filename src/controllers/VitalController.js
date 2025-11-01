const Vital = require('../models/Vital.model');

/**
 * Add vital entry
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const addVital = async (req, res) => {
  try {
    const { date, bp, sugar, weight, pulse, temperature, notes } = req.body;

    // Validation
    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Please provide date'
      });
    }

    // Create vital entry
    const vital = new Vital({
      userId: req.user._id,
      date: new Date(date),
      bp: bp || null,
      sugar: sugar || null,
      weight: weight || null,
      pulse: pulse || null,
      temperature: temperature || null,
      notes: notes || null
    });

    await vital.save();

    res.status(201).json({
      success: true,
      message: 'Vital entry added successfully',
      data: vital
    });
  } catch (error) {
    console.error('Add vital error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get all vitals for logged-in user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllVitals = async (req, res) => {
  try {
    const userId = req.user._id;
    const { date } = req.query;

    let query = { userId };

    // Filter by date if provided
    if (date) {
      const filterDate = new Date(date);
      query.date = {
        $gte: new Date(filterDate.setHours(0, 0, 0, 0)),
        $lte: new Date(filterDate.setHours(23, 59, 59, 999))
      };
    }

    const vitals = await Vital.find(query)
      .sort({ date: -1 });

    res.json({
      success: true,
      message: 'Vitals retrieved successfully',
      count: vitals.length,
      data: vitals
    });
  } catch (error) {
    console.error('Get all vitals error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get vital by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getVitalById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const vital = await Vital.findOne({ _id: id, userId });

    if (!vital) {
      return res.status(404).json({
        success: false,
        message: 'Vital entry not found'
      });
    }

    res.json({
      success: true,
      message: 'Vital entry retrieved successfully',
      data: vital
    });
  } catch (error) {
    console.error('Get vital by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Update vital entry
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateVital = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { date, bp, sugar, weight, pulse, temperature, notes } = req.body;

    const vital = await Vital.findOne({ _id: id, userId });

    if (!vital) {
      return res.status(404).json({
        success: false,
        message: 'Vital entry not found'
      });
    }

    // Update fields
    if (date) vital.date = new Date(date);
    if (bp !== undefined) vital.bp = bp;
    if (sugar !== undefined) vital.sugar = sugar;
    if (weight !== undefined) vital.weight = weight;
    if (pulse !== undefined) vital.pulse = pulse;
    if (temperature !== undefined) vital.temperature = temperature;
    if (notes !== undefined) vital.notes = notes;

    await vital.save();

    res.json({
      success: true,
      message: 'Vital entry updated successfully',
      data: vital
    });
  } catch (error) {
    console.error('Update vital error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Delete vital entry
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteVital = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const vital = await Vital.findOne({ _id: id, userId });

    if (!vital) {
      return res.status(404).json({
        success: false,
        message: 'Vital entry not found'
      });
    }

    await Vital.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Vital entry deleted successfully'
    });
  } catch (error) {
    console.error('Delete vital error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get vitals timeline (date-sorted)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getVitalsTimeline = async (req, res) => {
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

    const vitals = await Vital.find(query)
      .sort({ date: -1 })
      .select('date bp sugar weight pulse temperature notes createdAt');

    res.json({
      success: true,
      message: 'Vitals timeline retrieved successfully',
      count: vitals.length,
      data: vitals
    });
  } catch (error) {
    console.error('Get vitals timeline error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  addVital,
  getAllVitals,
  getVitalById,
  updateVital,
  deleteVital,
  getVitalsTimeline
};

