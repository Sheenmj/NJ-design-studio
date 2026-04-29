# NJ Design Studio

> **Architecture & Urban Innovation** — A visionary architectural firm crafting immersive spaces that merge innovation, sustainability, and human experience.

![NJ Design Studio](https://img.shields.io/badge/NJ%20Design%20Studio-Architecture-c8a96e?style=for-the-badge)
![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?style=for-the-badge&logo=vite)
![Three.js](https://img.shields.io/badge/Three.js-0.184-black?style=for-the-badge&logo=three.js)
![GSAP](https://img.shields.io/badge/GSAP-3.15-88CE02?style=for-the-badge)

---

## 🏛 Overview

NJ Design Studio is a fully responsive, immersive architectural portfolio website for **Nishant Joseph, Principal Architect**. The site is designed with a premium dark aesthetic, interactive 3D canvas backgrounds, and a built-in client-side CMS (Admin Portal) for managing content without a backend.

---

## ✨ Features

### Public Website
- **Immersive Hero Section** — 3D animated canvas background with a floating glassmorphism card
- **Portfolio Gallery** — Filterable project grid with modal detail views
- **Services Section** — Animated service cards
- **Process Timeline** — Step-by-step workflow with 3D canvas accents
- **About / Team** — Philosophy statement with team member profiles
- **Contact Form** — Inquiry form with phone number, project type, and budget fields
- **Interactive Map** — Google Maps embed showing the studio location in Jabalpur
- **Social Links** — Direct Instagram profile link
- **Scroll Animations** — GSAP-powered reveal animations throughout

### Admin Portal (`/admin.html`)
- **Secure Login** — Password-protected access via `sessionStorage`
- **Portfolio Management** — Add, edit, and delete portfolio projects
- **Team Management** — Add, edit, and delete team members
- **Image Upload** — Direct image upload from your computer (resized & stored in browser)
- **Messages Inbox** — Pulsing notification badge shows unread client inquiries
- **Message Detail View** — View full inquiry details including name, email, phone, budget
- **Mark as Read / Delete** — Full message lifecycle management

---

## 🗂 Project Structure

```
NJ design studio/
├── index.html              # Main website
├── admin.html              # Admin portal
├── public/                 # Static public assets
└── src/
    ├── main.js             # App entry point & GSAP init
    ├── style.css           # Global design system & styles
    ├── admin.js            # Admin portal logic (auth, CRUD, messages)
    ├── admin.css           # Admin-specific styles
    ├── assets/
    │   ├── hero.png
    │   └── portfolio/      # Project images
    ├── sections/
    │   ├── hero.js         # 3D hero canvas & counter animation
    │   ├── portfolio.js    # Portfolio grid & modal
    │   ├── services.js     # Services cards
    │   ├── process.js      # Process timeline
    │   ├── about.js        # Team & philosophy
    │   └── contact.js      # Contact form & 3D cityscape canvas
    └── utils/
        ├── store.js        # localStorage data store & message helpers
        └── buildingGeometry.js  # Three.js 3D building geometry
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) v18 or higher
- npm

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd "NJ design studio"

# Install dependencies
npm install
```

### Development Server

```bash
npm run dev
```

The site will be available at **`http://localhost:5173`**

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

---

## 🔐 Admin Portal

Navigate to **`http://localhost:5173/admin.html`** (or the `/admin.html` link in the site footer).

| Credential | Value |
|---|---|
| **Password** | `admin123` |

> ⚠️ **Security Note:** The admin password is hardcoded in `src/admin.js`. For a production deployment, replace this with a secure authentication service.

### How Data Works

All content (projects, team, messages) is stored in the browser's **`localStorage`** under the key `nj_store`. This means:
- ✅ Edits persist across page refreshes in the same browser
- ✅ No backend server required
- ❌ Changes are local to the device/browser they were made on
- ❌ Client messages are stored on the client's browser — for real cross-device messaging, integrate a backend service like [EmailJS](https://www.emailjs.com/), [Formspree](https://formspree.io/), or [Firebase](https://firebase.google.com/)

---

## 🖼 Managing Images

Images can be uploaded directly in the Admin portal:
1. Click **Edit** on any Portfolio project or Team member
2. Click **"Choose File"** to select an image from your computer
3. Click **"Upload"** — the image is compressed to max 800px and stored as a base64 string in localStorage
4. Click **"Save Changes"**

---

## 🛠 Tech Stack

| Technology | Purpose |
|---|---|
| **Vite** | Build tool & dev server |
| **Vanilla JS (ESM)** | All interactivity and logic |
| **Vanilla CSS** | Styling with custom CSS variables |
| **GSAP + ScrollTrigger** | Scroll animations |
| **Three.js** | 3D canvas backgrounds (hero, contact) |
| **localStorage** | Client-side CMS data persistence |
| **Google Maps Embed** | Studio location map |

---

## 📞 Contact

**Nishant Joseph** — Principal Architect  
📍 Sanjeevani Nagar, Jabalpur, Madhya Pradesh 482002  
📧 joseph.nishant011@gmail.com  
📞 +91 75073 04073  
📸 [Instagram](https://www.instagram.com/ar.nishant.joseph)

---

## 📄 License

This project is private and proprietary to **NJ Design Studio**. All rights reserved.
