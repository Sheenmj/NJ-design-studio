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
 * GET /api/projects
 * Public — return all projects sorted by created_at desc.
 */
exports.getAll = async (req, res, next) => {
  try {
    const { data: projects, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Map `id` to `_id` as well for legacy frontend compatibility
    const mapped = projects.map(p => ({ ...p, _id: p.id }));
    res.json({ success: true, data: mapped });
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
    const { data: project, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();

    if (error) throw error;
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    res.json({ success: true, data: { ...project, _id: project.id } });
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

    if (!title || !category) {
      return res.status(400).json({ success: false, error: 'Title and Category are required' });
    }

    const projectData = {
      title,
      category,
      description,
      featured: featured === 'true' || featured === true,
    };

    // Upload image to Cloudinary if provided
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, 'nj-design-studio/projects');
      projectData.image_url = result.secure_url;
      projectData.public_id = result.public_id;
    }

    const { data: project, error } = await supabase
      .from('projects')
      .insert([projectData])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ success: true, data: { ...project, _id: project.id } });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/projects/:id
 * Protected — update a project, optionally replacing the image.
 */
exports.update = async (req, res, next) => {
  try {
    const { data: project, error: getErr } = await supabase
      .from('projects')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();

    if (getErr || !project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    const { title, category, description, featured } = req.body;
    const projectData = {};

    if (title !== undefined) projectData.title = title;
    if (category !== undefined) projectData.category = category;
    if (description !== undefined) projectData.description = description;
    if (featured !== undefined) projectData.featured = featured === 'true' || featured === true;

    // Replace image if a new file is uploaded
    if (req.file) {
      // Destroy old Cloudinary image if it exists
      if (project.public_id) {
        await cloudinary.uploader.destroy(project.public_id);
      }
      const result = await uploadToCloudinary(req.file.buffer, 'nj-design-studio/projects');
      projectData.image_url = result.secure_url;
      projectData.public_id = result.public_id;
    }

    projectData.updated_at = new Date().toISOString();

    const { data: updatedProject, error: updateErr } = await supabase
      .from('projects')
      .update(projectData)
      .eq('id', req.params.id)
      .select()
      .single();

    if (updateErr) throw updateErr;

    res.json({ success: true, data: { ...updatedProject, _id: updatedProject.id } });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/projects/:id
 * Protected — delete a project and its Cloudinary image.
 */
exports.remove = async (req, res, next) => {
  try {
    const { data: project, error: getErr } = await supabase
      .from('projects')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();

    if (getErr || !project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    // Destroy Cloudinary image if it exists
    if (project.public_id) {
      await cloudinary.uploader.destroy(project.public_id);
    }

    const { error: delErr } = await supabase
      .from('projects')
      .delete()
      .eq('id', req.params.id);

    if (delErr) throw delErr;

    res.json({ success: true, data: { message: 'Project deleted' } });
  } catch (error) {
    next(error);
  }
};
