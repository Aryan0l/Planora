# Planora Test Scripts

Run these scripts from the project root after starting the backend and, for frontend checks, the static client server.

```powershell
node tests\auth-flow.js
node tests\api-smoke.js
node tests\database-flow.js
node tests\full-flow.js
node tests\frontend-assets.js
```

Optional environment overrides:

```powershell
$env:API_BASE_URL = "https://planora-paui-backend.onrender.com/api"
$env:FRONTEND_URL = "https://planora-paui.onrender.com"
```
