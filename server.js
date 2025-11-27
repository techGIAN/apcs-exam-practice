const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const PASSWORD = process.env.SUBMIT_PASSWORD || 'password';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// In-memory token to allow one-time submission after password verification
let tokenStore = new Set();

// Verify password
app.post('/verify-password', (req, res) => {
  const { password } = req.body;
  if (password === PASSWORD) {
    const token = Math.random().toString(36).substr(2);
    tokenStore.add(token);
    res.json({ ok: true, token });
  } else {
    res.json({ ok: false });
  }
});

// Submit endpoint
app.post('/submit', (req, res) => {
  const { token, name, questions } = req.body;
  if (!token || !tokenStore.has(token)) return res.json({ ok:false, error: 'Invalid or expired token.' });

  const entry = {
    name: String(name).trim(),
    time: new Date().toISOString(),
    questions: questions || {}
  };

  const filePath = path.join(__dirname, 'submissions.json');
  let arr = [];
  if (fs.existsSync(filePath)) { arr = JSON.parse(fs.readFileSync(filePath,'utf8')) || []; }
  arr.push(entry);
  fs.writeFileSync(filePath, JSON.stringify(arr, null, 2), 'utf8');

  tokenStore.delete(token);
  res.json({ ok: true });
});

// Admin endpoint to download submissions
app.get('/admin/download', (req, res) => {
  const filePath = path.join(__dirname, 'submissions.json');
  if (!fs.existsSync(filePath)) return res.status(404).send('No submissions yet');
  res.download(filePath, 'submissions.json');
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));