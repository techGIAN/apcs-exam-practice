AP CS A Midterm Exam Submission — Deploy to Render (No Email Version)

This repository is a minimal Node.js app that serves a static frontend and accepts submissions for AP CS A exam practice.

Files
	•	public/index.html — student page with password prompt and 5 code areas (1a,1b,2a,2b,3)
	•	server.js — backend server storing submissions in submissions.json
	•	package.json — Node.js dependencies
	•	.gitignore — ignore node_modules and submissions.json
	•	submissions.json — created at runtime to store student submissions

Features
	•	Password protection before allowing submission
	•	Stores student name and code for 5 questions in submissions.json
	•	Tab key inserts 2 spaces for code indentation
	•	Success toast message when submission is recorded
	•	Admin endpoint to download all submissions: /admin/download

Deploy steps (Render)
	1.	Create a GitHub repository and push this project (root contains server.js).
	2.	Create a free Render account and select New → Web Service.
	3.	Connect the GitHub repo and select the branch.
	4.	Build Command: leave blank (Node.js apps auto-detect server.js).
	5.	Start Command: node server.js
	6.	Set the following environment variable on Render:
	•	SUBMIT_PASSWORD - the exam password students must enter
	7.	Deploy.
	8.	Visit your deployed URL to check the student submission page.
	9.	After the exam, download all submissions via https://your-render-url/admin/download.

Notes
	•	No email is sent; all submissions are stored in submissions.json.
	•	You can format the JSON into a readable “email body” after downloading if desired.
	•	Works reliably on Render free tier with multiple students.
	•	Tab key is adjusted to 2 spaces for proper code indentation.
	•	Frontend is static, backend handles submissions securely via password token.

Project Structure

apcs-midterm/
├─ public/
│  └─ index.html
├─ server.js
├─ package.json
├─ .gitignore
└─ submissions.json  <-- created automatically

This setup ensures a simple, exam-like practice environment without email dependencies.