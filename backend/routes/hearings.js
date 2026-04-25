const express = require('express');
const router = express.Router();
const { Hearing } = require('../models/DocumentHearing');
const Case = require('../models/Case');
const { protect, authorize } = require('../middleware/auth');
const sendEmail = require('../utils/email');

// ── GET /api/hearings ──────────────────────────────────────────
router.get('/', protect, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'user') query.filer = req.user._id;
    if (req.user.role === 'judge') query.judge = req.user._id;

    const hearings = await Hearing.find(query)
      .populate('case', 'caseId title')
      .populate('judge', 'name')
      .sort({ scheduledAt: 1 });

    res.json({ success: true, hearings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/hearings ─────────────────────────────────────────
router.post('/', protect, authorize('judge', 'admin'), async (req, res) => {
  try {
    const { caseId, scheduledAt, venue, notes } = req.body;

    const caseDoc = await Case.findById(caseId).populate('filer', 'name email');
    if (!caseDoc) return res.status(404).json({ success: false, message: 'Case not found.' });

    const hearing = await Hearing.create({
      case: caseDoc._id,
      caseId: caseDoc.caseId,
      caseTitle: caseDoc.title,
      judge: req.user._id,
      judgeName: req.user.name,
      filer: caseDoc.filer._id,
      filerName: caseDoc.filer.name,
      filerEmail: caseDoc.filer.email,
      scheduledAt,
      venue: venue || 'JustEase Platform — Virtual Courtroom',
      notes,
    });

    // Update case
    await Case.findByIdAndUpdate(caseId, {
      $push: { hearings: hearing._id },
      nextHearing: scheduledAt,
      $push: {
        timeline: {
          event: 'Hearing Scheduled',
          description: `Hearing scheduled for ${new Date(scheduledAt).toLocaleDateString()}`,
          actor: req.user.name,
        },
      },
    });

    // Notify filer via email
    const dateStr = new Date(scheduledAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    await sendEmail({
      to: caseDoc.filer.email,
      subject: `[JustEase] Hearing Scheduled — ${caseDoc.caseId}`,
      html: `
        <p>Dear ${caseDoc.filer.name},</p>
        <p>A hearing has been scheduled for your case <strong>${caseDoc.caseId} — ${caseDoc.title}</strong>.</p>
        <p><strong>Date & Time:</strong> ${dateStr} IST</p>
        <p><strong>Venue:</strong> ${hearing.venue}</p>
        ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ''}
        <p>Please ensure you are available at the scheduled time.</p>
        <p>— JustEase Team</p>
        <hr/>
        <small>⚠️ JustEase is a legal assistance platform, not an official government court.</small>
      `,
    });

    hearing.notificationSent = true;
    await hearing.save();

    res.status(201).json({ success: true, hearing });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── PUT /api/hearings/:id ──────────────────────────────────────
router.put('/:id', protect, authorize('judge', 'admin'), async (req, res) => {
  try {
    const hearing = await Hearing.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!hearing) return res.status(404).json({ success: false, message: 'Hearing not found.' });
    res.json({ success: true, hearing });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
