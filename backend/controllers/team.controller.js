const { Readable } = require('stream');
const TeamMember = require('../models/TeamMember');
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
 * GET /api/team
 * Public — return all team members sorted by order asc.
 */
exports.getAll = async (req, res, next) => {
  try {
    const members = await TeamMember.find().sort({ order: 1 });
    res.json({ success: true, data: members });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/team/:id
 * Public — return a single team member.
 */
exports.getOne = async (req, res, next) => {
  try {
    const member = await TeamMember.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ success: false, error: 'Team member not found' });
    }
    res.json({ success: true, data: member });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/team
 * Protected — create a team member with optional image upload.
 */
exports.create = async (req, res, next) => {
  try {
    const { name, role, bio, order } = req.body;

    const memberData = {
      name,
      role,
      bio,
      order: order !== undefined ? Number(order) : 0,
    };

    // Upload image to Cloudinary if provided
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, 'nj-design-studio/team');
      memberData.imageUrl = result.secure_url;
      memberData.publicId = result.public_id;
    }

    const member = await TeamMember.create(memberData);
    res.status(201).json({ success: true, data: member });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, error: messages.join(', ') });
    }
    next(error);
  }
};

/**
 * PUT /api/team/:id
 * Protected — update a team member, optionally replacing the image.
 */
exports.update = async (req, res, next) => {
  try {
    const member = await TeamMember.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ success: false, error: 'Team member not found' });
    }

    const { name, role, bio, order } = req.body;

    if (name !== undefined) member.name = name;
    if (role !== undefined) member.role = role;
    if (bio !== undefined) member.bio = bio;
    if (order !== undefined) member.order = Number(order);

    // Replace image if a new file is uploaded
    if (req.file) {
      if (member.publicId) {
        await cloudinary.uploader.destroy(member.publicId);
      }
      const result = await uploadToCloudinary(req.file.buffer, 'nj-design-studio/team');
      member.imageUrl = result.secure_url;
      member.publicId = result.public_id;
    }

    await member.save();
    res.json({ success: true, data: member });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, error: messages.join(', ') });
    }
    next(error);
  }
};

/**
 * DELETE /api/team/:id
 * Protected — delete a team member and their Cloudinary image.
 */
exports.remove = async (req, res, next) => {
  try {
    const member = await TeamMember.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ success: false, error: 'Team member not found' });
    }

    if (member.publicId) {
      await cloudinary.uploader.destroy(member.publicId);
    }

    await member.deleteOne();
    res.json({ success: true, data: { message: 'Team member deleted' } });
  } catch (error) {
    next(error);
  }
};
