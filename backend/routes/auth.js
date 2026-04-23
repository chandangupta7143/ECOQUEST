const router         = require('express').Router();
const bcrypt         = require('bcryptjs');
const jwt            = require('jsonwebtoken');
const crypto         = require('crypto');
const rateLimit      = require('express-rate-limit');
const User           = require('../models/User');
const { validateEmail }          = require('../utils/validateEmail');
const { sendVerificationEmail }  = require('../utils/emailService');

// ── Rate limiter: max 10 register/login attempts per 15 min per IP ──
const authLimiter = rateLimit({
  windowMs:        15 * 60 * 1000, // 15 minutes
  max:             10,
  message:         { message: 'Too many attempts — please try again in 15 minutes' },
  standardHeaders: true,
  legacyHeaders:   false,
});

// ─────────────────────────────────────────────────────────────
// POST /api/auth/register
// ─────────────────────────────────────────────────────────────
router.post('/register', authLimiter, async (req, res) => {
  try {
    const { name, email, password, role, class: userClass, school } = req.body;

    // ── 1. Input presence check ──────────────────────────────
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    // ── 2. Backend email format validation ───────────────────
    const emailCheck = validateEmail(email);
    if (!emailCheck.valid) {
      return res.status(400).json({ message: emailCheck.reason });
    }

    // ── 3. Sanitise (lowercase + trim) ───────────────────────
    const cleanEmail = email.trim().toLowerCase();

    // ── 4. Password length ───────────────────────────────────
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // ── 5. Uniqueness check ──────────────────────────────────
    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // ── 6. Hash password ─────────────────────────────────────
    const hashed = await bcrypt.hash(password, 12); // 12 rounds (stronger than 10)

    // ── 7. Generate verification token (crypto — built-in) ───
    const verificationToken  = crypto.randomBytes(32).toString('hex');
    const tokenExpiry        = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // ── 8. Create user (isVerified = false) ──────────────────
    const user = await User.create({
      name:                    name.trim(),
      email:                   cleanEmail,
      password:                hashed,
      role:                    role || 'student',
      class:                   userClass || '',
      school:                  school   || '',
      isVerified:              false,
      verificationToken,
      verificationTokenExpiry: tokenExpiry,
    });

    // ── 9. Send verification email OR skip in dev mode ───────
    const emailConfigured = process.env.EMAIL_USER &&
                            process.env.EMAIL_PASS &&
                            process.env.EMAIL_USER !== 'your_gmail@gmail.com' &&
                            process.env.EMAIL_PASS !== 'your_16_char_app_password';

    if (emailConfigured) {
      // ── Production path: send real verification email ──────
      try {
        await sendVerificationEmail(cleanEmail, verificationToken);
      } catch (mailErr) {
        await User.findByIdAndDelete(user._id);
        console.error('Email send failed:', mailErr.message);
        return res.status(500).json({
          message: 'Could not send verification email. Please try again.',
        });
      }

      return res.status(201).json({
        message: 'Registration successful! Please check your email and click the verification link to activate your account.',
        email: cleanEmail,
      });

    } else {
      // ── Dev/demo path: no email configured → auto-verify ──
      console.warn('⚠️  EMAIL not configured — auto-verifying user for development');
      user.isVerified              = true;
      user.verificationToken       = null;
      user.verificationTokenExpiry = null;
      await user.save();

      // Issue JWT immediately (same as login)
      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.status(201).json({
        token,
        user: {
          id:     user._id,
          name:   user.name,
          email:  user.email,
          role:   user.role,
          xp:     0,
          level:  1,
          streak: 0,
          class:  user.class,
          school: user.school,
          badges: [],
          interests: [],
        },
        devMode: true, // flag so frontend knows
      });
    }

  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ message: 'Registration failed. Please try again.' });
  }
});

// ─────────────────────────────────────────────────────────────
// GET /api/auth/verify-email?token=<hex>
// ─────────────────────────────────────────────────────────────
router.get('/verify-email', async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ message: 'Verification token is missing' });
    }

    // Find user by token
    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or already used verification link' });
    }

    // Check token expiry
    if (user.verificationTokenExpiry < new Date()) {
      return res.status(400).json({
        message: 'Verification link has expired. Please register again.',
        expired: true,
      });
    }

    // Mark verified — clear token fields
    user.isVerified              = true;
    user.verificationToken       = null;
    user.verificationTokenExpiry = null;
    await user.save();

    res.json({ message: 'Email verified successfully! You can now log in.' });

  } catch (err) {
    console.error('Verify email error:', err.message);
    res.status(500).json({ message: 'Verification failed. Please try again.' });
  }
});

// ─────────────────────────────────────────────────────────────
// POST /api/auth/login
// ─────────────────────────────────────────────────────────────
router.post('/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Backend email format check
    const emailCheck = validateEmail(email);
    if (!emailCheck.valid) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });

    // Never reveal which field is wrong (security)
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // ── Email verification gate ──────────────────────────────
    if (!user.isVerified) {
      return res.status(403).json({
        message: 'Please verify your email before logging in. Check your inbox for the verification link.',
        notVerified: true,
        email: cleanEmail,
      });
    }

    // Issue JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id:     user._id,
        name:   user.name,
        email:  user.email,
        role:   user.role,
        xp:     user.xp,
        level:  user.level,
        streak: user.streak,
        class:  user.class,
        badges: user.badges,
      },
    });

  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ message: 'Login failed. Please try again.' });
  }
});

// ─────────────────────────────────────────────────────────────
// POST /api/auth/resend-verification
// (In case email expired or not received)
// ─────────────────────────────────────────────────────────────
router.post('/resend-verification', authLimiter, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) return res.status(400).json({ message: 'Email is required' });

    const emailCheck = validateEmail(email);
    if (!emailCheck.valid) return res.status(400).json({ message: 'Invalid email format' });

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });

    // Always return success — don't reveal if email exists or not
    if (!user || user.isVerified) {
      return res.json({ message: 'If this email is registered and unverified, a new link has been sent.' });
    }

    const newToken  = crypto.randomBytes(32).toString('hex');
    const newExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    user.verificationToken       = newToken;
    user.verificationTokenExpiry = newExpiry;
    await user.save();

    await sendVerificationEmail(cleanEmail, newToken);

    res.json({ message: 'If this email is registered and unverified, a new link has been sent.' });

  } catch (err) {
    console.error('Resend verification error:', err.message);
    res.status(500).json({ message: 'Failed to resend. Please try again.' });
  }
});

module.exports = router;
