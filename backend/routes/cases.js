const express = require('express');
const router = express.Router();
const Case = require('../models/Case');
const { Document } = require('../models/DocumentHearing');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const sendEmail = require('../utils/email');

// ── GET /api/cases ─────────────────────────────────────────────
// Admin: all cases | Judge: assigned | User: own cases
router.get('/', protect, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'user') query.filer = req.user._id;
    if (req.user.role === 'judge') query.assignedJudge = req.user._id;

    const { status, category, search, page = 1, limit = 20 } = req.query;
    if (status) query.status = status;
    if (category) query.category = category;
    if (search) query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { caseId: { $regex: search, $options: 'i' } },
    ];

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Case.countDocuments(query);
    const cases = await Case.find(query)
      .populate('assignedJudge', 'name email')
      .populate('filer', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({ success: true, total, page: parseInt(page), cases });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/cases ────────────────────────────────────────────
router.post('/', protect, authorize('user'), async (req, res) => {
  try {
    const { title, category, description, reliefSought, urgency, respondent, lawyer } = req.body;

    const newCase = await Case.create({
      title, category, description, reliefSought, urgency,
      respondent, lawyer,
      filer: req.user._id,
      filerName: req.user.name,
      filerContact: req.user.phone,
    });

    res.status(201).json({ success: true, case: newCase });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/cases/:id ─────────────────────────────────────────
router.get('/:id', protect, async (req, res) => {
  try {
    const c = await Case.findOne({ _id: req.params.id })
      .populate('assignedJudge', 'name email')
      .populate('filer', 'name email phone')
      .populate('documents')
      .populate('hearings');

    if (!c) return res.status(404).json({ success: false, message: 'Case not found.' });

    // Access control
    if (req.user.role === 'user' && c.filer._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this case.' });
    }
    if (req.user.role === 'judge' && c.assignedJudge?._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'This case is not assigned to you.' });
    }

    res.json({ success: true, case: c });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── PUT /api/cases/:id/assign ──────────────────────────────────
// Admin assigns a judge
router.put('/:id/assign', protect, authorize('admin'), async (req, res) => {
  try {
    const { judgeId, judgeName } = req.body;
    const c = await Case.findByIdAndUpdate(
      req.params.id,
      {
        assignedJudge: judgeId,
        assignedJudgeName: judgeName,
        status: 'Accepted',
        $push: {
          timeline: {
            event: 'Judge Assigned',
            description: `Case assigned to ${judgeName}`,
            actor: req.user.name,
          },
        },
      },
      { new: true }
    ).populate('filer', 'name email');

    if (!c) return res.status(404).json({ success: false, message: 'Case not found.' });

    // Notify filer
    await sendEmail({
      to: c.filer.email,
      subject: `[JustEase] Case ${c.caseId} Assigned`,
      html: `<p>Dear ${c.filer.name},</p><p>Your case <strong>${c.caseId} — ${c.title}</strong> has been assigned to <strong>${judgeName}</strong>. You will be notified of hearing dates.</p><p>— JustEase Team</p>`,
    });

    res.json({ success: true, case: c });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── PUT /api/cases/:id/status ──────────────────────────────────
// Judge updates case status and adds remarks
router.put('/:id/status', protect, authorize('judge', 'admin'), async (req, res) => {
  try {
    const { status, remark } = req.body;
    const c = await Case.findById(req.params.id).populate('filer', 'name email');
    if (!c) return res.status(404).json({ success: false, message: 'Case not found.' });

    c.status = status;
    if (remark) {
      c.remarks.push({ author: req.user._id, authorName: req.user.name, text: remark });
    }
    await c.save();

    // Notify filer
    await sendEmail({
      to: c.filer.email,
      subject: `[JustEase] Case ${c.caseId} Status Updated`,
      html: `<p>Dear ${c.filer.name},</p><p>Your case <strong>${c.caseId}</strong> status has been updated to <strong>${status}</strong>.</p>${remark ? `<p>Remarks: ${remark}</p>` : ''}<p>— JustEase Team</p>`,
    });

    res.json({ success: true, case: c });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/cases/:id/documents ─────────────────────────────
// Upload supporting documents
router.post('/:id/documents', protect, upload.single('document'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded.' });

    const doc = await Document.create({
      name: req.body.name || req.file.originalname,
      originalName: req.file.originalname,
      type: req.body.type || 'Evidence',
      fileUrl: `/uploads/${req.file.filename}`,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      uploadedBy: req.user._id,
      uploaderName: req.user.name,
      relatedCase: req.params.id,
    });

    await Case.findByIdAndUpdate(req.params.id, { $push: { documents: doc._id } });

    res.status(201).json({ success: true, document: doc });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/cases/stats/analytics ────────────────────────────
router.get('/stats/analytics', protect, authorize('admin'), async (req, res) => {
  try {
    const [total, pending, inProgress, resolved, rejected] = await Promise.all([
      Case.countDocuments(),
      Case.countDocuments({ status: 'Pending' }),
      Case.countDocuments({ status: 'In Progress' }),
      Case.countDocuments({ status: 'Resolved' }),
      Case.countDocuments({ status: 'Rejected' }),
    ]);

    const byCategory = await Case.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);

    res.json({ success: true, stats: { total, pending, inProgress, resolved, rejected, byCategory } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
