# 🏠 PG Manager - Professional PG Management System

A high-performance, real-time management solution for PG (Paying Guest) owners and tenants. This system simplifies everything from room occupancy tracking and billing to tenant complaints and food menu management.

---

## 🚀 Key Features

### 👔 Owner/Admin Dashboard
*   **Analytics Hub**: Real-time stats on occupancy, revenue, and active complaints. Powered by **MongoDB Aggregation Pipelines**.
*   **Intelligent Room Map**: Interactive bed-wise occupancy tracking (Green = Available, Red = Occupied).
*   **Resident Lifecycle**: Unified resident management with automatic user account creation and deletion sync.
*   **Billing Engine**: Generate monthly bills, track payments (Paid/Pending), and manage extra charges.
*   **PDF Invoicing**: Automatic professional PDF rent bill generation for every transaction.
*   **Complaint Manager**: Centralized system to resolve tenant issues instantly.
*   **Universal Real-time Sync**: Instant updates across all dashboards for rooms, tenants, and bills via Socket.IO.
*   **Food Menu Control**: Manage weekly meal plans visible to all residents.
*   **Visitor Logs**: Digital tracking of guest entries/exits for security.

### 👤 Tenant Portal
*   **Personal Dashboard**: View stay details, room/bed info, and current rent status.
*   **Smart Due Dates**: Automatically calculates the next rent due date based on check-in day.
*   **Rent Portal**: Download PDF rent bills and view historical payment records.
*   **Live Food Menu**: Real-time view of daily breakfast, lunch, and dinner.
*   **Support & Complaints**: Raised tickets for maintenance and track resolution status.
*   **Notification Center**: Real-time alerts for bills, announcements, and news.

---

## ✨ Recent Enhancements

*   **Mobile-First UI/UX**: Completely redesigned responsive layout featuring a dynamic bottom navigation bar, smooth sliding hamburger menus, glassmorphism aesthetics, and `framer-motion` page transitions.
*   **Smart Rent Reminders**: Intelligent "Remind All" system that checks bill due dates to send targeted, urgency-based notifications (e.g., "OVERDUE" vs "Due Soon") simultaneously via WhatsApp and In-App alerts.
*   **Enhanced Search & Filtering**: Upgraded dashboard searches allowing dual-lookup by either Room Number or Resident Name seamlessly.
*   **Database Indexing**: Added strategic MongoDB indexes on high-frequency query fields (`phone`, `email`, `roomId`) to ensure rapid data retrieval even as the user base scales.
*   **Duplicate-Free Billing**: Enforced strict backend validation guards to guarantee only one bill per resident per month can ever be generated.

---

## 🛠 Tech Stack

### Frontend
- **Framework**: [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI Architecture**: [TailwindCSS](https://tailwindcss.com/) + [Shadcn/UI](https://ui.shadcn.com/)
- **State & Data**: [React Query](https://tanstack.com/query/latest) + [Zustand](https://github.com/pmndrs/zustand)
- **Networking**: [Axios](https://axios-http.com/) + [Socket.IO Client](https://socket.io/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)

### Backend
- **Runtime**: [Node.js](https://nodejs.org/) (Multi-core **Clustering** enabled)
- **Framework**: [Express.js](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) (ODM: [Mongoose](https://mongoosejs.com/))
- **Caching**: [Upstash Redis](https://upstash.com/) (Dashboard & Analytics)
- **Real-time**: [Socket.IO](https://socket.io/) (with Inter-Process Communication Bridge)
- **Security**: [JWT](https://jwt.io/) + [Bcrypt](https://github.com/kelektiv/node.bcrypt.js)
- **Monitoring**: [k6](https://k6.io/) (Load Testing & Performance metrics)

---

## 🏗 Project Structure

### Backend (`/Backend`)
The backend follows a **Modular Repository-Service-Controller** pattern for maximum scalability.
- `src/modules/`: Individual feature modules (auth, billing, room, tenant, etc.).
- `src/models/`: Mongoose schemas for Users, Rooms, Tenants, Bills, and Complaints.
- `src/middleware/`: Authentication, Authorization, Error Handling, and Logging (including Rate Limiting & Compression).
- `src/services/`: Core business logic (PDF generation, Email/SMS stubs).
- `src/repository/`: Data access layer for clean database operations.

### Frontend (`/Frontend`)
- `src/pages/`: Full-page components (Admin and Tenant views).
- `src/components/`: Reusable UI elements (Buttons, Badges, Modals).
- `src/store/`: Global state management for Auth and Notifications.
- `src/api/`: Axios instances (optimized with timeouts) and API call definitions.
- `src/hooks/`: Custom React hooks for shared logic.

---

## ⚡ Performance & Scalability
The system is built to handle **100+ concurrent users** with high efficiency:
1.  **Multi-core Clustering**: Automatically scales across all available CPU cores with a master-worker IPC bridge for real-time event relaying.
2.  **Redis Caching**: Dashboard analytics are cached for 60s, reducing DB load by ~90% and cutting latency from 1.5s to **50ms**.
3.  **MongoDB Aggregations**: Complex revenue and trend reports are calculated directly in the database engine for maximum speed.
4.  **Connection Resilience**: Implemented **Exponential Backoff** for database reconnections to survive network or DNS instability.
5.  **Response Compression**: Uses Gzip to shrink data-heavy payloads, improving mobile loading times.
6.  **Optimized Indexing**: Database-level indexing on primary search keys for O(1) retrieval.

---

## 📦 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- MongoDB (Running locally or on Atlas)

### 2. Installation
```bash
# Install Backend deps
cd Backend
npm install

# Install Frontend deps
cd ../Frontend
npm install
```

### 2. Configuration
Create a `.env` file in the `Backend` directory using `.env.example`:
```env
PORT=5001
MONGO_URI=your_mongo_uri
JWT_SECRET=your_secret
UPSTASH_REDIS_REST_URL=your_redis_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token
```

### 3. Running Locally
```bash
# Start Backend
cd Backend && npm run dev

# Start Frontend
cd ../Frontend && npm run dev
```

---

## 📝 License
Proprietary System - Developed for Professional PG Management.
