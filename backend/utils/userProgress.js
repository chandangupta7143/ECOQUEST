const User = require('../models/User');

const levelThresholds = [0, 500, 1000, 2000, 3500, 5000, 7500, 10000, 15000, 20000];

function xpToLevel(xp) {
  for (let i = levelThresholds.length - 1; i >= 0; i--) {
    if (xp >= levelThresholds[i]) return i + 1;
  }
  return 1;
}

async function updateProgress(userId) {
  const user = await User.findById(userId);
  if (!user) return;

  const newLevel = xpToLevel(user.xp);

  const today = new Date().toISOString().split('T')[0];
  const lastDate = user.lastActive ? new Date(user.lastActive).toISOString().split('T')[0] : null;

  let streak = user.streak || 0;
  if (lastDate === today) {
    // already active today, no streak change
  } else {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yStr = yesterday.toISOString().split('T')[0];
    if (lastDate === yStr) {
      streak += 1;
    } else if (lastDate !== today) {
      streak = 1;
    }
  }

  // Update activity log
  const log = user.activityLog || [];
  const existingEntry = log.find((e) => e.date === today);
  if (existingEntry) {
    existingEntry.count = (existingEntry.count || 0) + 1;
  } else {
    log.push({ date: today, count: 1 });
  }
  // Keep last 90 days
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 90);
  const trimmed = log.filter((e) => new Date(e.date) >= cutoff);

  await User.findByIdAndUpdate(userId, {
    level: newLevel,
    streak,
    lastActive: new Date(),
    activityLog: trimmed,
  });
}

module.exports = { updateProgress, xpToLevel };
