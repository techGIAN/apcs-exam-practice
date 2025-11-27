// server.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
const SUBMIT_PASSWORD = process.env.SUBMIT_PASSWORD || 'exam123';

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// In-memory token store for reusable tokens
const validTokens = new Set();

// Endpoint to verify password and generate a reusable token
app.post('/verify-password', (req, res) => {
  const { password } = req.body;
  if (password === SUBMIT_PASSWORD) {
    const token = crypto.randomBytes(16).toString('hex');
    validTokens.add(token); // token valid for multiple submissions
    res.json({ ok: true, token });
  } else {
    res.json({ ok: false });
  }
});

// Submit endpoint
app.post('/submit', (req, res) => {
  const { token, name, questions } = req.body;
  if (!validTokens.has(token)) return res.json({ ok: false, error: 'Invalid token' });

  // Save submission to submissions.json
  const submissionsFile = path.join(__dirname, 'submissions.json');
  let submissions = [];
  if (fs.existsSync(submissionsFile)) {
    submissions = JSON.parse(fs.readFileSync(submissionsFile, 'utf8'));
  }
  const entry = { name, time: new Date().toISOString(), questions };
  submissions.push(entry);
  fs.writeFileSync(submissionsFile, JSON.stringify(submissions, null, 2));

  res.json({ ok: true });
});

// Admin endpoint to download submissions.json
app.get('/admin/download', (req, res) => {
  const submissionsFile = path.join(__dirname, 'submissions.json');
  if (!fs.existsSync(submissionsFile)) return res.status(404).send('No submissions yet');
  res.download(submissionsFile, 'submissions.json');
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));