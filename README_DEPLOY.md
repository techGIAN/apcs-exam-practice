# APCS Exam Practice — Deploy to Render (quick)

This repository is a minimal Node.js app that serves a static frontend and accepts submissions.

## Files
- `public/index.html` — student page
- `server.js` — backend
- `package.json` — dependencies
- `submissions.json` — created at runtime

## Environment variables (set these on Render)
- `SUBMIT_PASSWORD` - the exam password students will enter
- `GMAIL_USER` - your Gmail address used to send emails (optional if you only store submissions)
- `GMAIL_APP_PASSWORD` - the Gmail app password (create in Google Account > Security > App passwords)
- `EMAIL_DEST` - recipient for submissions (defaults to `GMAIL_USER`)

## Deploy steps (Render)
1. Create a GitHub repository and push this project (root contains server.js).
2. Create a free Render account and "New → Web Service".
3. Connect the GitHub repo and select the branch.
4. Build Command: (leave blank)
5. Start Com