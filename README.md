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
VITE_API_BASE_URL=https://task-manager-api-u7st.onrender.com/api
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

- **CORS error:** confirm the API allows the frontend origin.
- **API requests use the wrong server:** verify `VITE_API_BASE_URL` in the local environment.
- **Login does not persist:** confirm both sites use HTTPS and the frontend is sending credentials.
- **Backend responds slowly after inactivity:** the first request can take longer when a free backend instance resumes.
