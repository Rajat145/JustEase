const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { protect, authorize } = require("../middleware/auth");

// Admin: get all users
router.get("/", protect, authorize("admin"), async (req, res) => {
  try {
    const { role, search } = req.query;
    let query = {};
    if (role) query.role = role;
    if (search)
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    const users = await User.find(query).sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin: get all judges (for assignment dropdown)
router.get("/judges", protect, authorize("admin"), async (req, res) => {
  try {
    const judges = await User.find({ role: "judge", isActive: true }).select(
      "name email",
    );
    res.json({ success: true, judges });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin: toggle user active status
router.put(
  "/:id/toggle-status",
  protect,
  authorize("admin"),
  async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user)
        return res
          .status(404)
          .json({ success: false, message: "User not found." });
      user.isActive = !user.isActive;
      await user.save({ validateBeforeSave: false });
      res.json({ success: true, user });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },
);

// Admin: update user role
router.put("/:id/role", protect, authorize("admin"), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: req.body.role },
      { new: true },
    );
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
