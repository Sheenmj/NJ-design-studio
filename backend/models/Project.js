const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: ['Residential', 'Commercial', 'Cultural', 'Urban'],
        message: 'Category must be one of: Residential, Commercial, Cultural, Urban',
      },
    },
    description: {
      type: String,
      trim: true,
    },
    imageUrl: {
      type: String,
    },
    publicId: {
      type: String,
    },
    featured: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Project', projectSchema);
