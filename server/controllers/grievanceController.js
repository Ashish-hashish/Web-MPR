const Grievance = require('../models/Grievance');

// @desc    Create a new grievance with uploaded photo & GeoJSON location
// @route   POST /api/grievances
// @access  Private (Citizen or Worker)
exports.createGrievance = async (req, res) => {
  try {
    const { title, category, description, latitude, longitude, lat, lng } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'A photo attachment is required to report an issue'
      });
    }

    const reportLat = parseFloat(latitude || lat);
    const reportLng = parseFloat(longitude || lng);

    if (isNaN(reportLat) || isNaN(reportLng)) {
      return res.status(400).json({
        success: false,
        message: 'Valid numeric latitude and longitude coordinates are required'
      });
    }

    if (reportLat < -90 || reportLat > 90 || reportLng < -180 || reportLng > 180) {
      return res.status(400).json({
        success: false,
        message: 'Coordinates out of valid geographical bounds (-90 to 90 lat, -180 to 180 lng)'
      });
    }

    // Multer stores image, generate relative URL path
    const photoUrl = `/uploads/${req.file.filename}`;

    // CRITICAL: MongoDB GeoJSON coordinates format is strictly [longitude, latitude]
    const grievance = await Grievance.create({
      title,
      category,
      description,
      photoUrl,
      status: 'PENDING',
      location: {
        type: 'Point',
        coordinates: [reportLng, reportLat] // [longitude, latitude]
      },
      reportedBy: req.user._id
    });

    const populatedGrievance = await Grievance.findById(grievance._id)
      .populate('reportedBy', 'name email');

    return res.status(201).json({
      success: true,
      message: 'Grievance reported successfully',
      data: populatedGrievance
    });
  } catch (error) {
    console.error('[Create Grievance Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to submit grievance report'
    });
  }
};

// @desc    Get grievances within map bounding box ($geoWithin $box) or list
// @route   GET /api/grievances/map-view
// @access  Public or Protected
exports.getMapViewGrievances = async (req, res) => {
  try {
    const { swLat, swLng, neLat, neLng, status, category } = req.query;
    let query = {};

    // Filter by bounding box if provided
    if (swLat && swLng && neLat && neLng) {
      const sLat = parseFloat(swLat);
      const sLng = parseFloat(swLng);
      const nLat = parseFloat(neLat);
      const nLng = parseFloat(neLng);

      if (!isNaN(sLat) && !isNaN(sLng) && !isNaN(nLat) && !isNaN(nLng)) {
        // In MongoDB $geoWithin $box: [[bottom-left-lng, bottom-left-lat], [top-right-lng, top-right-lat]]
        query.location = {
          $geoWithin: {
            $box: [
              [sLng, sLat], // SW corner [lng, lat]
              [nLng, nLat]  // NE corner [lng, lat]
            ]
          }
        };
      }
    }

    // Optional status and category filters
    if (status && status !== 'ALL') {
      query.status = status;
    }
    if (category && category !== 'ALL') {
      query.category = category;
    }

    const grievances = await Grievance.find(query)
      .populate('reportedBy', 'name email')
      .populate('assignedWorker', 'name email')
      .sort({ createdAt: -1 })
      .limit(300);

    return res.status(200).json({
      success: true,
      count: grievances.length,
      data: grievances
    });
  } catch (error) {
    console.error('[Get Map View Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve map grievances'
    });
  }
};

// @desc    Update grievance status (Worker only)
// @route   PATCH /api/grievances/:id/status
// @access  Private (Worker only)
exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['PENDING', 'IN_PROGRESS', 'RESOLVED'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Valid values are: ${validStatuses.join(', ')}`
      });
    }

    const grievance = await Grievance.findById(id);
    if (!grievance) {
      return res.status(404).json({
        success: false,
        message: 'Grievance not found'
      });
    }

    grievance.status = status;
    // Assign to worker who took action if not already assigned
    if (!grievance.assignedWorker) {
      grievance.assignedWorker = req.user._id;
    }

    await grievance.save();

    const updatedGrievance = await Grievance.findById(id)
      .populate('reportedBy', 'name email')
      .populate('assignedWorker', 'name email');

    return res.status(200).json({
      success: true,
      message: `Status updated to ${status}`,
      data: updatedGrievance
    });
  } catch (error) {
    console.error('[Update Status Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update grievance status'
    });
  }
};

// @desc    Get grievances submitted by current authenticated user
// @route   GET /api/grievances/my
// @access  Private
exports.getMyGrievances = async (req, res) => {
  try {
    const grievances = await Grievance.find({ reportedBy: req.user._id })
      .populate('assignedWorker', 'name email')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: grievances.length,
      data: grievances
    });
  } catch (error) {
    console.error('[Get My Grievances Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve your reported grievances'
    });
  }
};

// @desc    Get single grievance by ID
// @route   GET /api/grievances/:id
// @access  Public or Protected
exports.getGrievanceById = async (req, res) => {
  try {
    const grievance = await Grievance.findById(req.params.id)
      .populate('reportedBy', 'name email')
      .populate('assignedWorker', 'name email');

    if (!grievance) {
      return res.status(404).json({
        success: false,
        message: 'Grievance not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: grievance
    });
  } catch (error) {
    console.error('[Get Grievance Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve grievance details'
    });
  }
};

// @desc    Get dashboard metrics & summary
// @route   GET /api/grievances/stats
// @access  Public or Protected
exports.getStats = async (req, res) => {
  try {
    const total = await Grievance.countDocuments();
    const pending = await Grievance.countDocuments({ status: 'PENDING' });
    const inProgress = await Grievance.countDocuments({ status: 'IN_PROGRESS' });
    const resolved = await Grievance.countDocuments({ status: 'RESOLVED' });

    const categories = await Grievance.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    return res.status(200).json({
      success: true,
      data: {
        total,
        pending,
        inProgress,
        resolved,
        categories
      }
    });
  } catch (error) {
    console.error('[Get Stats Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve grievance statistics'
    });
  }
};
