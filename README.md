# SkillShikhi — Social Media Meets Peer Skill Sharing

[![Next.js 15](https://img.shields.io/badge/Next.js-15.3.0-black?logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.0.0-61dafb?logo=react)](https://react.dev/)
[![Deployment](https://img.shields.io/badge/Vercel-Live-success?logo=vercel)](https://skill-shikhi.vercel.app/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> **Live Demo:** [https://skill-shikhi.vercel.app/](https://skill-shikhi.vercel.app/)  
> **Author & Developer:** [S. M. Mohiuddin Khan Shiam](https://github.com/mohiuddin-khan-shiam)

---

## 🌟 The Vision: "SkillShikhi"
*Shikhi* (শিখি) signifies **"learning"** in Bengali. **SkillShikhi** is a platform created to combine the engagement mechanics of **14 major social media platforms**—re-engineered exclusively for collaborative skill sharing, technical mentorship, and peer learning:

| Social Platform | SkillShikhi Learning Adaptation | Route |
|---|---|---|
| **Facebook & Threads** | Rich skill feeds, technical discussions, code walk-throughs & reactions | `/feed` |
| **LinkedIn** | Mastered skills directory, peer endorsements, verified mentor credentials | `/skills` |
| **YouTube & Classroom** | Virtual classrooms, live peer tutoring workshops, and calendar bookings | `/sessions` |
| **TikTok & Instagram** | 60-second vertical micro-lessons ("Skill Reels") with key takeaways | `/reels` |
| **WhatsApp & Telegram** | Real-time peer study pods, 1-on-1 direct messaging, and presence | `/chat` |
| **Reddit** | Sub-Shikhi communities (`s/webdev`, `s/ai-ml`), upvoting & verified answers | `/community` |
| **Pinterest** | Architecture blueprints, design tokens, and technical cheat sheet pinboards | `/pins` |
| **X (Twitter)** | 280-character Code Droplets, terminal one-liners, and rapid tips | `/droplets` |
| **Snapchat** | 24-hour daily learning streaks and 100-Days-of-Code progress snaps | `/feed` |
| **Messenger** | Instant teaching request dispatch and session confirmation notifications | `/teaching` |

---

## 🎯 Recruiter & Reviewer Fast-Track
To evaluate the platform, recruiters do **not** need to create database credentials or sign up:
1. **Interactive Showcase Navigation:** The top header includes an instant **Persona Switcher** allowing you to switch between:
   - 🎒 **Alex River (Learner):** Explores feeds, watches reels, pins cheat sheets, books sessions.
   - 🎓 **Dr. Sarah Khan (Mentor):** Conducts PyTorch workshops, verifies community answers.
   - 🛡️ **Shiam (Admin Lead):** Full admin dashboard with user moderation, reports, and system telemetry.
2. **Instant Demo Logins:** Both [`/login`](https://skill-shikhi.vercel.app/login) and [`/admin-login`](https://skill-shikhi.vercel.app/admin-login) feature 1-click demo entry buttons.
3. **Admin Dashboard:** Access [`/admin/dashboard`](https://skill-shikhi.vercel.app/admin/dashboard) directly to inspect platform analytics, content moderation, user management, and session monitoring.

---

## 🛡️ Vercel Free-Tier & Serverless Architecture

When deploying full-stack Next.js applications to free serverless tiers (like Vercel), two common constraints arise:
1. **Ephemeral Read-Only Filesystem:** Serverless functions cannot write files to local disk (`fs.writeFile` to `public/` causes `EROFS` errors or data vanishes on lambda recycle).
2. **Database Inactivity Timeouts:** Free MongoDB Atlas (M0) clusters frequently pause after periods of inactivity, causing connection drops (`ECONNREFUSED`).

### How SkillShikhi Solves This:
- **Resilient Fallback Data Layer:** Every API endpoint (`/api/posts`, `/api/skills`, `/api/sessions`, `/api/admin/*`) implements an automatic fallback layer. If a MongoDB cluster is asleep, paused, or unreachable, the endpoints gracefully serve high-fidelity mock data rather than crashing with a 500 error.
- **Client-Side Hybrid Hydration:** File uploads (post images, avatar photos, pinboards) are handled via client-side Base64 object URLs and synchronized to `localStorage`. User actions (new posts, likes, bookmarks, session reservations) persist interactively throughout the browser session without writing files to the server.
- **Vercel Optimized Builds:** Duplicate configuration files have been cleaned up and fatal `process.exit(1)` checks removed from `next.config.js`, ensuring 100% build pass rates on Vercel deployments.

---

## 🛠️ Tech Stack & Dependencies

- **Framework:** [Next.js 15.3.0](https://nextjs.org/) (App Router, Server & Client Components)
- **Library:** [React 19.0.0](https://react.dev/)
- **Styling:** PostCSS, Tailwind CSS v4 conventions & custom Glassmorphic design system
- **Database & ODM:** MongoDB & Mongoose 8.13.2 (with resilient offline fallback)
- **Authentication:** JSON Web Tokens (JWT) & bcryptjs
- **Icons & UI:** `react-icons`, `date-fns`, `clsx`
- **Deployment Platform:** Vercel

---

## 💻 Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/mohiuddin-khan-shiam/SkillShikhi.git
   cd SkillShikhi
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

---

## 📁 Repository Structure

```
SkillShikhi/
├── app/
│   ├── layout.js              # Global root layout with Navbar & Footer
│   ├── page.js                # Master interactive recruiter showcase landing page
│   ├── feed/                  # Facebook & Threads skill feed
│   ├── reels/                 # TikTok & Instagram 60s micro-lessons
│   ├── pins/                  # Pinterest architecture & cheatsheet pinboard
│   ├── community/             # Reddit-style skill sub-communities
│   ├── droplets/              # X (Twitter) 280-char technical tips
│   ├── sessions/              # Classroom & mentorship scheduling calendar
│   ├── chat/                  # WhatsApp & Telegram study pod messaging
│   ├── skills/                # LinkedIn skill mastery & endorsement directory
│   ├── profile/               # Learner & mentor profile portfolio
│   ├── admin-login/           # 1-click recruiter admin authentication
│   ├── admin/dashboard/       # Analytics, moderation, reports, and logs
│   ├── api/                   # Resilient serverless REST API endpoints
│   └── sitemap.js             # Native metadata sitemap
├── components/
│   ├── Navbar.js              # Global navigation with Recruiter Role Switcher
│   ├── Footer.js              # Footer with 14-platform matrix & author credits
│   └── admin/                 # Modular admin dashboard tabs & charts
├── lib/
│   ├── clientStore.js         # Client-side resilient state & localStorage manager
│   ├── demoData.js            # Comprehensive showcase data across all 14 paradigms
│   └── mongodb.js             # Resilient connection pooler with graceful fallback
└── controllers/               # Business logic controllers
```

---

## 👤 Author
**S. M. Mohiuddin Khan Shiam**  
- **GitHub:** [@mohiuddin-khan-shiam](https://github.com/mohiuddin-khan-shiam)  
- **Live Showcase:** [https://skill-shikhi.vercel.app/](https://skill-shikhi.vercel.app/)
