# Taskify Frontend

Responsive React frontend for a weekly task manager. It connects to the Express API for authentication, task CRUD, keyword search, filters, weekly summaries, and progress tracking.

## Features

- Registration, login, session restoration, and logout
- HttpOnly cookie authentication with CSRF-protected mutations
- Create, view, edit, complete, and delete task workflows
- Search task titles and descriptions
- Filter tasks by status and priority
- Monday-to-Sunday week navigation
- Weekly open/completed summaries and progress
- Desktop sidebar and mobile drawer navigation
- Responsive task forms, dialogs, empty states, skeletons, and notifications
- Optimistic status updates without screen flicker
- Unit, component, and browser smoke tests

## Technology

- React 18
- Vite 6
- React Router
- Axios
- Tailwind CSS
- Lucide React
- Vitest and React Testing Library
- Playwright

## Local setup

### Requirements

- Node.js 20 or newer
- npm
- The backend API running locally or available through a deployed HTTPS URL

### Install

```bash
npm install
```

### Configure the API URL

Copy `.env.example` to `.env.local`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

`VITE_API_BASE_URL` is included in the browser bundle, so it must never contain database credentials, JWT secrets, or other private values.

### Start development

```bash
npm run dev
```

Open `http://localhost:5173`.

The Vite development server also proxies relative `/api` requests to `http://localhost:5000`.

## Available commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Create the production bundle in `dist` |
| `npm run preview` | Preview the production build locally |
| `npm test` | Run the Vitest test suite once |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Generate test coverage |
| `npm run test:e2e` | Build and run Playwright browser tests |
| `npm run lint` | Run ESLint |
| `npm run format:check` | Check source formatting |
| `npm run check` | Run lint, tests, and production build |

## Routes

| Route | Access | Purpose |
| --- | --- | --- |
| `/` | Public | Welcome screen |
| `/login` | Signed-out users | Login form |
| `/register` | Signed-out users | Registration form |
| `/app` | Authenticated users | Task dashboard and all-tasks view |

The included `vercel.json` rewrites browser requests to `index.html`, allowing direct visits and refreshes on client-side routes such as `/login`, `/register`, and `/app`.

## Deploy to Vercel

### 1. Deploy the backend first

Confirm the deployed API health endpoint works:

```text
https://your-render-service.onrender.com/api/health
```

### 2. Import the frontend repository

1. Push this frontend directory to its own GitHub repository.
2. In Vercel, select **Add New**, then **Project**.
3. Import the frontend repository.
4. Vercel should detect the framework as **Vite**.

Use these build settings if Vercel does not detect them automatically:

| Setting | Value |
| --- | --- |
| Framework preset | `Vite` |
| Root directory | Repository root |
| Install command | `npm install` |
| Build command | `npm run build` |
| Output directory | `dist` |

### 3. Add the API environment variable

In **Project Settings**, open **Environment Variables**, then add:

```env
VITE_API_BASE_URL=https://your-render-service.onrender.com/api
```

Apply it to Production and Preview as needed. Vite reads this variable at build time, so redeploy after changing it.

### 4. Allow the Vercel origin in the backend

After Vercel assigns the production URL, update the backend's Render environment:

```env
CLIENT_URL=https://your-project.vercel.app
```

Use only the origin: include `https://`, but do not include `/api`, another path, or a trailing slash. Multiple allowed origins can be comma-separated:

```env
CLIENT_URL=http://localhost:5173,https://your-project.vercel.app
```

Save the Render environment change and let the backend redeploy.

### 5. Verify production

1. Open the Vercel production URL.
2. Refresh `/login`, `/register`, and `/app` to confirm SPA rewrites.
3. Register or log in.
4. Create, update, search, and delete a task.
5. Refresh the browser and confirm the session is restored.

## Deployment relationship

```text
Vercel frontend
  VITE_API_BASE_URL -> Render API /api

Render backend
  CLIENT_URL -> exact Vercel origin
  MONGO_URI  -> MongoDB Atlas
```

The frontend sends authenticated API requests with credentials enabled. The backend must therefore allow the exact frontend origin and must remain available over HTTPS.

## Project structure

```text
frontend/
|-- public/
|-- src/
|   |-- assets/
|   |-- components/
|   |-- context/
|   |-- hooks/
|   |-- pages/
|   |-- services/
|   |-- test/
|   `-- utils/
|-- e2e/
|-- .env.example
|-- vercel.json
|-- package.json
`-- vite.config.js
```

## Troubleshooting

- **Vercel route returns 404:** confirm `vercel.json` is at the repository root and redeploy.
- **CORS error:** set Render's `CLIENT_URL` to the exact Vercel production origin.
- **API requests use the wrong server:** update `VITE_API_BASE_URL` in Vercel and redeploy.
- **Login does not persist:** confirm both sites use HTTPS and the frontend is sending credentials.
- **Backend responds slowly after inactivity:** the first request can take longer when a free backend instance resumes.
