const router = require('express').Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// Global leaderboard
router.get('/', auth, async (req, res) => {
  try {
    const { scope = 'global', class: filterClass } = req.query;
    const filter = { role: 'student' };
    if (scope === 'class' && filterClass) filter.class = filterClass;

    const users = await User.find(filter)
      .select('name xp level streak class school badges')
      .sort({ xp: -1 })
      .limit(50);

    const ranked = users.map((u, i) => ({ rank: i + 1, ...u.toObject() }));
    res.json(ranked);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
