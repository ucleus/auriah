# Auirah

Auirah is a Google-style productivity hub that unifies tasks, notes, music links, photos, learning resources, and mapped places. The project ships as a full-stack app with a React/Chakra frontend (Create React App) and a Node/Express + MySQL backend.

## Prerequisites
- Node.js 18.x
- npm 10+
- MySQL 8+ (or compatible)

## Repository Structure
```
frontend/   React + Chakra UI single-page app
backend/    Express REST API, file uploads, MySQL helpers
sql/        Schema + seed data for MySQL tables
```

## Environment Variables
Create `backend/.env` based on `.env.example`:
```
PORT=4000
CLIENT_ORIGIN=http://localhost:3000
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=auriah
MYSQL_PASSWORD=secret
MYSQL_DATABASE=auriah
UPLOAD_DIR=uploads/photos
```

Optional frontend env: set `REACT_APP_API_BASE` (defaults to `/api`). Leave unset when using CRA proxy.

## Database Setup
```
mysql -u <user> -p < sql/schema.sql
```
This creates every required table and seeds inspired prompts.

## Backend
```
cd backend
npm install
npm run dev      # nodemon on http://localhost:4000
npm start        # production mode
```
The API exposes `/api/*` routes plus `/uploads/photos/*` for static files.

## Frontend
```
cd frontend
npm install
npm start        # CRA dev server on http://localhost:3000 (proxying to backend)
npm run lint     # ESLint (React + jsx-a11y)
npm test         # React Testing Library + Jest
npm run build    # Production build (outputs to frontend/build)
```
Additional tooling:
- `npm run test:a11y:pa11y`
- `npm run test:a11y:axe`
- `npm run test:e2e` (Playwright + axe)
- `npm run test:lighthouse`

## Deployment
1. Build the frontend: `cd frontend && npm run build`.
2. Upload `frontend/build/*` to your hosting path (`/public_html/auriah/`). Keep `public/.htaccess` for SPA routes.
3. Deploy the backend (Node 18) and point it at your MySQL instance. Ensure the uploads directory is writable and exposed at `/uploads/photos`.
4. Update `REACT_APP_API_BASE` (or the CRA proxy) so the frontend hits the deployed backend.

## Key Features
- Google-inspired home with branded lettermark, combobox search, keyboard shortcut (`/`), voice input (Web Speech API), and "I'm Feeling Inspired" prompts.
- RESTful CRUD for tasks, notes, music links, photos (with Multer uploads), learning resources, and places.
- Unified `/search` endpoint combining every resource, plus `/suggestions` for typeahead.
- Chakra UI light/dark themes with persistence, custom toast provider, accessible skip links, ARIA combobox semantics, quick-app launcher tiles, and responsive layouts.
- Automated accessibility & performance tooling (Pa11y, axe, Lighthouse, Playwright + axe) plus GitHub Actions workflow for CI.

## Testing Philosophy
- Run `npm test` (frontend) for unit/integration coverage.
- `npm run lint` keeps JSX and accessibility issues in check.
- Use the provided accessibility scripts before shipping UI changes.
- Backend routes are structured for easy extension; consider adding supertest coverage when the DB layer solidifies.

## Debugging Tips
- `frontend/src/services/api.js` centralizes API calls; change `REACT_APP_API_BASE` to point to staging/prod backends.
- The backend falls back to in-memory data when MySQL env vars are missing, which is useful for demos but be sure to configure real DB values before deploying.
- Photo uploads land in `backend/uploads/photos`; the repo tracks the directory via `.gitkeep` but not the assets themselves.
