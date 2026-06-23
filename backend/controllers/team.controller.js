const { Readable } = require('stream');
const supabase = require('../config/supabase');
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
 * Public — return all team members sorted by "order" asc.
 */
exports.getAll = async (req, res, next) => {
  try {
    const { data: members, error } = await supabase
      .from('team_members')
      .select('*')
      .order('order', { ascending: true });

    if (error) throw error;

    const mapped = members.map(m => ({ ...m, _id: m.id }));
    res.json({ success: true, data: mapped });
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
    const { data: member, error } = await supabase
      .from('team_members')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();

    if (error) throw error;
    if (!member) {
      return res.status(404).json({ success: false, error: 'Team member not found' });
    }

    res.json({ success: true, data: { ...member, _id: member.id } });
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

    if (!name || !role) {
      return res.status(400).json({ success: false, error: 'Name and Role are required' });
    }

    const memberData = {
      name,
      role,
      bio,
      order: order !== undefined ? Number(order) : 0,
    };

    // Upload image to Cloudinary if provided
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, 'nj-design-studio/team');
      memberData.image_url = result.secure_url;
      memberData.public_id = result.public_id;
    }

    const { data: member, error } = await supabase
      .from('team_members')
      .insert([memberData])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ success: true, data: { ...member, _id: member.id } });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/team/:id
 * Protected — update a team member, optionally replacing the image.
 */
exports.update = async (req, res, next) => {
  try {
    const { data: member, error: getErr } = await supabase
      .from('team_members')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();

    if (getErr || !member) {
      return res.status(404).json({ success: false, error: 'Team member not found' });
    }

    const { name, role, bio, order } = req.body;
    const memberData = {};

    if (name !== undefined) memberData.name = name;
    if (role !== undefined) memberData.role = role;
    if (bio !== undefined) memberData.bio = bio;
    if (order !== undefined) memberData.order = Number(order);

    // Replace image if a new file is uploaded
    if (req.file) {
      if (member.public_id) {
        await cloudinary.uploader.destroy(member.public_id);
      }
      const result = await uploadToCloudinary(req.file.buffer, 'nj-design-studio/team');
      memberData.image_url = result.secure_url;
      memberData.public_id = result.public_id;
    }

    memberData.updated_at = new Date().toISOString();

    const { data: updatedMember, error: updateErr } = await supabase
      .from('team_members')
      .update(memberData)
      .eq('id', req.params.id)
      .select()
      .single();

    if (updateErr) throw updateErr;

    res.json({ success: true, data: { ...updatedMember, _id: updatedMember.id } });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/team/:id
 * Protected — delete a team member and their Cloudinary image.
 */
exports.remove = async (req, res, next) => {
  try {
    const { data: member, error: getErr } = await supabase
      .from('team_members')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();

    if (getErr || !member) {
      return res.status(404).json({ success: false, error: 'Team member not found' });
    }

    if (member.public_id) {
      await cloudinary.uploader.destroy(member.public_id);
    }

    const { error: delErr } = await supabase
      .from('team_members')
      .delete()
      .eq('id', req.params.id);

    if (delErr) throw delErr;

    res.json({ success: true, data: { message: 'Team member deleted' } });
  } catch (error) {
    next(error);
  }
};
