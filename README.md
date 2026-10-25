# SkillShikhi — The Collaborative Social Learning Ecosystem

[![Next.js 15](https://img.shields.io/badge/Next.js-15.5.28-black?logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.0.0-61dafb?logo=react)](https://react.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-Modernized-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)
[![Deployment](https://img.shields.io/badge/Vercel-Live-success?logo=vercel)](https://skill-shikhi.vercel.app/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> **Live Application:** [https://skill-shikhi.vercel.app/](https://skill-shikhi.vercel.app/)  
> **Author & Lead Developer:** [S. M. Mohiuddin Khan Shiam](https://github.com/mohiuddin-khan-shiam)

---

## 🌟 Overview: What is SkillShikhi?

*Shikhi* (শিখি) is the Bengali word for **"learning"**. **SkillShikhi** is a technical social education ecosystem that merges the engagement mechanics of **14 major social networks** into a unified, distraction-free environment built exclusively for peer-to-peer knowledge sharing and mentorship:

| Platform Synergy | SkillShikhi Learning Paradigm | Route | Core Capability |
|---|---|---|---|
| **Facebook & Threads** | Rich technical feeds | `/feed` | Interactive posts, code walkthroughs, emoji reactions & check-ins |
| **LinkedIn** | Endorsements & directory | `/skills` & `/skills/[name]` | Mastered skills directory, peer endorsements, and mentor networks |
| **YouTube & Classroom** | Live workshop stage | `/sessions` | Stage video preview, curriculum agenda, seat booking & hosting modal |
| **TikTok & Instagram** | Vertical micro-lessons | `/reels` | 60-second bite-sized technical reels with core code takeaways |
| **WhatsApp & Telegram** | Study Pods & chat | `/chat` & `/chat/[id]` | Real-time peer messaging, presence, audio pods & `#ai-pytorch` channels |
| **Reddit** | Sub-Shikhi forums | `/community` | Communities (`s/webdev`, `s/ai-ml`), karma voting & verified Q&A |
| **Pinterest** | Architecture blueprints | `/pins` | Architecture diagrams, design tokens, and technical cheat sheets |
| **X (Twitter)** | Technical droplets | `/droplets` | 280-character code droplets, terminal one-liners & rapid tips |
| **Snapchat** | Learning streaks | `/feed` | 24-hour daily learning streaks and active study check-in stories |
| **Messenger** | Mentorship requests | `/teaching` & `/friends` | Peer collaborator connections and instant mentorship bookings |

---

## ✨ Key Platform Features

### 1. 🔍 Global Omnibox & Command Palette (`Cmd / Ctrl + K`)
- Instant omnibox accessible from any page.
- Fuzzy searches across all indexed technical skills and registered mentors/peers.
- 1-click jump to dedicated skill endorsement pages or peer portfolios.

### 2. 💬 Study Pods & Real-Time Messaging (`/chat`)
- Collaborative study rooms and direct peer conversations.
- Voice/audio pod simulation with live speaking waves and participant indicators.
- Instant message delivery, rich timestamps, and optimistic UI updates.

### 3. 📅 Interactive Live Workshops Stage (`/sessions`)
- YouTube / Google Classroom hybrid stage with full video stream mockup.
- Step-by-step curriculum agendas and live seat reservation.
- Built-in "Host a Live Workshop" modal for community mentors to launch sessions instantly.

### 4. 🎭 Interactive 1-Click Role Switcher
Test the application across different perspectives directly from the navigation bar:
- 🎒 **Learner View (Alex River):** Explore feeds, watch reels, save blueprint pins, reserve classroom seats, and message study pods.
- 🎓 **Mentor View (Dr. Sarah Khan):** Host PyTorch and AI workshops, endorse peer skills, verify answers in community forums, and guide junior developers.
- 🛡️ **Admin Hub (Shiam):** Monitor platform telemetry, inspect real-time user activity logs, review moderation flags, manage community topics, and oversee scheduled classroom sessions.

---

## 🛡️ Cloud & Serverless Architecture

SkillShikhi is architected for zero-downtime operation across modern serverless platforms:

```mermaid
flowchart TD
    Client["Client Browser\n(Next.js App Router + React 19)"]
    API["Serverless Edge & API Handlers\n(/api/posts, /api/skills, /api/chat/*, /api/search)"]
    Fallback["Resilient Fallback Data Layer\n(Zero-Downtime Guarantee)"]
    MongoDB[("MongoDB Atlas\n(M0 Serverless Cluster)")]
    Store["Client State Engine\n(Optimistic UI + LocalStorage)"]

    Client -->|API Requests| API
    Client -->|User Interactions| Store
    API -->|Attempt Connection| MongoDB
    MongoDB -.->|Timeout / Sleeping Cluster| Fallback
    Fallback -->|High-Fidelity Mock Data| API
    API -->|JSON Response (200 OK)| Client
```

### Architectural Highlights:
1. **Zero-Downtime Resilient Fallback Layer:** Free cloud databases can sleep or encounter rate limits. SkillShikhi's API endpoints automatically detect connection timeouts and seamlessly fall back to high-fidelity mock datasets, guaranteeing **zero 500 errors** across all 50 routes.
2. **Modern Styling & Typography:** Built with pure Tailwind CSS, eliminating heavy external runtime scripts. Styled with **Plus Jakarta Sans** for crisp body UI and **JetBrains Mono** for syntax code snippets.
3. **Native Notification System:** Clean, accessible toast notification banners replace archaic browser `alert()` and `confirm()` modals across all user and admin workflows.
4. **Next.js 15 & React 19 App Router:** Fully compiled with React Server Components, server actions, and dynamic route handlers.

---

## 🛠️ Tech Stack

- **Framework:** [Next.js 15.5.28](https://nextjs.org/) (App Router, Server & Client Components)
- **Library:** [React 19.0.0](https://react.dev/)
- **Styling:** Tailwind CSS & Glassmorphism Design System
- **Fonts:** Plus Jakarta Sans & JetBrains Mono
- **Database & ODM:** MongoDB & Mongoose 8.13.2 (with resilient fallback handler)
- **Authentication:** JSON Web Tokens (JWT) & bcryptjs
- **Deployment:** Vercel Serverless Edge

---

## 💻 Local Development Setup

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
   Open [http://localhost:3000](http://localhost:3000) with your browser.

4. **Build for production:**
   ```bash
   npm run build
   npm run start
   ```

---

## 📁 Project Structure

```
SkillShikhi/
├── app/
│   ├── layout.js              # Global root layout with Navbar, Footer & Fonts
│   ├── page.js                # Master interactive platform showcase landing page
│   ├── feed/                  # Skill feeds & code discussions
│   ├── reels/                 # 60s vertical skill reels player
│   ├── pins/                  # Architecture & design pinboards
│   ├── community/             # Sub-Shikhi technical communities
│   ├── droplets/              # 280-char technical code droplets
│   ├── sessions/              # Classroom & workshop scheduling calendar
│   ├── chat/                  # Study pod direct messaging & live presence
│   ├── skills/                # Mastered skills & endorsements directory
│   ├── friends/               # Peer collaborator network directory
│   ├── profile/               # User profiles, portfolio & availability
│   ├── admin/dashboard/       # Analytics, moderation, and session monitoring
│   └── api/                   # Resilient serverless REST API endpoints
├── components/
│   ├── Navbar.js              # Header navigation & interactive role switcher
│   ├── Footer.js              # Platform footer & architecture summary
│   ├── GlobalSearchModal.js   # Cmd+K omnibox & quick search dialog
│   ├── Toast.js               # Reusable floating feedback notification
│   ├── ReportModal.js         # User & content moderation modal
│   ├── MasteredSkillsList.js  # Interactive skill mastery manager
│   └── admin/                 # Admin dashboard tabs & telemetry widgets
├── lib/
│   ├── clientStore.js         # Client-side resilient state & sync manager
│   ├── demoData.js            # High-fidelity data across all 14 paradigms
│   └── mongodb.js             # MongoDB connection pool with resilient fallback
└── models/                    # Mongoose schemas (User, Skill, Post, Session, etc.)
```

---

## 👤 Author & Credits

**S. M. Mohiuddin Khan Shiam**  
- **GitHub:** [@mohiuddin-khan-shiam](https://github.com/mohiuddin-khan-shiam)  
- **Live Demo:** [https://skill-shikhi.vercel.app/](https://skill-shikhi.vercel.app/)

---

## 📄 License
This project is open-source and licensed under the [MIT License](LICENSE).
