# 🏙️ SmartCity Issue Reporting Platform

A full-stack civic tech platform where citizens report local issues (potholes, broken streetlights, garbage overflow) with AI-powered photo detection, real-time notifications, and role-based dashboards.

## ✨ Features

| Feature | Tech | Impact |
|---|---|---|
| AI Vision Photo Detection | Google Gemini | Auto-fills issue type & severity from photo |
| Real-Time Feed & Notifications | Socket.io | Live updates, no refresh needed |
| Role-Based Auth | JWT + bcrypt | Citizen / Authority / Admin |
| AI Auto-Categorization | GPT-4o-mini | Text-based triage & routing |
| Background Job Queue | BullMQ + Redis | Async AI processing, instant API response |
| Redis Caching | ioredis | ~60% DB load reduction |
| Sentiment Analysis | OpenAI | Auto-escalation on frustrated comments |
| AI PDF Reports | PDFKit + OpenAI | Downloadable resolution reports |
| Interactive Maps | Leaflet + OpenStreetMap | GPS pin, issue markers, heatmap |

## 🛠️ Tech Stack

- **Frontend**: React 18 + Vite + Tailwind CSS + Framer Motion
- **Backend**: Node.js + Express.js
- **Database**: PostgreSQL + Prisma ORM
- **Cache/Queue**: Redis + BullMQ
- **Real-Time**: Socket.io
- **AI**: OpenAI API (gpt-4o + gpt-4o-mini)
- **Storage**: Cloudinary
- **Maps**: Leaflet.js + OpenStreetMap

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker Desktop (for PostgreSQL + Redis)
- OpenAI API key
- Cloudinary account (free tier)

### 1. Start Database & Redis

```bash
docker-compose up -d
```

### 2. Setup Server

```bash
cd server
cp .env.example .env   # Edit with your API keys
npm install
npm run db:generate    # Generate Prisma client
npm run db:migrate     # Run migrations
npm run db:seed        # Seed demo data
npm run dev            # Start server on :5000
```

### 3. Setup Client

```bash
cd client
npm install
npm run dev            # Start client on :5173
```

### 4. Open App

Visit `http://localhost:5173`

## 🔑 Demo Accounts (after seeding)

| Role | Email | Password |
|---|---|---|
| Admin | admin@smartcity.gov | admin123 |
| Authority | roads@smartcity.gov | auth123 |
| Citizen | rahul@example.com | citizen123 |

## 📁 Project Structure

```
smartcity/
├── client/                 # React Frontend
│   └── src/
│       ├── components/     # Navbar, IssueCard, Map, UI
│       ├── context/        # AuthContext, SocketContext
│       ├── lib/            # API client, utils
│       └── pages/          # Home, ReportIssue, Dashboard, Admin...
├── server/                 # Node.js Backend
│   └── src/
│       ├── controllers/    # auth, issue, comment, admin, report
│       ├── middleware/     # JWT auth, upload, role guards
│       ├── queues/         # BullMQ queue + worker
│       ├── routes/         # Express routes
│       └── services/       # OpenAI, Redis, Socket, Cloudinary, PDF
├── docker-compose.yml      # PostgreSQL + Redis
└── README.md
```

## 🌐 API Endpoints

### Auth
- `POST /api/auth/register` — Register citizen
- `POST /api/auth/login` — Login, returns JWT
- `POST /api/auth/refresh` — Refresh token
- `GET /api/auth/me` — Get profile

### Issues
- `POST /api/issues` — Submit issue (with photo)
- `GET /api/issues` — List issues (filterable, paginated, cached)
- `GET /api/issues/:id` — Issue detail + timeline
- `PATCH /api/issues/:id/status` — Update status (Authority)
- `POST /api/issues/:id/upvote` — Upvote
- `GET /api/issues/heatmap` — Heatmap data (cached)
- `GET /api/issues/my` — My issues (Citizen)

### Comments
- `POST /api/issues/:id/comments` — Add comment (triggers AI sentiment)
- `GET /api/issues/:id/comments` — Get comments

### Admin
- `GET /api/admin/analytics` — Platform stats + charts
- `POST /api/admin/authorities` — Create authority account
- `GET /api/admin/issues/escalated` — High priority issues

### Reports
- `GET /api/issues/:id/report` — Download AI-generated PDF

## 🔄 Issue Submission Flow

1. Citizen uploads photo + fills form → `POST /api/issues`
2. Express validates JWT + saves issue as `REPORTED`
3. Job added to BullMQ queue → API returns `201` instantly
4. Worker: uploads image to Cloudinary
5. Worker: calls OpenAI Vision → gets category, priority, description
6. Worker: updates issue in PostgreSQL with AI results
7. Worker: invalidates Redis cache
8. Worker: emits Socket.io event → dashboards update live
