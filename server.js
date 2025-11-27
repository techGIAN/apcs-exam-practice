// server.js
const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ----- CONFIG: read from environment variables -----
const SUBMIT_PASSWORD = process.env.SUBMIT_PASSWORD || 'apcs2025';
const GMAIL_USER = process.env.GMAIL_USER;            // example: your.email@gmail.com
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD; // app password
const EMAIL_DEST = process.env.EMAIL_DEST || GMAIL_USER; // recipient

if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
  console.warn('Warning: GMAIL_USER and GMAIL_APP_PASSWORD are not set. Email sending will fail until configured.');
}

// ----- simple in-memory token store (token -> expiry) -----
const tokenStore = new Map();
const TOKEN_TTL_MS = 10 * 60 * 1000; // 10 minutes

function generateToken() {
  return crypto.randomBytes(24).toString('hex');
}

// cleanup expired tokens occasionally
setInterval(() => {
  const now = Date.now();
  for (const [t, exp] of tokenStore.entries()) {
    if (exp < now) tokenStore.delete(t);
  }
}, 60 * 1000);

// ----- endpoints -----

// POST /check { password: "..." } -> { ok: true, token: "..." } or { ok:false }
app.post('/check', (req, res) => {
  const pw = (req.body && req.body.password) ? String(req.body.password) : '';
  if (!pw) return res.json({ ok: false });

  // simple compare. change to hashed compare if desired.
  if (pw === SUBMIT_PASSWORD) {
    const token = generateToken();
    tokenStore.set(token, Date.now() + TOKEN_TTL_MS);
    return res.json({ ok: true, token });
  } else {
    return res.json({ ok: false });
  }
});

// POST /submit { token, name, code } -> { ok:true } or { ok:false, error: "..." }
app.post('/submit', async (req, res) => {
  const { token, name, code } = req.body || {};
  if (!token || !tokenStore.has(token)) {
    return res.json({ ok:false, error: 'Invalid or expired token. Please refresh and enter password again.' });
  }

  // token is one-time? optional: remove it to force new check. We'll keep it for TTL and accept multiple submits.
  // tokenStore.delete(token);

  if (!name || !code) {
    return res.json({ ok:false, error: 'Missing name or code.' });
  }

  const entry = {
    name: String(name).trim(),
    time: new Date().toISOString(),
    code: String(code)
  };

  // Append to submissions.json
  const filePath = path.join(__dirname, 'submissions.json');
  let arr = [];
  if (fs.existsSync(filePath)) {
    try {
      const raw = fs.readFileSync(filePath, 'utf8');
      arr = JSON.parse(raw) || [];
    } catch (e) {
      arr = [];
    }
  }
  arr.push(entry);
  try {
    fs.writeFileSync(filePath, JSON.stringify(arr, null, 2), 'utf8');
  } catch (e) {
    console.error('Failed to save submission', e);
  }

  // Send email with nodemailer (if configured)
  if (GMAIL_USER && GMAIL_APP_PASSWORD) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD }
      });

      const mailOptions = {
        from: `"APCS Submissions" <${GMAIL_USER}>`,
        to: EMAIL_DEST,
        subject: `APCS Submission from ${entry.name} @ ${entry.time}`,
        text: `Name: ${entry.name}\nTime: ${entry.time}\n\nCode:\n\n${entry.code}`
      };

      await transporter.sendMail(mailOptions);
    } catch (e) {
      console.error('Error sending email:', e && e.message ? e.message : e);
      // we won't fail the request if email fails; data is saved to submissions.json
    }
  }

  return res.json({ ok:true });
});

// Simple ping route
app.get('/ping', (req, res) => res.send('ok'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));