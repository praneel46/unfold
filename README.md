# 🌿 UNFOLD — "Let your world unfold."

> **CodeAlpha Full Stack Development — Task 2: Social Media Platform**  
> An original, editorial full-stack social platform centered around people, thoughts, moments, discoveries, and conversations.

---

## 📖 Product Concept & Philosophy

Every person has stories, ideas, interests, and experiences that gradually unfold. A post on **UNFOLD** is not merely "content" in an algorithmic feed—it is an invitation into someone's world.

UNFOLD combines the tactile elegance of an editorial magazine with a modern social architecture:
- **Calm, Intentional Aesthetic**: Warm paper light atmosphere (`#FDFBF7`) and deep ink dark atmosphere (`#11100F`).
- **Editorial Typography**: Heading hierarchy using **DM Serif Display** paired with **Inter** for comfortable long-form reading.
- **Human Pace**: Non-card layouts with generous whitespace, subtle dividers, and progressive unfold animations.
- **Real Database-Backed Social Graph**: SQLite + Prisma ORM with JWT authentication, real likes, follows, comments, bookmarks, and notifications.

---

## 🏛️ Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend Framework** | React 18 + Vite 6 | Fast SPA rendering & modern component architecture |
| **Styling** | Tailwind CSS | Editorial tokens, color system, and custom keyframes |
| **Routing** | React Router v6 | Client-side routing with protected route wrappers |
| **Iconography** | Lucide React | Clean, consistent SVG icon set |
| **Backend Framework** | Node.js + Express.js | Modular REST API service |
| **Database** | SQLite | Relational database storage |
| **ORM** | Prisma ORM (`@prisma/client`) | Type-safe schema migrations & relations |
| **Authentication** | JWT + bcryptjs | Token-based auth with salted password hashing |
| **Media Uploads** | Multer | Local static file uploads for avatars, banners, and posts |

---

## ✅ CodeAlpha Task 2 Requirements Mapping

| Requirement | Implementation Status | Implementation Details |
|---|---|---|
| **User Registration / Login** | ✅ Fully Functional | JWT authentication, bcrypt password hashing, input validation, localStorage persistence |
| **User Profiles** | ✅ Fully Functional | Cover banners, avatars, bios, metadata, follower/following stats, profile editor |
| **Posts** | ✅ Fully Functional | Create, view, and delete posts with categories (`Thought`, `Essay`, `Moment`, `Discovery`, `Story`) and images |
| **Comments** | ✅ Fully Functional | Add, view, and delete comments on posts with live counter updates |
| **Like System** | ✅ Fully Functional | Real database-backed likes with optimistic UI, counter syncing, and duplicate prevention |
| **Follow System** | ✅ Fully Functional | Self-referential user follow graph, personalized "Following" stream, and followers modal |
| **Database Storage** | ✅ Fully Functional | SQLite database managed with Prisma schema models (`User`, `Post`, `Comment`, `Like`, `Follow`, `Bookmark`, `Notification`) |

---

## 📐 Project Structure

```
Unfold-CodeAlpha/
├── package.json                      # Workspace scripts (dev, seed, db:push, build)
├── .env.example                      # Root environment configuration template
├── README.md                         # Documentation
├── server/
│   ├── prisma/
│   │   ├── schema.prisma             # SQLite relational schema
│   │   ├── seed.js                   # High-quality editorial personas & seed content
│   │   └── dev.db                    # Active SQLite database
│   ├── src/
│   │   ├── config/                   # Environment & JWT configuration
│   │   ├── controllers/              # Auth, Post, Comment, User, Notification, Explore
│   │   ├── middleware/               # Auth, Upload (Multer), Error handling
│   │   ├── routes/                   # REST API routes
│   │   ├── utils/                    # Prisma client singleton, JWT signing helpers
│   │   └── server.js                 # Express server & static upload server
│   ├── test-api.js                   # Automated REST API test suite
│   ├── .env.example                  # Server environment template
│   └── package.json
└── client/
    ├── index.html                    # Fonts (DM Serif Display, Inter) & brand SVG favicon
    ├── tailwind.config.js            # Editorial design tokens & animations
    ├── vite.config.js                # Vite configuration with /api backend proxy
    ├── src/
    │   ├── context/                  # AuthContext, ThemeContext, ToastContext, PostModalContext
    │   ├── components/
    │   │   ├── common/               # Logo, Button, Input, Modal, Avatar, Badge, Skeleton, EmptyState
    │   │   ├── layout/               # AppLayout, SidebarNav, RightSidebar, MobileBottomNav, TopHeader
    │   │   ├── post/                 # PostCard, PostComposerModal, InlineComposer, CommentSection
    │   │   ├── profile/              # ProfileHeader, EditProfileModal, FollowListModal
    │   │   └── notifications/        # NotificationItem
    │   ├── pages/
    │   │   ├── AuthPage.jsx          # Split-screen editorial login & registration
    │   │   ├── HomePage.jsx          # Dual feeds (For You / Following) + category filters
    │   │   ├── ExplorePage.jsx       # Live search & editorial streams
    │   │   ├── PostDetailPage.jsx    # Dedicated post reading route (/post/:id)
    │   │   ├── ProfilePage.jsx       # Tabbed profile (Thoughts, Liked, Media, Saved)
    │   │   ├── BookmarksPage.jsx     # Saved reading archive
    │   │   ├── NotificationsPage.jsx # Database-backed interaction stream
    │   │   ├── SettingsPage.jsx      # Atmosphere switcher & account security
    │   │   └── NotFoundPage.jsx      # 404 Editorial fallback
    │   ├── utils/                    # API client with token injector, date utilities
    │   ├── App.jsx                   # React Router routing tree
    │   ├── main.jsx                  # Application entry point
    │   └── index.css                 # Custom scrollbars, design variables
    └── package.json
```

---

## 🗄️ Database Architecture (Prisma + SQLite)

```prisma
model User {
  id            String         @id @default(uuid())
  email         String         @unique
  username      String         @unique
  name          String
  passwordHash  String
  bio           String?        @default("")
  location      String?        @default("")
  website       String?        @default("")
  avatarUrl     String?        @default("")
  bannerUrl     String?        @default("")
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt

  posts         Post[]
  comments      Comment[]
  likes         Like[]
  bookmarks     Bookmark[]
  following     Follow[]       @relation("UserFollowing")
  followers     Follow[]       @relation("UserFollowers")
  notificationsReceived Notification[] @relation("RecipientNotifications")
  notificationsTriggered Notification[] @relation("ActorNotifications")
}

model Post {
  id          String       @id @default(uuid())
  content     String
  imageUrl    String?
  category    String?      @default("Thought")
  published   Boolean      @default(true)
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt

  authorId    String
  author      User         @relation(fields: [authorId], references: [id], onDelete: Cascade)
  comments    Comment[]
  likes       Like[]
  bookmarks   Bookmark[]
  notifications Notification[]
}

model Comment {
  id          String       @id @default(uuid())
  content     String
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt

  authorId    String
  author      User         @relation(fields: [authorId], references: [id], onDelete: Cascade)
  postId      String
  post        Post         @relation(fields: [postId], references: [id], onDelete: Cascade)
  notifications Notification[]
}

model Like {
  id        String   @id @default(uuid())
  createdAt DateTime @default(now())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  postId    String
  post      Post     @relation(fields: [postId], references: [id], onDelete: Cascade)

  @@unique([userId, postId])
}

model Follow {
  id          String   @id @default(uuid())
  createdAt   DateTime @default(now())
  followerId  String
  follower    User     @relation("UserFollowing", fields: [followerId], references: [id], onDelete: Cascade)
  followingId String
  following   User     @relation("UserFollowers", fields: [followingId], references: [id], onDelete: Cascade)

  @@unique([followerId, followingId])
}

model Bookmark {
  id        String   @id @default(uuid())
  createdAt DateTime @default(now())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  postId    String
  post      Post     @relation(fields: [postId], references: [id], onDelete: Cascade)

  @@unique([userId, postId])
}

model Notification {
  id          String   @id @default(uuid())
  type        String   // LIKE, COMMENT, FOLLOW, BOOKMARK
  read        Boolean  @default(false)
  createdAt   DateTime @default(now())
  recipientId String
  recipient   User     @relation("RecipientNotifications", fields: [recipientId], references: [id], onDelete: Cascade)
  actorId     String
  actor       User     @relation("ActorNotifications", fields: [actorId], references: [id], onDelete: Cascade)
  postId      String?
  post        Post?    @relation(fields: [postId], references: [id], onDelete: Cascade)
  commentId   String?
  comment     Comment? @relation(fields: [commentId], references: [id], onDelete: Cascade)
}
```

---

## 📡 REST API Reference

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a new account
- `POST /api/auth/login` — Sign in and receive JWT token
- `GET /api/auth/me` — Retrieve current authenticated user profile & unread counts *(Protected)*
- `PUT /api/auth/update-password` — Change account password *(Protected)*

### Posts (`/api/posts`)
- `GET /api/posts` — Retrieve paginated feed (`?feed=for-you|following`, `?category=...`, `?username=...`, `?search=...`)
- `GET /api/posts/:id` — Retrieve post detail with comment thread
- `POST /api/posts` — Publish a new thought *(Protected, multipart/json)*
- `DELETE /api/posts/:id` — Delete author's post *(Protected)*
- `POST /api/posts/:id/like` — Toggle like/unlike with notification *(Protected)*
- `POST /api/posts/:id/bookmark` — Toggle bookmark *(Protected)*

### Comments (`/api/comments`)
- `GET /api/comments/post/:postId` — Retrieve comments for a post
- `POST /api/comments/post/:postId` — Add comment to post *(Protected)*
- `DELETE /api/comments/:id` — Delete author's comment *(Protected)*

### Users & Profiles (`/api/users`)
- `GET /api/users/profile/:username` — Retrieve user profile & follow status
- `PUT /api/users/profile` — Update user profile details & avatar/banner *(Protected)*
- `POST /api/users/:id/follow` — Toggle follow/unfollow *(Protected)*
- `GET /api/users/:id/followers` — Retrieve followers list
- `GET /api/users/:id/following` — Retrieve following list
- `GET /api/users/:id/likes` — Retrieve posts liked by user
- `GET /api/users/bookmarks/saved` — Retrieve bookmarked posts *(Protected)*
- `GET /api/users/suggestions/who-to-follow` — Curated suggested accounts

### Explore (`/api/explore`)
- `GET /api/explore` — Search query for thoughts/creators or fetch trending streams

### Notifications (`/api/notifications`)
- `GET /api/notifications` — Retrieve user notifications *(Protected)*
- `GET /api/notifications/unread-count` — Unread count *(Protected)*
- `PUT /api/notifications/read-all` — Mark all as read *(Protected)*
- `PUT /api/notifications/:id/read` — Mark single notification as read *(Protected)*

---

## 🚀 Installation & Quick Start

### 1. Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)

### 2. Clone & Install Dependencies
```bash
# Clone the repository
git clone https://github.com/praneel46/unfold.git
cd unfold

# Install root, server, and client dependencies
npm run install:all
```

### 3. Initialize SQLite Database & Seed Data
```bash
# Push Prisma schema to SQLite
npm run db:push

# Seed realistic editorial community data
npm run seed
```

### 4. Start the Application
```bash
# Start both backend (port 5000) and frontend (port 5173) concurrently
npm run dev
```

- **Frontend Client**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000`
- **API Health Check**: `http://localhost:5000/api/health`

---

## 👥 Seeded Test Accounts (`password123`)

| Name | Username / Email | Role / Focus |
|---|---|---|
| **Elena Rostova** | `elena.rostova@unfold.io` / `elena_rostova` | Architectural Theorist & Spatial Essayist |
| **Praneel Kulkarni** | `demo@unfold.io` / `praneel_k` | UNFOLD Founder & Product Engineer |
| **Marcus Vance** | `marcus.vance@unfold.io` / `marcus_vance` | Creative Technologist & Type Designer |
| **Clara Dupont** | `clara.dupont@unfold.io` / `clara_dupont` | Documentary Photographer & Chronicler |
| **Arjun Mehta** | `arjun.mehta@unfold.io` / `arjun_mehta` | Product Thinker & Slow Systems Advocate |
| **Dr. Sophia Chen** | `sophia.chen@unfold.io` / `sophia_chen` | Neuroaesthetics Researcher & Author |
| **Julian Kroll** | `julian.kroll@unfold.io` / `julian_kroll` | Sound Artist & Experimental Filmmaker |

---

## 🧪 Automated Testing & Production Build

### Run Backend API Test Suite
```bash
node server/test-api.js
```
*Executes 16 end-to-end test suites verifying health check, JWT auth, feeds, post creation, likes, bookmarks, comments, follows, notifications, and cascade deletions.*

### Build Production Bundle
```bash
npm run build:client
```
*Compiles the frontend with Vite into optimized static assets in `client/dist/`.*

---

## 🔮 Future Enhancements
- **End-to-End Encryption** for direct member conversations.
- **Audio Essay Attachments** for spoken reflections and sound art.
- **Export to PDF/EPUB** for personal reading archives.

---

## 📄 License
MIT License. Built with craft for CodeAlpha Task 2.
