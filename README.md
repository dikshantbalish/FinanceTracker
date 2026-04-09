# FinanceTracker

FinanceTracker is a full-stack personal finance application for tracking transactions, investments, debts, and AI-generated financial insights. It includes a React frontend, an Express + MongoDB backend, JWT authentication, and optional OpenAI-powered finance automation.

## Features

- Secure signup and login with JWT-based authentication
- Manual transaction tracking for income and expenses
- AI-assisted transaction entry from natural language
- Bill and receipt scanning with OpenAI vision
- Receipt email/webhook ingestion for automated capture
- Dashboard with savings rate, balance, investment, and debt summaries
- Investment tracking with growth assumptions
- Debt tracking with EMI, interest rate, and due-date visibility
- Finance insights powered by OpenAI with fallback logic when AI is unavailable
- Built-in calculators for EMI, SIP, FD, and retirement-style planning

## Tech Stack

- Frontend: React, React Router, React Toastify
- Backend: Node.js, Express
- Database: MongoDB with Mongoose
- Auth: JSON Web Tokens
- AI: OpenAI Responses API

## Project Structure

```text
FinanceTracker/
├── backend/
│   ├── Controllers/
│   ├── Middlewares/
│   ├── Models/
│   ├── Routes/
│   ├── Services/
│   ├── .env.example
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   ├── .env.example
│   └── package.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- MongoDB connection string

### 1. Install dependencies

```bash
cd backend
npm install

cd ../frontend
npm install
```

### 2. Configure environment variables

Create `backend/.env` from `backend/.env.example`:

```env
PORT=8080
MONGO_CONN=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4.1-mini
```

Create `frontend/.env` from `frontend/.env.example`:

```env
REACT_APP_API_URL=http://localhost:8080
```

Important: the frontend API URL must match the backend port you actually use. The backend falls back to `8080` when `PORT` is not set, while `backend/.env.example` currently shows `5000`.

### Optional backend environment variables

These are only needed if you want email/webhook-based receipt ingestion or custom deployment behavior:

- `HOST`
- `FINANCE_FORWARD_LOCAL_PART`
- `FINANCE_FORWARD_DOMAIN`
- `FINANCE_FORWARD_ADDRESS_TEMPLATE`
- `FINANCE_INBOX_PROVIDER`
- `FINANCE_INBOX_SIGNING_SECRET`
- `FINANCE_INBOX_WEBHOOK_SECRET`
- `FINANCE_INBOX_PUBLIC_BASE_URL`
- `PUBLIC_API_BASE_URL`
- `API_BASE_URL`
- `APP_BASE_URL`

## Running the App

Start the backend:

```bash
cd backend
npm run dev
```

Start the frontend in a second terminal:

```bash
cd frontend
npm start
```

Frontend default URL:

```text
http://localhost:3000
```

Backend default URL:

```text
http://localhost:8080
```

## Available Scripts

### Backend

- `npm run dev` - starts the backend with nodemon
- `npm start` - starts the backend with Node

### Frontend

- `npm start` - starts the React development server
- `npm run build` - creates a production build
- `npm test` - runs tests

## API Overview

### Auth

- `POST /auth/signup`
- `POST /auth/login`

### Transactions

- `GET /expenses`
- `POST /expenses`
- `DELETE /expenses/:expenseId`

### Finance

- `GET /finance/dashboard`
- `GET /finance/inbox/config`
- `GET /finance/insights`
- `POST /finance/ai-entry`
- `POST /finance/scan-bill`
- `POST /finance/investments`
- `POST /finance/debts`
- `POST /finance/inbox/webhook`

## AI Notes

- Natural-language transaction parsing falls back to built-in rules if OpenAI is unavailable.
- Bill scanning requires `OPENAI_API_KEY`.
- AI insights also fall back to local finance guidance when the OpenAI service is unavailable or rate-limited.

## Deployment Note

The backend is set up to serve the React production build from `frontend/build`, so after building the frontend you can deploy the backend as the main app server.
