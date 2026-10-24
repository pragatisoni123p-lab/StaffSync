# StaffSync — Modern AI-Powered Human Resource Management System (HRMS)

StaffSync is an enterprise-grade Human Resource Management System built on the MERN stack (MongoDB, Express.js, React, Node.js), engineered in complete alignment with the **StaffSync Product Requirements Document (PRD)** and the **StaffSync Technical Architecture & Implementation Report**.

StaffSync digitizes employee records, attendance tracking, two-tier leave approvals, company announcements, training programs, in-app notifications, and talent analytics, augmented with Google Gemini AI capabilities for automated drafting, leave impact assessment, and training curriculum generation.

---

## 🌟 Key Highlights & Architectural Features

- **Three Primary Role Portals:** Dedicated role-governed workspaces for **HR Administrators**, **Team Managers**, and **Staff Employees**.
- **Secure Authentication & RBAC:** JWT bearer sessions, `bcryptjs` password hashing, and role-based route guards on both client (`ProtectedRoute`) and Express server (`authMiddleware`).
- **Smart Attendance Tracking:** Live clock, single-click Check-In and Check-Out, automated work-hour calculations, and Half Day threshold detection (< 4 hours).
- **Two-Tier Leave Management:** Employees apply with date validation and instant AI risk check; Managers review and approve/reject team leaves; HR exercises organizational override authority.
- **Audience-Targeted Announcements:** Broadcast company updates targeted to All, Managers, or Employees, with real-time in-app notification alerts (`NTF-1`, `NTF-2`).
- **Training & Career Development:** Managers design training tracks, enroll participants, and track schedules.
- **Workforce Analytics:** Department headcount distribution, daily attendance rates, leave trends, and development participation metrics.
- **Integrated Google Gemini AI:**
  - 🤖 **AI Announcement Drafter:** Converts quick topic bullet points into polished, professional communications.
  - 🧠 **AI Leave Impact Analyzer:** Evaluates duration, reason validity, and coverage risks with an objective 1-100 impact score.
  - 📚 **AI Training Curriculum Builder:** Outlines 4-week module syllabi and learning outcomes from course topics.

---

## 🏗️ System Architecture & Technology Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React 19 + Vite | Fast SPA client with responsive Vanilla CSS design system |
| **Styling & UI** | Custom Vanilla CSS + Lucide Icons | Dark glassmorphism, responsive cards, KPI counters, badges |
| **Routing & State**| React Router DOM v7 + React Context | Client-side routing, protected routes, unified `AuthContext` |
| **Backend API** | Node.js (v24) + Express.js (v5) | MVC RESTful API, structured controllers, route validation |
| **Database** | MongoDB (v9.0) + Mongoose | 7 Collections: Users, Employees, Attendance, Leaves, Announcements, Trainings, Notifications |
| **AI Engine** | Google Gemini API (`gemini-2.5-flash`) | Server-side GenAI integration with smart heuristic fallbacks |

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js:** v16.0.0 or higher (`v24.21.0` tested)
- **npm:** v8.0.0 or higher (`v11.19.0` tested)
- **MongoDB:** Local MongoDB daemon or MongoDB Atlas URI

---

### Step 1: Start MongoDB
If using local MongoDB binary on macOS (e.g. downloaded ARM64 build):
```bash
# From workspace root
/Users/nikhilsoni/Downloads/mongodb-macos-aarch64--9.0.2/bin/mongod --dbpath server/data/db --port 27017
```
*Or standard homebrew service:*
```bash
brew services start mongodb-community
```

---

### Step 2: Configure Backend Environment Variables
Inside `server/.env`:
```env
PORT=8000
MONGO_URI=mongodb://127.0.0.1:27017/staffsync
JWT_SECRET=staffsync_jwt_secret_token_key_2026_antigravity
GEMINI_API_KEY=your_google_gemini_api_key_here
```
> [!NOTE]
> `GEMINI_API_KEY` is optional for basic local testing: if empty, StaffSync automatically uses high-fidelity heuristic fallbacks for drafting and evaluation so you are never blocked. To activate real live Gemini LLM generations, add your Google AI Studio key.

---

### Step 3: Install Dependencies & Run

#### Terminal 1 — Backend Express Server:
```bash
cd server
npm install
npm run dev
```
*Backend will start on:* **`http://localhost:8000`**  
*(Note: Auto-seeding runs on first startup to initialize the 3 demo role accounts)*

#### Terminal 2 — Frontend React Client:
```bash
cd client
npm install
npm run dev
```
*Frontend will start on:* **`http://localhost:5173`**

---

## 🔑 Pre-Seeded Demo Credentials

You can use the 1-Click login buttons on the homepage or sign in with these credentials:

| Role | Email | Password | Access Rights |
| :--- | :--- | :--- | :--- |
| **HR Administrator** | `hr@staffsync.com` | `password123` | Full workforce CRUD, org attendance, leave override, broadcasts, analytics |
| **Team Manager** | `manager@staffsync.com` | `password123` | Team leave approval, department attendance, training program creation |
| **Staff Employee** | `employee@staffsync.com` | `password123` | Clock-in/out, leave application with AI, announcements, assigned trainings |

---

## 🧪 Verification & Testing Commands

### Verify Backend Health
```bash
curl http://localhost:8000/
# Returns: "StaffSync HRM Backend Running..."
```

### Test Authentication
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"hr@staffsync.com","password":"password123"}'
```

### Build Frontend
```bash
cd client
npm run build
```

---

## 📁 Repository Directory Structure

```text
full stack/
├── client/                     # Frontend Single Page App (Vite + React)
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/           # Login.jsx, Register.jsx
│   │   │   ├── employee/       # Attendance.jsx, LeaveApply.jsx, LeaveList.jsx, Announcements.jsx, Profile.jsx, AssignedTrainings.jsx
│   │   │   ├── manager/        # LeaveApplications.jsx, TrainingManagement.jsx, TeamAttendance.jsx
│   │   │   ├── hr/             # EmployeeCRUD.jsx, AttendanceSummary.jsx, LeaveApplications.jsx, AnnouncementsManager.jsx, ReportsAnalytics.jsx
│   │   │   ├── Navbar.jsx      # Navigation bar with role badges & profile
│   │   │   ├── NotificationDropdown.jsx  # In-app real-time notification bell
│   │   │   └── Home.jsx        # Landing page with 1-click demo logins
│   │   ├── context/            # AuthContext.jsx
│   │   ├── routes/             # ProtectedRoute.jsx
│   │   ├── services/           # api.js (Axios with Bearer interceptors)
│   │   ├── App.jsx             # Main Router definition
│   │   ├── App.css             # Component animations
│   │   └── index.css           # Global design system & tokens
│   ├── vite.config.js          # Config with proxy to backend port 8000
│   └── package.json
│
├── server/                     # Backend REST API (Node.js + Express)
│   ├── config/
│   │   ├── db.js               # Mongoose database connector
│   │   └── seed.js             # Initial accounts & sample data seeder
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── employeeController.js
│   │   ├── attendanceController.js
│   │   ├── leaveController.js
│   │   ├── announcementController.js
│   │   ├── trainingController.js
│   │   ├── notificationController.js
│   │   └── aiController.js
│   ├── middleware/
│   │   └── authMiddleware.js   # JWT protect & role authorize
│   ├── models/
│   │   ├── User.js
│   │   ├── Employee.js
│   │   ├── Attendance.js
│   │   ├── Leave.js
│   │   ├── Announcement.js
│   │   ├── Training.js
│   │   └── Notification.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── employeeRoutes.js
│   │   ├── attendanceRoutes.js
│   │   ├── leaveRoutes.js
│   │   ├── announcementRoutes.js
│   │   ├── trainingRoutes.js
│   │   ├── notificationRoutes.js
│   │   └── aiRoutes.js
│   ├── server.js               # Express application entry point
│   ├── .env                    # Environment variables (PORT, MONGO_URI, JWT_SECRET, GEMINI_API_KEY)
│   └── package.json
└── README.md
```
