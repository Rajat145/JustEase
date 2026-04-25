const mongoose = require('mongoose');

// ── Document Model ─────────────────────────────────────────────
const documentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    originalName: { type: String },
    type: {
      type: String,
      enum: ['Affidavit', 'Evidence', 'Court Order', 'ID Proof', 'Property Document', 'Other'],
      default: 'Other',
    },
    fileUrl: { type: String, required: true },
    fileSize: { type: Number },
    mimeType: { type: String },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    uploaderName: String,
    relatedCase: { type: mongoose.Schema.Types.ObjectId, ref: 'Case', default: null },
    status: {
      type: String,
      enum: ['Draft', 'Uploaded', 'Verified', 'Rejected', 'Finalized'],
      default: 'Uploaded',
    },
    isAffidavit: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// ── Hearing Model ──────────────────────────────────────────────
const hearingSchema = new mongoose.Schema(
  {
    case: { type: mongoose.Schema.Types.ObjectId, ref: 'Case', required: true },
    caseId: String,
    caseTitle: String,
    judge: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    judgeName: String,
    filer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    filerName: String,
    filerEmail: String,
    scheduledAt: { type: Date, required: true },
    venue: { type: String, default: 'JustEase Platform — Virtual Courtroom' },
    notes: { type: String },
    status: {
      type: String,
      enum: ['Scheduled', 'Completed', 'Adjourned', 'Cancelled'],
      default: 'Scheduled',
    },
    notificationSent: { type: Boolean, default: false },
    outcome: { type: String },
  },
  { timestamps: true }
);

const Document = mongoose.model('Document', documentSchema);
const Hearing   = mongoose.model('Hearing',  hearingSchema);

module.exports = { Document, Hearing };
