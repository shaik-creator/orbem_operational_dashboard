# Operations Performance Dashboard

Operations Performance Dashboard is a full-stack web application for ORBEM Solutions Private Limited, an air cargo and logistics company. It manages cargo bookings, shipment tracking, pending documents, delayed shipments, revenue, customer business, staff ownership, alerts, reports, and assistant support.

## Features

- JWT authentication with role-aware protected routes
- Booking CRUD with chargeable weight calculation
- Shipment timeline and status updates
- Document checklist with pending, received, verified, and rejected states
- Revenue and payment tracking with overdue balances
- Internal airline rate manager with CSV import/export and cheapest route comparison
- Dashboard KPIs, charts, filters, and operational tables
- ORBEM Ops Assistant using internal data, one Grok API key, and rule-based fallback
- In-app notifications with cron/manual alert checks
- CSV reports and printable dashboard/report views
- WhatsApp-style settings page for account, profile, privacy, notifications, appearance, assistant, data, reports, security, support, and project information
- User-specific settings persistence with support-ticket submission
- Dashboard quick actions, today operations panel, compact activity timeline, and richer KPI/chart layout
- Customer 360 pages, staff task board, and calendar/deadlines view
- Smart alert center actions for viewing bookings, marking read, assigning tasks, and dismissing alerts
- Activity logging for booking, shipment, document, payment, alert, task, customer, and assistant events

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, React Router, Axios, Recharts, Lucide React
- Backend: Node.js, Express, MySQL, JWT, bcryptjs, CORS, dotenv, node-cron, Nodemailer, Axios
- Database: MySQL
- Optional AI: Grok API key on the backend

## Presentation Setup

1. Start MySQL and import `backend/database/schema.sql`, then `backend/database/seed.sql`.
2. Copy `backend/.env.example` to `backend/.env` and set the real DB password. Keep `GROK_API_KEY` only in the backend `.env`; the frontend must not contain the Grok key.
3. Copy `frontend/.env.example` to `frontend/.env` and keep `VITE_API_BASE_URL=http://localhost:5000`.
4. Start the backend with `cd backend && npm run dev`.
5. Start the frontend with `cd frontend && npm run dev`.
6. Check `http://localhost:5000/api/health` and `http://localhost:5000/api/health/db`.

Demo login:

- `admin@orbem.local` / `password`
- `ops@orbem.local` / `password`
- `accounts@orbem.local` / `password`

Uploads are stored in `backend/uploads` and saved in MySQL through the `uploaded_files` table. Document uploads also update the matching `documents.file_id` and `documents.file_path` fields.

The ORBEM assistant uses dashboard/database context from MySQL. If `GROK_API_KEY` is present, the backend calls Grok through `https://api.x.ai/v1/chat/completions`; if the key is missing or Grok fails, the assistant returns a local database answer with a simple local-mode notice.

## Folder Structure

```
📦 my 4th term project/
├── 📄 package.json
├── 📄 README.md
├── 📄 backend-dev.err
├── 📄 frontend-dev.err
│
├── 📁 backend/
│   ├── 📄 package.json
│   ├── 📄 package-lock.json
│   ├── 📄 .env
│   ├── 📄 .env.example
│   ├── 📄 server.js
│   │
│   ├── 📁 src/
│   │   ├── 📁 config/
│   │   │   └── db.js
│   │   │
│   │   ├── 📁 controllers/
│   │   │   ├── activityController.js
│   │   │   ├── assistantController.js
│   │   │   ├── authController.js
│   │   │   ├── bookingController.js
│   │   │   ├── calendarController.js
│   │   │   ├── customerController.js
│   │   │   ├── dashboardController.js
│   │   │   ├── documentController.js
│   │   │   ├── notificationController.js
│   │   │   ├── paymentController.js
│   │   │   ├── rateController.js
│   │   │   ├── reportController.js
│   │   │   ├── settingsController.js
│   │   │   ├── supportController.js
│   │   │   └── taskController.js
│   │   │
│   │   ├── 📁 middleware/
│   │   │   ├── authMiddleware.js
│   │   │   ├── errorMiddleware.js
│   │   │   └── roleMiddleware.js
│   │   │
│   │   ├── 📁 routes/
│   │   │   ├── activityRoutes.js
│   │   │   ├── assistantRoutes.js
│   │   │   ├── authRoutes.js
│   │   │   ├── bookingRoutes.js
│   │   │   ├── calendarRoutes.js
│   │   │   ├── customerRoutes.js
│   │   │   ├── dashboardRoutes.js
│   │   │   ├── documentRoutes.js
│   │   │   ├── notificationRoutes.js
│   │   │   ├── paymentRoutes.js
│   │   │   ├── rateRoutes.js
│   │   │   ├── reportRoutes.js
│   │   │   ├── settingsRoutes.js
│   │   │   ├── supportRoutes.js
│   │   │   └── taskRoutes.js
│   │   │
│   │   ├── 📁 services/
│   │   │   ├── activityService.js
│   │   │   ├── aiService.js
│   │   │   ├── alertService.js
│   │   │   └── dashboardSummaryService.js
│   │   │
│   │   ├── 📁 utils/
│   │   │   ├── chargeableWeight.js
│   │   │   ├── csvExport.js
│   │   │   └── validators.js
│   │   │
│   │   └── 📁 database/
│   │       ├── schema.sql
│   │       ├── seed.sql
│   │       ├── settings-migration.sql
│   │       └── feature-upgrades-migration.sql
│   │
│   └── 📁 docs/
│       └── (Database documentation)
│
├── 📁 frontend/
│   ├── 📄 package.json
│   ├── 📄 package-lock.json
│   ├── 📄 .env
│   ├── 📄 .env.example
│   ├── 📄 index.html
│   ├── 📄 tailwind.config.js
│   ├── 📄 vite.config.js
│   ├── 📄 postcss.config.js
│   │
│   ├── 📁 src/
│   │   ├── 📄 main.jsx
│   │   ├── 📄 App.jsx
│   │   ├── 📄 index.css
│   │   │
│   │   ├── 📁 components/
│   │   │   ├── 📁 assistant/
│   │   │   │   ├── ChatbotButton.jsx
│   │   │   │   ├── ChatbotPanel.jsx
│   │   │   │   └── ChatMessage.jsx
│   │   │   │
│   │   │   ├── 📁 bookings/
│   │   │   │   ├── BookingDetails.jsx
│   │   │   │   ├── BookingForm.jsx
│   │   │   │   ├── BookingTable.jsx
│   │   │   │   └── StatusBadge.jsx
│   │   │   │
│   │   │   ├── 📁 common/
│   │   │   │   ├── Breadcrumbs.jsx
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── ConfirmModal.jsx
│   │   │   │   ├── EmptyState.jsx
│   │   │   │   ├── ErrorState.jsx
│   │   │   │   ├── Input.jsx
│   │   │   │   ├── LoadingState.jsx
│   │   │   │   ├── MiniSparkline.jsx
│   │   │   │   ├── Modal.jsx
│   │   │   │   ├── PageHeader.jsx
│   │   │   │   ├── PriorityBadge.jsx
│   │   │   │   ├── SearchFilterBar.jsx
│   │   │   │   ├── Select.jsx
│   │   │   │   ├── SummaryCard.jsx
│   │   │   │   └── Toast.jsx
│   │   │   │
│   │   │   ├── 📁 dashboard/
│   │   │   │   ├── CustomerBusinessChart.jsx
│   │   │   │   ├── DelayedTrendChart.jsx
│   │   │   │   ├── KPICard.jsx
│   │   │   │   ├── RevenueChart.jsx
│   │   │   │   └── StatusPieChart.jsx
│   │   │   │
│   │   │   ├── 📁 documents/
│   │   │   │   └── DocumentChecklist.jsx
│   │   │   │
│   │   │   ├── 📁 layout/
│   │   │   │   ├── ProtectedRoute.jsx
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   └── Topbar.jsx
│   │   │   │
│   │   │   ├── 📁 payments/
│   │   │   │   └── PaymentPanel.jsx
│   │   │   │
│   │   │   └── 📁 settings/
│   │   │       ├── AboutProjectSettings.jsx
│   │   │       ├── AccountSettings.jsx
│   │   │       ├── AppearanceSettings.jsx
│   │   │       ├── AssistantSettings.jsx
│   │   │       ├── DataStorageSettings.jsx
│   │   │       ├── HelpSupportSettings.jsx
│   │   │       ├── NotificationSettings.jsx
│   │   │       ├── PrivacySettings.jsx
│   │   │       ├── ProfileQuickSettings.jsx
│   │   │       ├── ReportSettings.jsx
│   │   │       ├── SecuritySettings.jsx
│   │   │       ├── SettingsLayout.jsx
│   │   │       ├── SettingsMenu.jsx
│   │   │       ├── SettingsProfileCard.jsx
│   │   │       ├── SettingsRow.jsx
│   │   │       └── ToggleSwitch.jsx
│   │   │
│   │   ├── 📁 pages/
│   │   │   ├── AirlineRates.jsx
│   │   │   ├── Assistant.jsx
│   │   │   ├── BookingCreate.jsx
│   │   │   ├── BookingDetailPage.jsx
│   │   │   ├── Bookings.jsx
│   │   │   ├── Calendar.jsx
│   │   │   ├── CustomerDetail.jsx
│   │   │   ├── Customers.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Documents.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Notifications.jsx
│   │   │   ├── Payments.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Reports.jsx
│   │   │   ├── Settings.jsx
│   │   │   └── Tasks.jsx
│   │   │
│   │   ├── 📁 services/
│   │   │   ├── api.js
│   │   │   ├── assistantService.js
│   │   │   ├── authService.js
│   │   │   ├── bookingService.js
│   │   │   ├── settingsService.js
│   │   │   └── supportService.js
│   │   │
│   │   └── 📁 utils/
│   │       └── formatters.js
│   │
│   ├── 📁 dist/
│   │   └── (Build output)
│   │
│   └── 📁 node_modules/
│       └── (Dependencies)
│
├── 📁 docs/
│   ├── 📄 api-docs.md
│   ├── 📄 deployment-guide.md
│   ├── 📄 postman-collection.json
│   └── 📄 test-cases.md
│
└── 📁 node_modules/
    └── (Root dependencies)
```

### Directory Descriptions

**backend/**
- `src/config/` - Database connection configuration
- `src/controllers/` - API request handlers for all routes
- `src/middleware/` - Authentication, role-based access, and error handling middleware
- `src/routes/` - Express route definitions for all modules
- `src/services/` - Business logic for AI assistant, alerts, activity logging, and dashboard summaries
- `src/utils/` - Shared utilities: validators, CSV export, chargeable weight calculation
- `src/database/` - SQL schema, seed data, and migration scripts

**frontend/**
- `src/components/` - Reusable UI components organized by feature (assistant, bookings, dashboard, etc.)
- `src/pages/` - Full-page components corresponding to routes
- `src/services/` - API client and service modules
- `src/utils/` - Utility functions and formatters
- `dist/` - Build output for production deployment

**docs/**
- API documentation and setup guides
- Postman collection for API testing
- Test case documentation

## Database Setup

1. Create a MySQL database by importing:
   ```sql
   backend/src/database/schema.sql
   ```
2. Import demo data:
   ```sql
   backend/src/database/seed.sql
   ```
3. For existing databases, run the settings migration:
   ```bash
   mysql -u root -p operations_dashboard < backend/src/database/settings-migration.sql
   ```
   This creates `user_settings`, `support_tickets`, and adds `last_login_at`, `password_updated_at`, and `status_message` to `users`.
4. Run the feature upgrade migration:
   ```bash
   mysql -u root -p operations_dashboard < backend/src/database/feature-upgrades-migration.sql
   ```
   This creates `activity_logs`, `tasks`, `calendar_events`, and ensures `support_tickets` exists.
5. Demo users all use password `password`.

Demo logins:

- `admin@orbem.local`
- `ops@orbem.local`
- `docs@orbem.local`
- `warehouse@orbem.local`
- `accounts@orbem.local`

## Backend Setup

```bash
cd backend
npm install
copy .env.example .env
npm run dev
```

Update `backend/.env` with your MySQL credentials, a stronger `JWT_SECRET`, and your Grok key.

For submission, the only AI key needed is:

```env
GROK_API_KEY=your_xai_key_here
GROK_MODEL=grok-4.3
```

Do not paste the real key into `.env.example`, README, or any tracked file. Keep it only in `backend/.env`, which is ignored by Git.

## Frontend Setup

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

Set the frontend backend URL without `/api`:

```env
VITE_API_BASE_URL=http://localhost:5000
```

Frontend runs on `http://localhost:5173`. Backend runs on `http://localhost:5000`.

## Deployment

Use the free deployment split below:

1. Create a free MySQL service on Aiven.
2. Import `backend/database/schema.sql`, then `backend/database/seed.sql` into the Aiven database.
3. Deploy the backend on Render as a Web Service with root directory `backend`.
4. Set Render environment variables:

```env
PORT=5000
NODE_ENV=production
CORS_ORIGIN=https://your-frontend-name.vercel.app
DB_HOST=your-aiven-mysql-host
DB_PORT=3306
DB_USER=your-aiven-user
DB_PASSWORD=your-aiven-password
DB_NAME=your-aiven-database
DB_SSL=true
JWT_SECRET=use_a_strong_secret
GROK_API_KEY=your_xai_key_here
GROK_MODEL=grok-4.3
```

5. On Render, use build command `npm install` and start command `npm start`.
6. Test the backend after deploy:

```env
https://your-backend-name.onrender.com/api/health
https://your-backend-name.onrender.com/api/health/db
```

7. Deploy the frontend on Vercel from the repository root. The root `vercel.json` builds only the React/Vite app in `frontend`.
8. In Vercel Project Settings, add:

```env
VITE_API_BASE_URL=https://your-backend-name.onrender.com
```

9. After Vercel gives you the frontend URL, update Render `CORS_ORIGIN` to that Vercel URL and redeploy the backend. If you need more than one allowed frontend origin, separate them with commas.
10. Test the live app: login, add a booking, update revenue, and upload a file.

Do not use localhost in production. Do not deploy the Express backend inside Vercel. If Vercel shows a Services/Beta multi-service setup, change the project framework away from Services and redeploy from this repository config.

## Grok Assistant

Set one Grok/xAI key only on the backend:

```env
GROK_API_KEY=your_xai_key_here
GROK_MODEL=grok-4.3
```

The backend calls the xAI chat completions API from `backend/src/services/aiService.js`. The frontend never receives the key. If `GROK_API_KEY` is missing or the request fails, the assistant uses the local rule-based fallback so the demo still runs.

After adding or changing `GROK_API_KEY`, restart the backend:

```bash
npm run dev --prefix backend
```

Check provider status inside the app from Settings, or call:

```text
GET http://localhost:5000/api/settings/ai-status
```

## API Testing

Import [docs/postman-collection.json](docs/postman-collection.json) into Postman.

1. Run `POST /api/auth/login`.
2. Copy the returned token into the `token` collection variable.
3. Run protected requests.

## Settings Page

The settings page is available at `/settings` after login. It includes:

- Account and profile quick settings with avatar, display name, phone, department, designation, bio, and status message
- Privacy and notification toggles saved to `user_settings`
- Appearance preferences saved to the backend and `localStorage`, applied live without refresh
- AI assistant provider status from `GET /api/settings/ai-status` without exposing API keys
- Data/storage actions for cache, chatbot local history, account data download, and report CSV exports
- Reports defaults, security summary, logout from current device, help/support forms, and about-project metadata

Settings API endpoints:

- `GET /api/settings`
- `PUT /api/settings`
- `PUT /api/settings/:key`
- `DELETE /api/settings/:key`
- `PUT /api/settings/profile`
- `GET /api/settings/ai-status`
- `GET /api/settings/security-summary`

Support API endpoints:

- `POST /api/support/tickets`
- `GET /api/support/tickets` for Admin / Owner
- `PUT /api/support/tickets/:id/status` for Admin / Owner

## Feature Upgrade APIs

Dashboard and activity:

- `GET /api/dashboard/today`
- `GET /api/activity/recent`

Customers:

- `GET /api/customers`
- `GET /api/customers/:id`
- `POST /api/customers`
- `PUT /api/customers/:id`
- `DELETE /api/customers/:id`

Tasks:

- `GET /api/tasks`
- `POST /api/tasks`
- `PUT /api/tasks/:id`
- `DELETE /api/tasks/:id`
- `PUT /api/tasks/:id/status`

Calendar and timelines:

- `GET /api/calendar/events`
- `GET /api/bookings/:id/timeline`
- `POST /api/bookings/:id/timeline`

Notifications:

- `PUT /api/notifications/:id/dismiss`
- `POST /api/notifications/:id/assign-task`

To test settings:

1. Login with a seeded user.
2. Open `/settings`.
3. Toggle a privacy or notification setting and refresh the page.
4. Change appearance theme/accent and confirm the UI updates immediately.
5. Submit a support ticket from Help & Support.
6. Export a CSV from Data & Storage.

## Common Errors

- `ECONNREFUSED MySQL`: check MySQL is running and `.env` database credentials are correct.
- `ER_NO_SUCH_TABLE user_settings` or `support_tickets`: run `backend/src/database/settings-migration.sql`.
- `ER_NO_SUCH_TABLE activity_logs`, `tasks`, or `calendar_events`: run `backend/src/database/feature-upgrades-migration.sql`.
- `Unknown column status_message`: run the settings migration against the active database.
- `Invalid email or password`: confirm seed data was imported and use password `password`.
- `CORS error`: confirm `CORS_ORIGIN=http://localhost:5173` in backend `.env`.
- `Grok assistant request failed`: confirm `GROK_API_KEY` is set in `backend/.env`, then restart the backend.
