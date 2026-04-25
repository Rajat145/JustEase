const mongoose = require('mongoose');

const affidavitSchema = new mongoose.Schema(
  {
    affidavitId: {
      type: String,
      unique: true,
      default: () => {
        const year = new Date().getFullYear();
        const rand = Math.floor(10000 + Math.random() * 90000);
        return `AFF-${year}-${rand}`;
      },
    },
    template: {
      type: String,
      enum: ['Name Change', 'Address Proof', 'General', 'Income Declaration', 'Vehicle Transfer', 'Relationship Proof'],
      required: true,
    },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    ownerName: String,

    // Personal Details
    fullName: { type: String, required: true },
    fathersName: { type: String },
    dateOfBirth: { type: Date },
    aadhaarNumber: { type: String },
    address: { type: String },
    state: { type: String },
    purpose: { type: String },

    // Generated content
    content: { type: String }, // full affidavit text
    pdfUrl: { type: String },

    // E-signature
    signatureData: { type: String }, // base64 or URL
    eStampUrl: { type: String },

    status: {
      type: String,
      enum: ['Draft', 'Finalized', 'Attested'],
      default: 'Draft',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Affidavit', affidavitSchema);
