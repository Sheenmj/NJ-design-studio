const nodemailer = require('nodemailer');
const supabase = require('../config/supabase');

/**
 * Create a reusable Nodemailer transporter.
 * Falls back gracefully if email env vars are not configured.
 */
const createTransporter = () => {
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER) {
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: Number(process.env.EMAIL_PORT) === 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

/**
 * Build HTML email body from message data.
 */
const buildEmailHtml = (data) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #333; border-bottom: 2px solid #c9a96e; padding-bottom: 10px;">
        New Project Inquiry
      </h2>
      <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
        <tr>
          <td style="padding: 8px 12px; font-weight: bold; color: #555; width: 140px;">Name</td>
          <td style="padding: 8px 12px;">${data.full_name}</td>
        </tr>
        <tr style="background: #f9f9f9;">
          <td style="padding: 8px 12px; font-weight: bold; color: #555;">Email</td>
          <td style="padding: 8px 12px;"><a href="mailto:${data.email}">${data.email}</a></td>
        </tr>
        ${data.phone ? `
        <tr>
          <td style="padding: 8px 12px; font-weight: bold; color: #555;">Phone</td>
          <td style="padding: 8px 12px;">${data.phone}</td>
        </tr>` : ''}
        ${data.project_type ? `
        <tr style="background: #f9f9f9;">
          <td style="padding: 8px 12px; font-weight: bold; color: #555;">Project Type</td>
          <td style="padding: 8px 12px;">${data.project_type}</td>
        </tr>` : ''}
        ${data.estimated_budget ? `
        <tr>
          <td style="padding: 8px 12px; font-weight: bold; color: #555;">Est. Budget</td>
          <td style="padding: 8px 12px;">${data.estimated_budget}</td>
        </tr>` : ''}
      </table>
      <div style="margin-top: 20px; padding: 15px; background: #f5f5f5; border-left: 4px solid #c9a96e;">
        <h3 style="margin: 0 0 10px; color: #333;">Message</h3>
        <p style="margin: 0; color: #555; line-height: 1.6;">${data.message}</p>
      </div>
      <p style="margin-top: 20px; font-size: 12px; color: #999;">
        This message was sent from the NJ Design Studio website contact form.
      </p>
    </div>
  `;
};

/**
 * POST /api/messages
 * Public — submit a contact form message, save to DB, send email notification.
 */
exports.create = async (req, res, next) => {
  try {
    const { fullName, email, phone, projectType, estimatedBudget, message } = req.body;

    // Validate required fields
    if (!fullName || !email || !message) {
      return res.status(400).json({
        success: false,
        error: 'Full name, email, and message are required',
      });
    }

    const messageData = {
      full_name: fullName,
      email,
      phone,
      project_type: projectType,
      estimated_budget: estimatedBudget,
      message,
    };

    // Save to database
    const { data: newMessage, error } = await supabase
      .from('messages')
      .insert([messageData])
      .select()
      .single();

    if (error) throw error;

    // Send email notification (non-blocking)
    try {
      const transporter = createTransporter();
      if (transporter && process.env.NOTIFY_EMAIL) {
        await transporter.sendMail({
          from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
          to: process.env.NOTIFY_EMAIL,
          subject: `New Project Inquiry from ${fullName}`,
          html: buildEmailHtml(newMessage),
        });
      }
    } catch (emailError) {
      console.error('Email notification failed:', emailError.message);
    }

    res.status(201).json({
      success: true,
      data: { message: 'Message received' },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/messages
 * Protected — get all messages sorted by created_at desc.
 */
exports.getAll = async (req, res, next) => {
  try {
    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const mapped = messages.map(m => ({
      ...m,
      _id: m.id,
      fullName: m.full_name,
      projectType: m.project_type,
      estimatedBudget: m.estimated_budget,
      isRead: m.is_read
    }));

    res.json({ success: true, data: mapped });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/messages/:id
 * Protected — get a single message.
 */
exports.getOne = async (req, res, next) => {
  try {
    const { data: msg, error } = await supabase
      .from('messages')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();

    if (error) throw error;
    if (!msg) {
      return res.status(404).json({ success: false, error: 'Message not found' });
    }

    const mapped = {
      ...msg,
      _id: msg.id,
      fullName: msg.full_name,
      projectType: msg.project_type,
      estimatedBudget: msg.estimated_budget,
      isRead: msg.is_read
    };

    res.json({ success: true, data: mapped });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/messages/:id/read
 * Protected — toggle isRead.
 */
exports.toggleRead = async (req, res, next) => {
  try {
    const { data: msg, error: getErr } = await supabase
      .from('messages')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();

    if (getErr || !msg) {
      return res.status(404).json({ success: false, error: 'Message not found' });
    }

    const { data: updatedMsg, error: updateErr } = await supabase
      .from('messages')
      .update({ is_read: !msg.is_read, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single();

    if (updateErr) throw updateErr;

    const mapped = {
      ...updatedMsg,
      _id: updatedMsg.id,
      fullName: updatedMsg.full_name,
      projectType: updatedMsg.project_type,
      estimatedBudget: updatedMsg.estimated_budget,
      isRead: updatedMsg.is_read
    };

    res.json({ success: true, data: mapped });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/messages/:id
 * Protected — delete a message.
 */
exports.remove = async (req, res, next) => {
  try {
    const { data: msg, error: getErr } = await supabase
      .from('messages')
      .select('id')
      .eq('id', req.params.id)
      .maybeSingle();

    if (getErr || !msg) {
      return res.status(404).json({ success: false, error: 'Message not found' });
    }

    const { error: delErr } = await supabase
      .from('messages')
      .delete()
      .eq('id', req.params.id);

    if (delErr) throw delErr;

    res.json({ success: true, data: { message: 'Message deleted' } });
  } catch (error) {
    next(error);
  }
};
