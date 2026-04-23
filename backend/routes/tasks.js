const router = require('express').Router();
const auth = require('../middleware/auth');
const Task = require('../models/Task');

// Get all active tasks
router.get('/', auth, async (req, res) => {
  try {
    const filter = { isActive: true };
    if (req.query.category) filter.category = req.query.category;
    if (req.query.type) filter.type = req.query.type;
    const tasks = await Task.find(filter).populate('createdBy', 'name');
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create task (teacher only)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') return res.status(403).json({ message: 'Forbidden' });
    const task = await Task.create({ ...req.body, createdBy: req.user.id });
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete task (teacher only)
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') return res.status(403).json({ message: 'Forbidden' });
    await Task.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: 'Task deactivated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
