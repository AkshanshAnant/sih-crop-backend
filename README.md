# Smart Farming Advisory Chatbot — Backend (Node/Express + MongoDB)

## Repositories of the Frontend and LLM Developed:

- `Frontend`: React/Vite app: https://github.com/sp4m-08/sih-crop-frontend
- `LLM/Agent`: Crop Chat Agent (FastAPI + LangGraph)
  - Repo: https://github.com/Keshavgoyal14/crop-chat-agent
  - API: https://crop-chat-agent.onrender.com/api/v1/chat

Node.js/Express + MongoDB backend for the Smart Farming Assistant. Handles:

- User authentication (register/login with JWT)
- Protected farmer profile (create/view/update)
- Chat API that forwards messages to the external AI advisory service and persists chat sessions + conversation history

---

## Features

### 1) Authentication

- `POST /api/auth/register` — creates a user (password hashed with bcrypt) and returns a JWT
- `POST /api/auth/login` — validates credentials and returns a JWT

### 2) Protected Profile

- `GET /api/profile` — fetch the authenticated user’s farmer profile
- `POST /api/profile` — create profile if missing (or update)
- `PUT /api/profile` — partial update (any subset of `location`, `preferredCrop`, `farmSizeAcres`)

### 3) Protected Chat (AI Advisory)

- `POST /api/chat` — authenticated route
  - Accepts a user message (and optional `sessionId`)
  - Persists the user message to MongoDB
  - Calls the external LLM/FastAPI agent
  - Persists the agent response to MongoDB
  - Returns `{ response, sessionId }`

External AI agent endpoint used by this backend:

- Crop Chat Agent (FastAPI + LangGraph): `https://crop-chat-agent.onrender.com/api/v1/chat`

Frontend integration:

- This backend is consumed by the React/Vite frontend at `frontend/`.
  - Frontend repo (as referenced in the main README): `https://github.com/sp4m-08/sih-crop-frontend`

---

## Tech Stack

- **Runtime**: Node.js + Express 5
- **Database**: MongoDB + Mongoose
- **Auth**: JWT (`jsonwebtoken`)
- **Password hashing**: bcryptjs
- **HTTP client**: axios

---

## Project Structure

```
sih/
  server.js                 # Express app bootstrap + route mounting
  config/
    db.js                   # MongoDB connection helper
  middleware/
    auth.js                 # JWT verification middleware
  routes/
    auth.js                 # /api/auth/*
    chat.js                 # /api/chat
    profile.js              # /api/profile
  models/
    Users.js                # User collection
    Session.js              # Chat session collection
    Conversation.js         # Per-session conversation messages
    FarmerProfile.js       # Farmer profile collection
```

---

## Prerequisites

- Node.js 18+
- MongoDB instance (Atlas or local)
- The following environment variables

---

## Environment Variables

Create a `.env` file inside `sih/`:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=replace-with-a-strong-secret
PORT=3000

# Optional (CORS is currently static in server.js, but can be adjusted in code)
# ALLOWED_ORIGINS=http://localhost:5173
```

---

## Installation & Run

### 1) Install dependencies

```bash
cd sih
npm install
```

### 2) Start dev server

```bash
npm run dev
# Server: http://localhost:3000
```

### 3) Start production server

```bash
npm start
```

---

## CORS

In `server.js`, CORS is configured for:

- `http://localhost:5173`
- `https://sih-crop-frontend-sigma.vercel.app`

If you run the frontend elsewhere, update the `cors({ origin: [...] })` list.

---

## Authentication Details (How to call protected APIs)

The backend accepts JWT via either:

- `Authorization: Bearer <token>` (preferred)
- `x-auth-token: <token>`

Protected routes:

- `POST /api/chat` requires auth
- `GET/POST/PUT /api/profile` requires auth

---

## API Reference

Base URL: `http://localhost:3000/api`

### Auth

#### `POST /api/auth/register`

**Body**:

```json
{ "username": "string", "email": "string", "password": "string" }
```

**Response**:

```json
{ "message": "User created successfully!", "token": "<jwt>" }
```

#### `POST /api/auth/login`

**Body**:

```json
{ "email": "string", "password": "string" }
```

**Response**:

```json
{ "message": "User logged in Succesfully", "token": "<jwt>" }
```

---

### Chat

#### `POST /api/chat` (protected)

**Headers**:

- `Authorization: Bearer <jwt>`

**Body**:

```json
{ "message": "string", "sessionId": "optional-session-id" }
```

**Response**:

```json
{ "response": "agent reply text", "sessionId": "<mongo-session-id>" }
```

Notes:

- If `sessionId` is omitted, a new chat session is created.
- Conversation messages are stored in MongoDB with `indexInSession`.

---

### Profile

#### `GET /api/profile` (protected)

**Response**:

- Full farmer profile document

If not found:

- `404` with `{ "message": "Profile not found" }`

#### `POST /api/profile` (protected)

Creates or updates profile.

**Body**:

```json
{ "location": "string", "preferredCrop": "string", "farmSizeAcres": 0 }
```

**Response**:

- `201` if created
- `200` if updated

#### `PUT /api/profile` (protected)

Partial update.

**Body** (any subset):

```json
{ "location": "string", "preferredCrop": "string", "farmSizeAcres": 0 }
```

**Response**:

```json
{ "message": "Profile updated successfully", "profile": { ... } }
```

---

## Error Handling (common cases)

- **401 Unauthorized**: token missing/invalid
  - Ensure `Authorization: Bearer <token>` is present.
- **404 Session not found**: `sessionId` provided but no matching session exists
- **Mongo errors / DB connection failures**: check `MONGODB_URI`
- **LLM agent errors**: check reachability of `https://crop-chat-agent.onrender.com/api/v1/chat`

Helped By Akshansh Anant.

---

## License

MIT (update as needed)
