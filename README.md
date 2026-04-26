# StudyPlan Hub - Collaborative Study Platform

A production-grade full-stack application for creating, sharing, and learning from structured study plans.

## 📋 Features

- **User Authentication**: JWT-based auth with access & refresh tokens
- **Study Plans**: Create and share multi-day study plans with daily tasks
- **Social Features**: Follow plans, track progress, and rate quality
- **Search & Filters**: Discover plans by category, popularity, or rating
- **Progress Tracking**: Monitor completion status for each study plan
- **User Dashboard**: View created plans, followed plans, and profile info

## 🏗 Tech Stack

**Backend:**
- Node.js + Express.js 5.2.1
- TypeScript 6.0.2 (strict mode)
- PostgreSQL 14+ (via Neon Cloud)
- JWT authentication
- bcrypt password hashing
- Joi validation
- Express rate limiting

**Frontend:**
- HTML5 semantic markup
- CSS3 with responsive design
- Vanilla JavaScript ES6+
- No external frameworks or build tools

**Database:**
- Neon PostgreSQL (managed cloud)
- 7 tables with relationships and indexes
- Foreign key constraints
- Automatic timestamp tracking

## 🚀 Quick Start

### Backend Setup

1. Navigate to server folder:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file with environment variables:
   ```env
   PORT=5174
   CONNECTION_URL=postgresql://user:password@host/database?sslmode=require
   CLIENT_URL=http://localhost:3000
   JWT_ACCESS_SECRET=your-access-secret-key
   JWT_REFRESH_SECRET=your-refresh-secret-key
   DATABASE_SSL=true
   NODE_ENV=development
   ```

4. Start the server:
   ```bash
   npm run dev
   ```
   
   Server runs on `http://localhost:5174`

### Frontend Setup

1. Navigate to client folder:
   ```bash
   cd client
   ```

2. If not already installed, install Python (for http.server)

3. Start the frontend:
   ```bash
   npm start
   ```
   
   Frontend runs on `http://localhost:3000`

### Database Setup

The PostgreSQL schema is automatically deployed to Neon. If setting up locally:

1. Create database:
   ```sql
   CREATE DATABASE studyplan_hub;
   ```

2. Apply schema from `server/db/schema.sql`:
   ```bash
   psql -U postgres -h localhost -d studyplan_hub -f db/schema.sql
   ```

## 📁 Project Structure

```
project/
├── server/                          # Backend Node.js/Express API
│   ├── src/
│   │   ├── index.ts                # Entry point (compiled)
│   │   ├── app.ts                  # Express app configuration
│   │   ├── server.ts               # Server startup
│   │   ├── config/
│   │   │   └── db.ts               # PostgreSQL connection pool
│   │   ├── middleware/             # Express middleware
│   │   │   ├── auth.middleware.ts  # JWT validation
│   │   │   ├── error.middleware.ts # Global error handler
│   │   │   ├── rateLimit.middleware.ts  # Rate limiting
│   │   │   └── validation.middleware.ts # Joi validation
│   │   ├── models/                 # Data access layer
│   │   │   ├── user.model.ts
│   │   │   ├── plan.model.ts
│   │   │   ├── task.model.ts
│   │   │   ├── follow.model.ts
│   │   │   ├── progress.model.ts
│   │   │   ├── rating.model.ts
│   │   │   └── refreshToken.model.ts
│   │   ├── services/               # Business logic
│   │   │   ├── auth.service.ts
│   │   │   ├── user.service.ts
│   │   │   └── plan.service.ts
│   │   ├── controllers/            # HTTP handlers
│   │   │   ├── auth.controller.ts
│   │   │   ├── user.controller.ts
│   │   │   └── plan.controller.ts
│   │   ├── routes/                 # API routes
│   │   │   ├── auth.routes.ts
│   │   │   ├── user.routes.ts
│   │   │   ├── plan.routes.ts
│   │   │   ├── follow.routes.ts
│   │   │   ├── progress.routes.ts
│   │   │   └── rating.routes.ts
│   │   ├── types/
│   │   │   └── express/index.d.ts  # TypeScript declarations
│   │   └── utils/
│   │       ├── jwt.util.ts         # JWT token management
│   │       ├── password.util.ts    # Password hashing
│   │       └── validationSchemas.ts # Joi schemas
│   ├── db/
│   │   └── schema.sql              # PostgreSQL schema
│   ├── dist/                       # Compiled JavaScript output
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example

├── client/                          # Frontend Vanilla JS application
│   ├── index.html                  # Home page
│   ├── css/
│   │   └── styles.css              # Responsive design system
│   ├── js/
│   │   ├── api.js                  # API client with auth
│   │   └── app.js                  # Page logic & initialization
│   ├── pages/
│   │   ├── login.html              # Login form
│   │   ├── register.html           # Registration form
│   │   ├── dashboard.html          # User dashboard
│   │   ├── plan-detail.html        # View & track plan
│   │   └── create-plan.html        # Create new plan
│   ├── assets/
│   └── package.json

└── README.md                        # This file
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - Login and receive tokens
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Invalidate refresh token

### Users
- `GET /api/users/me` - Get authenticated user profile (protected)

### Study Plans
- `GET /api/plans` - List all plans with filters
- `GET /api/plans/popular` - Get most popular plans
- `GET /api/plans/:id` - Get plan details with tasks
- `POST /api/plans` - Create new plan (protected)
- `PUT /api/plans/:id` - Update plan (protected)
- `DELETE /api/plans/:id` - Delete plan (protected)

### Followers
- `POST /api/follow/:planId` - Follow a plan (protected)
- `DELETE /api/follow/:planId` - Unfollow a plan (protected)

### Progress
- `GET /api/progress/:planId` - Get user's plan progress (protected)
- `POST /api/progress/:planId` - Update completed tasks (protected)

### Ratings
- `POST /api/rating/:planId` - Rate a plan (protected)

## 🔐 Security

- JWT tokens: Access (15 min) + Refresh (7 days)
- Passwords hashed with bcrypt (12 rounds)
- Rate limiting: 120 requests/minute per IP
- Input validation with Joi schemas
- CORS enabled for frontend origin
- SSL/TLS for database connection
- Protected routes require valid JWT

## 🌐 Environment Variables

**Backend (.env):**
```
PORT=5174
CONNECTION_URL=postgresql://...
CLIENT_URL=http://localhost:3000
JWT_ACCESS_SECRET=supersecret
JWT_REFRESH_SECRET=supersecret
DATABASE_SSL=true
NODE_ENV=development
```

## 📝 Available Scripts

**Backend (server/ folder):**
- `npm run dev` - Start dev server with hot reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm run start` - Run compiled server
- `npm run type-check` - Check TypeScript types

**Frontend (client/ folder):**
- `npm start` - Start HTTP server on port 3000

## 🧪 Testing the Application

1. Start backend & frontend servers (as shown above)
2. Open browser to `http://localhost:3000`
3. Register a new account
4. Create a study plan with daily tasks
5. View the plan, track progress, and rate it
6. Follow other plans from the home page
7. Check your dashboard for created and followed plans

## 📊 Database Schema

**Tables:**
- `users` - User accounts with email and hashed passwords
- `study_plans` - Study plan metadata
- `tasks` - Daily tasks within plans
- `followers` - Follow relationships between users and plans
- `progress` - User progress tracking per plan
- `ratings` - User ratings per plan
- `refresh_tokens` - Valid refresh tokens for auth

**Indexes:**
- `idx_users_email` - Fast user lookup by email
- `idx_plans_creator_id` - User's created plans
- `idx_followers_plan_id` - Plans with follower counts
- `idx_progress_user_plan` - User's progress per plan
- `idx_ratings_user_plan` - User's rating per plan

## 🐛 Troubleshooting

**Backend won't start:**
- Verify NODE_ENV, PORT, and database CONNECTION_URL in .env
- Check PostgreSQL is running and reachable
- Run `npm install` if dependencies are missing

**Frontend not loading:**
- Ensure backend server is running on port 5174
- Check http://localhost:3000 in browser console for API errors
- Verify CLIENT_URL matches frontend's origin in backend .env

**CORS errors:**
- Confirm CLIENT_URL in backend .env matches frontend URL
- Check backend is sending proper CORS headers

**Database connection errors:**
- Verify DATABASE_SSL=true for cloud databases
- Test connection string with psql command
- Check firewall/IP allowlist on cloud provider

## 📚 Additional Resources

- Express.js: https://expressjs.com/
- PostgreSQL: https://www.postgresql.org/docs/
- JWT: https://jwt.io/
- TypeScript: https://www.typescriptlang.org/docs/
- Neon PostgreSQL: https://neon.tech/docs

## 📄 License

This project is open source and available under the MIT License.

   ```powershell
   psql -d studyplan_db -f server/sql/schema.sql
   ```

3. Copy environment variables:

   ```powershell
   cp server/.env.example server/.env
   ```

   Update `server/.env` with your database connection and secrets.

4. Start the development server:

   ```powershell
   cd server
   npm run dev
   ```

5. Browse the app at `http://localhost:5174`

## API Endpoints

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`

### Users
- `GET /api/users/me`

### Plans
- `GET /api/plans`
- `GET /api/plans/popular`
- `GET /api/plans/:planId`
- `POST /api/plans`
- `PUT /api/plans/:planId`
- `DELETE /api/plans/:planId`
- `POST /api/plans/:planId/follow`
- `DELETE /api/plans/:planId/follow`
- `GET /api/plans/:planId/progress`
- `POST /api/plans/:planId/progress`
- `POST /api/plans/:planId/rating`

## Sample curl requests

Register:
```bash
curl -X POST http://localhost:5174/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","email":"alice@example.com","password":"securePass123"}'
```

Login:
```bash
curl -X POST http://localhost:5174/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"securePass123"}'
```

Create a plan:
```bash
curl -X POST http://localhost:5174/api/plans \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -d '{"title":"JavaScript Review","description":"A structured 2-week JS study plan","subject":"JavaScript","durationDays":14,"tasks":[{"day":1,"title":"Intro","description":"Review basics"}]}'
```

## Notes

- Frontend files are served from `server/public`
- API uses strict validation with Joi and parameterized queries for security
- Refresh tokens are stored in PostgreSQL for session management
#   S t u d y P l a n - H u b  
 #   S t u d y P l a n - H u b  
 #   S t u d y P l a n - H u b  
 #   S t u d y P l a n - H u b  
 