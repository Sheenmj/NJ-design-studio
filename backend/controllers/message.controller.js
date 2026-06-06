const nodemailer = require('nodemailer');
const Message = require('../models/Message');

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
          <td style="padding: 8px 12px;">${data.fullName}</td>
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
        ${data.projectType ? `
        <tr style="background: #f9f9f9;">
          <td style="padding: 8px 12px; font-weight: bold; color: #555;">Project Type</td>
          <td style="padding: 8px 12px;">${data.projectType}</td>
        </tr>` : ''}
        ${data.estimatedBudget ? `
        <tr>
          <td style="padding: 8px 12px; font-weight: bold; color: #555;">Est. Budget</td>
          <td style="padding: 8px 12px;">${data.estimatedBudget}</td>
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

    // Save to database
    const newMessage = await Message.create({
      fullName,
      email,
      phone,
      projectType,
      estimatedBudget,
      message,
    });

    // Send email notification (non-blocking — don't fail the request if email fails)
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
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, error: messages.join(', ') });
    }
    next(error);
  }
};

/**
 * GET /api/messages
 * Protected — get all messages sorted by createdAt desc.
 */
exports.getAll = async (req, res, next) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.json({ success: true, data: messages });
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
    const msg = await Message.findById(req.params.id);
    if (!msg) {
      return res.status(404).json({ success: false, error: 'Message not found' });
    }
    res.json({ success: true, data: msg });
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
    const msg = await Message.findById(req.params.id);
    if (!msg) {
      return res.status(404).json({ success: false, error: 'Message not found' });
    }

    msg.isRead = !msg.isRead;
    await msg.save();

    res.json({ success: true, data: msg });
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
    const msg = await Message.findById(req.params.id);
    if (!msg) {
      return res.status(404).json({ success: false, error: 'Message not found' });
    }

    await msg.deleteOne();
    res.json({ success: true, data: { message: 'Message deleted' } });
  } catch (error) {
    next(error);
  }
};
