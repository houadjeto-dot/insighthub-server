# Question 2: InsightHub — Academic Research and Capstone Repository

Hi Mr. Kimkpe. This is Adeline's Final Web Technologies project.

## Project Overview

InsightHub is a centralized digital platform for storing and exploring student research papers and capstone projects at Academic City University. Students can submit their projects for admin review, and once approved, all projects are publicly discoverable through search and filters. Logged-in users can bookmark projects, leave comments, and contact project authors.

---

## Deployment Links

| Service | URL |
|---------|-----|
| Frontend (GitHub Pages) | https://houadjeto-dot.github.io/insighthub-client |
| Backend (Render) | https://insighthub-server.onrender.com |

---

## Login Details

**Admin Account**
| Field | Value |
|-------|-------|
| Email | admin@academiccity.edu.gh |
| Password | ThisIsAdmin |

**Student Account** — register a new account from the registration page. No email domain restriction is enforced for testing purposes.

---

## Feature Checklist

### Requirement 1 — User Authentication & Project Submission (15 Marks)
- [x] Secure registration with bcrypt password hashing
- [x] JWT login stored in httpOnly cookie session
- [x] Submit project with: title, abstract/description, department, supervisor, year of completion
- [x] PDF file upload (stored server-side via multer)
- [x] External link field (alternative to file upload)
- [x] Optional video / demo link field
- [x] Technologies and keywords field
- [x] Submitted projects go to `pending` status awaiting admin review

### Requirement 2 — Project Discovery & Search (15 Marks)
- [x] All approved projects displayed as a browsable list
- [x] Each project preview shows: title, student name, short description
- [x] Search by keyword (matches title and abstract)
- [x] Filter by department
- [x] Filter by year of completion
- [x] Filter by technology / tags
- [x] Real-time filtering — results update as you type or change filters

### Requirement 3 — Project Details & Engagement (15 Marks)
- [x] Dedicated full-detail page for each project (`project.html?id=...`)
- [x] Displays: title, student name, department, supervisor, year, technologies, abstract, file/links
- [x] Bookmark / save projects (logged-in users only)
- [x] Contact author via email request button
- [x] Comments section — logged-in users can post comments on any project
- [x] Comments load dynamically from the database

### Requirement 4 — Admin Review & Approval System (15 Marks)
- [x] All submitted projects require admin review before going public
- [x] Admin dashboard shows pending, approved, and rejected projects separately
- [x] Admin can approve or reject any submission
- [x] Admin can edit project title and abstract before approving
- [x] Admin can delete / remove any project permanently
- [x] Only approved projects are visible to the public on the search page

---

## Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | HTML, CSS, JavaScript (Vanilla) |
| Backend | Node.js + Express.js |
| Database | PostgreSQL (hosted on Render) |
| Authentication | bcrypt + JSON Web Tokens (JWT) + httpOnly cookies |
| File Uploads | Multer |
| Deployment (Backend) | Render |
| Deployment (Frontend) | GitHub Pages |

---

## Installation Instructions (Running Locally)

### Prerequisites
- Node.js (v18 or higher) installed
- A PostgreSQL database (local or the Render hosted one)

### 1. Clone the repositories

```bash
git clone https://github.com/houadjeto-dot/insighthub-server.git
git clone https://github.com/houadjeto-dot/insighthub-client.git
```

### 2. Set up the backend

```bash
cd insighthub-server
npm install
```

Create a `.env` file in the `insighthub-server` folder:

```
DATABASE_URL=postgresql://insight_db_7za3_user:n8FVSzoF7X2YpGsmN7fw7pfITitbZJOJ@dpg-d7nn3a9kh4rs73ba5s5g-a.oregon-postgres.render.com/insight_db_7za3
```

Start the server:

```bash
node server.js
```

The server runs on `http://localhost:4040`. The database tables are created automatically on first start via `db.js`.

### 3. Set up the frontend

The frontend is plain HTML/CSS/JS — no build step needed. Open any of the HTML files directly in your browser, or use a local server such as VS Code Live Server.

> **Note:** When running locally, the `fetch()` calls in `script.js` and `project.js` point to the Render backend (`https://insighthub-server.onrender.com`). To test against your local server instead, change the `API` constant at the top of both files to `http://localhost:4040`.

### 4. Create an admin account

With the server running, open a browser and visit:

```
http://localhost:4040/setup-admin
```

This creates the admin account (`admin@academiccity.edu.gh` / `ThisIsAdmin`). Remove or comment out that route in `server.js` afterwards.

---
## Flow

Full program flow end to end: register → submit → login as admin → approve → logout → search and find the approved project → view details → comment → bookmark

### Navigation 
landing page (index) → search/submit → account (change to admin with logins or register as a student to go back to search/submit) → if at admin: approve/ reject/ edit → logout → student landing page 

## Project Structure

```
insighthub-server/
├── server.js          # All API routes (auth, projects, comments, bookmarks, admin)
├── db.js              # PostgreSQL connection + table creation
├── package.json
├── .env               # DATABASE_URL (not committed to GitHub)
└── uploads/           # Uploaded PDF files stored here

insighthub-client/
├── index.html         # Landing / home page
├── search.html        # Project discovery with search and filters
├── submission.html    # Project submission form
├── project.html       # Individual project detail page
├── script.js          # Main JS — fetch, search, submission, bookmarks
├── project.js         # Project detail page JS — load project, comments
├── auth/
│   ├── login.html
│   ├── registration.html
│   └── account.html
├── admin/
│   ├── dashboard.html # Admin panel — all projects with status
│   └── approval.html  # Review, edit, approve, reject, delete a project
└── assets/
    └── style.css      # Full site styling (glass and sand theme)
```
