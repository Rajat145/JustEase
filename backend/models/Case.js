const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const remarkSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  authorName: String,
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const timelineSchema = new mongoose.Schema({
  event: { type: String, required: true },
  description: String,
  actor: String,
  createdAt: { type: Date, default: Date.now },
});

const caseSchema = new mongoose.Schema(
  {
    caseId: {
      type: String,
      unique: true,
      default: () => {
        const year = new Date().getFullYear();
        const rand = Math.floor(1000 + Math.random() * 9000);
        return `JE-${year}-${rand}`;
      },
    },
    title: {
      type: String,
      required: [true, 'Case title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    category: {
      type: String,
      required: true,
      enum: ['Civil', 'Criminal', 'Labour', 'Consumer', 'Family', 'Financial', 'Other'],
    },
    description: {
      type: String,
      required: [true, 'Case description is required'],
    },
    reliefSought: { type: String },
    urgency: {
      type: String,
      enum: ['Low', 'Normal', 'Urgent', 'Very Urgent'],
      default: 'Normal',
    },
    status: {
      type: String,
      enum: ['Pending', 'Accepted', 'Rejected', 'In Progress', 'Adjourned', 'Resolved', 'Closed'],
      default: 'Pending',
    },
    filer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    filerName: String,
    filerContact: String,
    respondent: {
      name: String,
      contact: String,
      address: String,
    },
    lawyer: {
      name: String,
      barRegistration: String,
      contact: String,
    },
    assignedJudge: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    assignedJudgeName: String,
    documents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Document' }],
    remarks: [remarkSchema],
    timeline: [timelineSchema],
    hearings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Hearing' }],
    nextHearing: { type: Date },
  },
  { timestamps: true }
);

// Auto-push a timeline event when status changes
caseSchema.pre('save', function (next) {
  if (this.isModified('status') && !this.isNew) {
    this.timeline.push({
      event: 'Status Updated',
      description: `Case status changed to "${this.status}"`,
      actor: this.assignedJudgeName || 'System',
    });
  }
  if (this.isNew) {
    this.timeline.push({
      event: 'Case Filed',
      description: 'Case successfully filed on JustEase platform',
      actor: this.filerName || 'User',
    });
  }
  next();
});

module.exports = mongoose.model('Case', caseSchema);
