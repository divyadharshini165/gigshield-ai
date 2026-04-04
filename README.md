# 🛡 GigShield — Parametric Insurance Platform

A full-stack hackathon application providing automatic parametric insurance for gig workers (delivery riders, drivers, construction workers, etc.). Claims are triggered and auto-approved based on real-world environmental conditions — no manual claims needed.

---

## 🚀 Quick Start

### Option A: Run both servers together (recommended)

```bash
# 1. Clone / navigate to project root
cd gig-insurance

# 2. Install all dependencies
npm run install:all

# 3. Start both backend + frontend
npm run dev
```

### Option B: Run separately

**Terminal 1 — Backend:**
```bash
cd backend
npm install
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm install
npm start
```

---

## 🌐 URLs

| Service   | URL                        |
|-----------|----------------------------|
| Frontend  | http://localhost:3000      |
| Backend   | http://localhost:5000      |
| Health    | http://localhost:5000/api/health |

---

## 🗄 MongoDB (Optional)

The app runs in **memory mode** if MongoDB is not available — no data is lost during the session.

To use MongoDB:
```bash
# Install and start MongoDB locally
mongod --dbpath /data/db
```

Or set a custom URI:
```bash
MONGO_URI=mongodb://localhost:27017/gig_insurance npm run dev:backend
```

---

## 📁 Project Structure

```
gig-insurance/
├── package.json              ← root orchestration
├── backend/
│   ├── server.js             ← Express entry point
│   ├── package.json
│   ├── models/
│   │   ├── User.js           ← Mongoose User schema
│   │   ├── Policy.js         ← Mongoose Policy schema
│   │   └── Claim.js          ← Mongoose Claim schema
│   ├── routes/
│   │   ├── users.js          ← POST /api/users, GET /api/users/:id
│   │   ├── policies.js       ← GET /api/policies/:userId
│   │   └── claims.js         ← POST /api/claims/simulate
│   └── middleware/
│       ├── insurance.js      ← Premium calc, triggers, fraud check
│       └── store.js          ← In-memory fallback store
└── frontend/
    ├── package.json
    ├── tailwind.config.js
    ├── public/index.html
    └── src/
        ├── App.js
        ├── index.js
        ├── index.css
        ├── utils/api.js      ← All API calls
        ├── components/UI.jsx ← Reusable components
        └── pages/
            ├── RegisterPage.jsx
            └── DashboardPage.jsx
```

---

## ⚙️ API Endpoints

| Method | Endpoint                  | Description                         |
|--------|---------------------------|-------------------------------------|
| GET    | /api/health               | Health check + DB status            |
| POST   | /api/users                | Register new gig worker             |
| GET    | /api/users/:id            | Get user + policy + claims          |
| GET    | /api/policies/:userId     | Get policy for user                 |
| POST   | /api/claims/simulate      | Simulate weather + auto-trigger     |
| GET    | /api/claims/:userId       | Get all claims for user             |

---

## 🎯 Core Features

### Premium Calculation
- Base: ₹50/week
- Delivery job: +₹15
- Driver/Ride-share: +₹10
- Construction: +₹20
- Income > ₹10,000: +₹10
- High-risk city: +₹10

### Parametric Triggers
| Condition        | Threshold | Payout Multiplier |
|------------------|-----------|-------------------|
| Rainfall         | > 50mm    | 2.0×              |
| Temperature      | > 40°C    | 1.5×              |
| Air Quality (AQI)| > 300     | 1.5×              |

### Fraud Detection
- Compares user's registered city vs trigger event location
- Auto-flags if mismatch detected

---

## 🎬 Demo Flow

1. Open http://localhost:3000
2. Register with: Name=Ravi, City=Mumbai, Job=Delivery, Income=12000
3. See premium breakdown (₹85/week) + risk score
4. On dashboard → click **"Simulate Rainstorm"**
5. Watch auto-claim fire + ₹XXX payout toast appear
6. See claim in history with Fraud Check Passed badge
