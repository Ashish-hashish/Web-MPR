const mongoose = require('mongoose');

const grievanceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Grievance title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters']
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: ['pothole', 'burst_pipe', 'hanging_wire', 'garbage', 'other'],
        message: '{VALUE} is not a supported category'
      }
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    photoUrl: {
      type: String,
      required: [true, 'Photo is required for geotagged grievances']
    },
    status: {
      type: String,
      enum: ['PENDING', 'IN_PROGRESS', 'RESOLVED'],
      default: 'PENDING'
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
        required: true
      },
      // CRITICAL: Stored strictly as [longitude, latitude] per MongoDB GeoJSON specs
      coordinates: {
        type: [Number],
        required: true,
        validate: {
          validator: function (val) {
            return Array.isArray(val) && val.length === 2 &&
              val[0] >= -180 && val[0] <= 180 && // Longitude
              val[1] >= -90 && val[1] <= 90;     // Latitude
          },
          message: 'Coordinates must be valid [longitude, latitude] numbers'
        }
      }
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    assignedWorker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Create 2dsphere geospatial index for bounding-box and proximity queries
grievanceSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Grievance', grievanceSchema);
