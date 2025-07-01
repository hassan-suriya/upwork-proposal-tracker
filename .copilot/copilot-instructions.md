# File: PRD_UpworkProposalTracker.md

# Product Requirements Document

## Project Title
Upwork Proposal Tracker Web App

## Purpose
A web-based app to:
- Record and track all proposals sent by the freelancer
- Enable Yoodule to view proposal activity and weekly progress
- Maintain transparent reporting and success metrics

## Tech Stack
- Frontend: Next.js
- Backend: Node.js API routes in Next.js
- Database: MongoDB Atlas
- Styling: Tailwind CSS + shadcn/ui
- Authentication: JWT tokens
- Deployment: Vercel

## User Roles
### Freelancer (You)
- Add, edit, and delete proposals
- View dashboard, trends, and export data

### Viewer (Yoodule)
- View proposals and dashboard
- No ability to edit or delete records

## Core Features

### 1) Proposal Management
**Freelancer Capabilities:**
- Add Proposal:
  - Date
  - Job Link
  - Status
  - Price
  - Notes
- Edit or delete proposals
**Viewer Capabilities:**
- View proposals
- No edits or deletions

---

### 2) Dashboard
Visible to both Freelancer and Viewer:
- **Weekly Progress:**
  - Total proposals this week
  - Target progress bar (e.g., 20/25 proposals)
  - Daily bar chart
- **Status Breakdown:**
  - Pie chart: Applied / Viewed / Interviewed / Hired
- **Success Rates:**
  - % Viewed
  - % Interviewed
  - % Hired
- **4-Week History:**
  - Weekly totals chart
- **Recent Activity:**
  - List of last 10 proposals
- **Export:**
  - CSV export of all proposals

---

### 3) Filtering and Search
- Date range filters
- Status filter
- Price filter
- Keyword search in notes and job links

---

### 5) Authentication
- Secure login for Freelancer and Viewer
- JWT tokens
- Password reset flow
- Role-based permissions

---

### 6) Responsive Design
- Optimized for mobile and desktop
- Professional look and feel

---

## Optional Features (Phase 2)
- Dark Mode toggle
- Auto-fetch job titles via Upwork API

---

## Database Schema
**Proposals Collection:**
- `_id`
- `userId`
- `date`
- `jobLink`
- `status`
- `price`
- `notes`
- `createdAt`
- `updatedAt`

**Users Collection:**
- `_id`
- `email`
- `hashedPassword`
- `role` ("freelancer" or "viewer")
- `createdAt`
- `updatedAt`

---

## Acceptance Criteria
- Freelancer can log, edit, and delete proposals
- Viewer can view proposals and dashboards
- Weekly stats accurately calculated
- All filters and exports functional
