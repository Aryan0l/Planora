# Planora

Planora is a web application for creating, following, rating, and tracking structured study plans. It helps learners turn large goals into daily tasks and keep progress visible in one place.

---

## Features

* User registration and login
* Create study plans with day-wise tasks
* Browse and search community study plans
* Follow plans and track progress
* Rate plans
* Responsive frontend

---

## Tech Stack

Frontend:

* HTML
* CSS
* JavaScript

Backend:

* Node.js
* Express.js
* TypeScript

Database:

* PostgreSQL / Neon

Deployment:

* Render

---

## Project Structure

```text
client/
  assets/
    scripts/
    styles/
  pages/
server/
  src/
  dist/
tests/
  api-smoke.js
  auth-flow.js
  database-flow.js
  frontend-assets.js
  full-flow.js
```

---

## Test Scripts

The JavaScript test files are grouped in the `tests` folder.

```powershell
node tests\auth-flow.js
node tests\api-smoke.js
node tests\database-flow.js
node tests\full-flow.js
node tests\frontend-assets.js
```

Use deployed URLs when needed:

```powershell
$env:API_BASE_URL = "https://planora-paui-backend.onrender.com/api"
$env:FRONTEND_URL = "https://planora-paui.onrender.com"
node tests\frontend-assets.js
```

---

## Local Setup

Install backend dependencies:

```powershell
cd server
npm install
npm run build
npm start
```

Serve the frontend:

```powershell
cd client
npm install
npm start
```

Frontend:

```text
http://localhost:3000
```

Backend:

```text
http://localhost:5174/api
```

---

## Live Demo

Frontend: https://planora-paui.onrender.com

Backend: https://planora-paui-backend.onrender.com

Health check: https://planora-paui-backend.onrender.com/api/health

---

## Future Improvements

* Add reminders and notifications
* Add AI-generated study plans
* Add profile customization
* Add learning analytics

---

## Author

Aryan Raj
