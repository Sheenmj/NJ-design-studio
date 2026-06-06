const { Readable } = require('stream');
const Project = require('../models/Project');
const cloudinary = require('../config/cloudinary');

/**
 * Upload a buffer to Cloudinary using a stream.
 * Returns { secure_url, public_id }.
 */
const uploadToCloudinary = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (error, result) => {
        if (error) return reject(error);
        resolve({ secure_url: result.secure_url, public_id: result.public_id });
      }
    );
    const readable = Readable.from(buffer);
    readable.pipe(uploadStream);
  });
};

/**
 * GET /api/projects
 * Public — return all projects sorted by createdAt desc.
 */
exports.getAll = async (req, res, next) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.json({ success: true, data: projects });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/projects/:id
 * Public — return a single project.
 */
exports.getOne = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }
    res.json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/projects
 * Protected — create a project with optional image upload.
 */
exports.create = async (req, res, next) => {
  try {
    const { title, category, description, featured } = req.body;

    const projectData = {
      title,
      category,
      description,
      featured: featured === 'true' || featured === true,
    };

    // Upload image to Cloudinary if provided
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, 'nj-design-studio/projects');
      projectData.imageUrl = result.secure_url;
      projectData.publicId = result.public_id;
    }

    const project = await Project.create(projectData);
    res.status(201).json({ success: true, data: project });
  } catch (error) {
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, error: messages.join(', ') });
    }
    next(error);
  }
};

/**
 * PUT /api/projects/:id
 * Protected — update a project, optionally replacing the image.
 */
exports.update = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    const { title, category, description, featured } = req.body;

    if (title !== undefined) project.title = title;
    if (category !== undefined) project.category = category;
    if (description !== undefined) project.description = description;
    if (featured !== undefined) project.featured = featured === 'true' || featured === true;

    // Replace image if a new file is uploaded
    if (req.file) {
      // Destroy old Cloudinary image if it exists
      if (project.publicId) {
        await cloudinary.uploader.destroy(project.publicId);
      }
      const result = await uploadToCloudinary(req.file.buffer, 'nj-design-studio/projects');
      project.imageUrl = result.secure_url;
      project.publicId = result.public_id;
    }

    await project.save();
    res.json({ success: true, data: project });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, error: messages.join(', ') });
    }
    next(error);
  }
};

/**
 * DELETE /api/projects/:id
 * Protected — delete a project and its Cloudinary image.
 */
exports.remove = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    // Destroy Cloudinary image if it exists
    if (project.publicId) {
      await cloudinary.uploader.destroy(project.publicId);
    }

    await project.deleteOne();
    res.json({ success: true, data: { message: 'Project deleted' } });
  } catch (error) {
    next(error);
  }
};
