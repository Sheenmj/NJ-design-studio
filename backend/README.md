# NJ Design Studio — Backend API

REST API backend for the NJ Design Studio architectural portfolio website.

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (Mongoose ODM)
- **Auth:** JWT + bcrypt
- **Image Uploads:** Cloudinary (via Multer memory storage)
- **Email:** Nodemailer
- **Security:** Helmet, CORS, express-rate-limit

---

## Setup

### 1. Install dependencies

```bash
cd backend
npm install
```

### 2. Create environment file

Copy the example and fill in your values:

```bash
cp .env.example .env
```

Required variables:

| Variable | Description |
|---|---|
| `PORT` | Server port (default: 5000) |
| `FRONTEND_URL` | Frontend origin for CORS (default: http://localhost:5173) |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for signing JWTs |
| `JWT_EXPIRES_IN` | Token expiry duration (default: 7d) |
| `ADMIN_EMAIL` | Email for the seed admin account |
| `ADMIN_PASSWORD` | Password for the seed admin account |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `EMAIL_HOST` | SMTP host (e.g. smtp.gmail.com) |
| `EMAIL_PORT` | SMTP port (e.g. 587) |
| `EMAIL_USER` | SMTP username |
| `EMAIL_PASS` | SMTP password |
| `EMAIL_FROM` | Sender address |
| `NOTIFY_EMAIL` | Email to receive contact notifications |

### 3. Seed the admin user

```bash
npm run seed
```

This creates the initial admin account using `ADMIN_EMAIL` and `ADMIN_PASSWORD` from your `.env` file. If an admin already exists, it will skip creation.

### 4. Start the server

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

---

## API Endpoints

All endpoints return responses in this format:

```json
// Success
{ "success": true, "data": { ... } }

// Error
{ "success": false, "error": "Error message" }
```

### Health Check

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/health` | No | Returns `{ status: "ok", timestamp }` |

---

### Auth

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/login` | No | Authenticate admin |

**POST /api/auth/login**

```json
// Request body
{
  "email": "admin@example.com",
  "password": "your-password"
}

// Response
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": "7d"
  }
}
```

---

### Projects

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/projects` | No | Get all projects (sorted by newest) |
| `GET` | `/api/projects/:id` | No | Get a single project |
| `POST` | `/api/projects` | Yes | Create a project |
| `PUT` | `/api/projects/:id` | Yes | Update a project |
| `DELETE` | `/api/projects/:id` | Yes | Delete a project |

**POST /api/projects** (multipart/form-data)

```
Headers: Authorization: Bearer <token>
Fields:
  - title (required): "Modern Villa"
  - category (required): "Residential" | "Commercial" | "Cultural" | "Urban"
  - description: "A stunning contemporary residence..."
  - featured: "true" | "false"
  - image (file): JPEG, PNG, or WebP (max 5MB)
```

```json
// Response (201)
{
  "success": true,
  "data": {
    "_id": "...",
    "title": "Modern Villa",
    "category": "Residential",
    "description": "A stunning contemporary residence...",
    "imageUrl": "https://res.cloudinary.com/...",
    "publicId": "nj-design-studio/projects/...",
    "featured": true,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
}
```

---

### Team Members

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/team` | No | Get all team members (sorted by order) |
| `GET` | `/api/team/:id` | No | Get a single team member |
| `POST` | `/api/team` | Yes | Create a team member |
| `PUT` | `/api/team/:id` | Yes | Update a team member |
| `DELETE` | `/api/team/:id` | Yes | Delete a team member |

**POST /api/team** (multipart/form-data)

```
Headers: Authorization: Bearer <token>
Fields:
  - name (required): "Jane Doe"
  - role (required): "Lead Architect"
  - bio: "20 years of experience..."
  - order: 1
  - image (file): JPEG, PNG, or WebP (max 5MB)
```

```json
// Response (201)
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "Jane Doe",
    "role": "Lead Architect",
    "bio": "20 years of experience...",
    "imageUrl": "https://res.cloudinary.com/...",
    "publicId": "nj-design-studio/team/...",
    "order": 1,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
}
```

---

### Messages

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/messages` | No | Submit a contact form (rate-limited: 10/15min) |
| `GET` | `/api/messages` | Yes | Get all messages (sorted by newest) |
| `GET` | `/api/messages/:id` | Yes | Get a single message |
| `PATCH` | `/api/messages/:id/read` | Yes | Toggle read/unread status |
| `DELETE` | `/api/messages/:id` | Yes | Delete a message |

**POST /api/messages**

```json
// Request body
{
  "fullName": "John Smith",
  "email": "john@example.com",
  "phone": "+1 234 567 890",
  "projectType": "Residential",
  "estimatedBudget": "$500k - $1M",
  "message": "I'd like to discuss a new home project..."
}

// Response (201)
{
  "success": true,
  "data": {
    "message": "Message received"
  }
}
```

---

## Authentication

All protected routes require the `Authorization` header:

```
Authorization: Bearer <jwt-token>
```

Obtain a token via `POST /api/auth/login`. The token expires after the duration set in `JWT_EXPIRES_IN` (default: 7 days).

---

## Project Structure

```
backend/
├── server.js                  # Entry point
├── .env.example               # Environment variable template
├── package.json
├── config/
│   ├── db.js                  # MongoDB connection
│   └── cloudinary.js          # Cloudinary config
├── models/
│   ├── Admin.js               # Admin user model
│   ├── Project.js             # Portfolio project model
│   ├── TeamMember.js          # Team member model
│   └── Message.js             # Contact form message model
├── middleware/
│   ├── auth.js                # JWT verification
│   └── upload.js              # Multer image upload
├── routes/
│   ├── auth.routes.js         # Login route
│   ├── project.routes.js      # Portfolio CRUD
│   ├── team.routes.js         # Team member CRUD
│   └── message.routes.js      # Contact messages
├── controllers/
│   ├── auth.controller.js
│   ├── project.controller.js
│   ├── team.controller.js
│   └── message.controller.js
└── scripts/
    └── seedAdmin.js           # One-time admin creation
```
