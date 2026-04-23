const nodemailer = require('nodemailer');

// ── Create reusable transporter ──────────────────────────────
// Uses Gmail SMTP with App Password (NOT your Gmail login password)
// Setup: Gmail → Settings → Security → 2FA → App Passwords → Generate
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send verification email to newly registered user
 * @param {string} toEmail - recipient email
 * @param {string} token   - verification token (hex string)
 */
async function sendVerificationEmail(toEmail, token) {
  const verifyLink = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  const mailOptions = {
    from: `"EcoQuest 🌍" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'Verify your EcoQuest account',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                 background: #0a0a0a; color: #e5e7eb; margin: 0; padding: 0; }
          .container { max-width: 480px; margin: 40px auto; background: #141414;
                       border-radius: 16px; border: 1px solid rgba(255,255,255,0.08);
                       overflow: hidden; }
          .header { background: linear-gradient(135deg, #052e16, #14532d);
                    padding: 32px 36px 24px; text-align: center; }
          .logo   { font-size: 28px; margin-bottom: 4px; }
          .title  { font-size: 22px; font-weight: 700; color: #fff; margin: 8px 0 0; }
          .body   { padding: 32px 36px; }
          .para   { font-size: 15px; line-height: 1.6; color: #9ca3af; margin: 0 0 20px; }
          .btn    { display: inline-block; background: #16a34a; color: #fff !important;
                    text-decoration: none; padding: 13px 32px; border-radius: 10px;
                    font-size: 15px; font-weight: 600; margin: 8px 0 24px; }
          .small  { font-size: 12px; color: #6b7280; line-height: 1.5; }
          .link   { color: #4ade80; word-break: break-all; }
          .footer { padding: 16px 36px 28px; font-size: 12px; color: #4b5563; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🌍</div>
            <div class="title">EcoQuest</div>
          </div>
          <div class="body">
            <p class="para" style="font-size:18px; font-weight:600; color:#fff; margin-bottom:8px;">
              Verify your email address
            </p>
            <p class="para">
              Thanks for signing up! Click the button below to confirm your email and start your eco journey.
              This link expires in <strong style="color:#fff">24 hours</strong>.
            </p>
            <a href="${verifyLink}" class="btn">✅ Verify My Email</a>
            <p class="small">
              If the button doesn't work, copy and paste this link in your browser:<br/>
              <a href="${verifyLink}" class="link">${verifyLink}</a>
            </p>
          </div>
          <div class="footer">
            If you didn't create an EcoQuest account, you can safely ignore this email.
          </div>
        </div>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
}

module.exports = { sendVerificationEmail };
