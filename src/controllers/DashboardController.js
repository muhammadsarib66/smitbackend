const Report = require('../models/Report.model');
const Vital = require('../models/Vital.model');

/**
 * Get dashboard statistics for logged-in user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get total reports count
    const totalReports = await Report.countDocuments({ userId });

    // Get latest vitals (most recent entry)
    const latestVital = await Vital.findOne({ userId })
      .sort({ date: -1 })
      .select('date bp sugar weight pulse temperature notes');

    // Get recent reports (last 5)
    const recentReports = await Report.find({ userId })
      .sort({ date: -1 })
      .limit(5)
      .select('reportType date aiSummary abnormalities createdAt');

    // Calculate average vitals (if multiple entries exist)
    const vitalsCount = await Vital.countDocuments({ userId });
    let averageVitals = null;

    if (vitalsCount > 0) {
      const vitals = await Vital.find({ userId }).select('bp sugar weight pulse temperature');
      
      const averages = {
        sugar: null,
        weight: null,
        pulse: null,
        temperature: null
      };

      let sugarSum = 0, sugarCount = 0;
      let weightSum = 0, weightCount = 0;
      let pulseSum = 0, pulseCount = 0;
      let tempSum = 0, tempCount = 0;

      vitals.forEach(vital => {
        if (vital.sugar !== null && vital.sugar !== undefined) {
          sugarSum += vital.sugar;
          sugarCount++;
        }
        if (vital.weight !== null && vital.weight !== undefined) {
          weightSum += vital.weight;
          weightCount++;
        }
        if (vital.pulse !== null && vital.pulse !== undefined) {
          pulseSum += vital.pulse;
          pulseCount++;
        }
        if (vital.temperature !== null && vital.temperature !== undefined) {
          tempSum += vital.temperature;
          tempCount++;
        }
      });

      if (sugarCount > 0) averages.sugar = (sugarSum / sugarCount).toFixed(2);
      if (weightCount > 0) averages.weight = (weightSum / weightCount).toFixed(2);
      if (pulseCount > 0) averages.pulse = (pulseSum / pulseCount).toFixed(2);
      if (tempCount > 0) averages.temperature = (tempSum / tempCount).toFixed(2);

      averageVitals = averages;
    }

    // Generate AI insights summary
    let aiInsights = null;
    if (recentReports.length > 0 && recentReports[0].aiSummary) {
      aiInsights = recentReports[0].aiSummary.substring(0, 150) + '...';
    }

    // Get last updated date
    const lastReport = await Report.findOne({ userId }).sort({ updatedAt: -1 });
    const lastVital = await Vital.findOne({ userId }).sort({ updatedAt: -1 });
    
    let lastUpdated = null;
    if (lastReport && lastVital) {
      lastUpdated = lastReport.updatedAt > lastVital.updatedAt 
        ? lastReport.updatedAt 
        : lastVital.updatedAt;
    } else if (lastReport) {
      lastUpdated = lastReport.updatedAt;
    } else if (lastVital) {
      lastUpdated = lastVital.updatedAt;
    }

    res.json({
      success: true,
      message: 'Dashboard statistics retrieved successfully',
      data: {
        totalReports,
        latestVital,
        recentReports,
        averageVitals,
        aiInsights,
        lastUpdated,
        vitalsCount
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  getDashboardStats
};

