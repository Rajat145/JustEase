const express = require('express');
const router = express.Router();
const Affidavit = require('../models/Affidavit');
const { protect, authorize } = require('../middleware/auth');

// Generate affidavit content from template
function generateContent(data) {
  const today = new Date().toLocaleDateString('en-IN');
  const templates = {
    'Name Change': `AFFIDAVIT FOR NAME CHANGE\n\nI, ${data.fullName}, ${data.fathersName ? `D/O S/O ${data.fathersName},` : ''} aged ${data.dateOfBirth ? Math.floor((new Date() - new Date(data.dateOfBirth)) / 31557600000) : '__'} years, residing at ${data.address || '__________'}, do hereby solemnly affirm and declare as follows:\n\n1. That my name has been incorrectly recorded in official documents and I wish to correct it to "${data.fullName}".\n\n2. That the information given above is true and correct to the best of my knowledge and belief.\n\n3. That I make this affidavit for the purpose of correcting my name in official records.\n\nSolemnly affirmed at _____________ on ${today}.\n\nDeponent: ${data.fullName}`,
    'Address Proof': `AFFIDAVIT FOR ADDRESS PROOF\n\nI, ${data.fullName}, do hereby solemnly affirm and declare that I am a bona fide resident of ${data.address}, ${data.state}, India. This declaration is made for the purpose of: ${data.purpose || 'address verification'}.\n\nI declare that the above statement is true to the best of my knowledge and belief.\n\nSolemnly affirmed at _____________ on ${today}.\n\nDeponent: ${data.fullName}`,
    'General': `GENERAL AFFIDAVIT\n\nI, ${data.fullName}, residing at ${data.address || '__________'}, do hereby solemnly affirm and declare as follows:\n\n${data.purpose || '__________'}\n\nI declare that the above statements are true to the best of my knowledge and belief and nothing material has been concealed therefrom.\n\nSolemnly affirmed at _____________ on ${today}.\n\nDeponent: ${data.fullName}`,
  };
  return templates[data.template] || templates['General'];
}

// GET all affidavits for current user
router.get('/', protect, async (req, res) => {
  try {
    const query = req.user.role === 'user' ? { owner: req.user._id } : {};
    const affidavits = await Affidavit.find(query).sort({ createdAt: -1 });
    res.json({ success: true, affidavits });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST create affidavit
router.post('/', protect, authorize('user'), async (req, res) => {
  try {
    const content = generateContent(req.body);
    const aff = await Affidavit.create({
      ...req.body,
      owner: req.user._id,
      ownerName: req.user.name,
      content,
      status: 'Draft',
    });
    res.status(201).json({ success: true, affidavit: aff });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT update affidavit (add signature, finalize)
router.put('/:id', protect, async (req, res) => {
  try {
    const aff = await Affidavit.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      req.body,
      { new: true }
    );
    if (!aff) return res.status(404).json({ success: false, message: 'Affidavit not found.' });
    res.json({ success: true, affidavit: aff });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET single affidavit
router.get('/:id', protect, async (req, res) => {
  try {
    const aff = await Affidavit.findById(req.params.id);
    if (!aff) return res.status(404).json({ success: false, message: 'Not found.' });
    res.json({ success: true, affidavit: aff });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
