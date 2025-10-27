
# Auirah — Build Instructions for Codex

**Owner:** Sean Blake  
**Target deploy:** `https://seanblake.info/auriah/`  
**Goal:** Build a Google‑style search homepage called **Auirah** with a modern, responsive UI and a Node/Express + MySQL backend. Match the provided reference layout *exactly* while implementing working search, suggestions, voice input, “I’m Feeling Inspired,” quick‑app links, and six associated pages.

---

## 1) Reference Layout (match visually)
Use the uploaded reference file **`auirah_google_style_home_page_single_file.html`**. Your React/Chakra markup may differ, but **spacing, alignment, and composition must visually match** the reference.

---

## 2) Tech Stack
- **Frontend:** React (Create React App — **not** Vite), Chakra UI, React Router v6, react-icons (no emoji).  
- **Backend:** Node.js (Express), MySQL, Multer (photo uploads).  
- **Database:** MySQL 8+ (schema below).

> Note: “Chakra UI for the backend” in the original request means UI toolkit usage is on the **frontend**; backend is Express.

---

## 3) Branding & Theming
- Logo text **Auirah** with per-letter colors:
  - **A** = pink, **u** = aqua, **i** = light blue, **r** = hot pink, **a** = yellow, **h** = purple.
- Default theme: **light** on first load. Provide a **light/dark** toggle (Chakra color mode) persisted in `localStorage`.
- **Icons only** (react-icons); do **not** use emoji.

---

## 4) Features & UX
### Home
- Central **search bar** with:
  - **Typeahead suggestions** (from backend).
  - **Voice input** via Web Speech API (gracefully no-op if unsupported).
  - Keyboard shortcut **`/`** focuses the input.
  - Buttons: **“Auirah Search”** and **“I’m Feeling Inspired.”**
- **Inspired** button: pick a random prompt from DB (fallback list if DB empty) and navigate to `/search?q=...`.
- **Quick‑app links:** **Tasks, Notes, Music, Photos, Learn, Maps**.
- **Responsive** for mobile → desktop; match the reference’s spacing and flow.

### Routing
- `/` (Home) — search + suggestions + Inspired + quick apps.
- `/search` — unified results for Tasks/Notes/Music/Photos/Learn/Places.
- `/tasks`, `/notes`, `/music`, `/photos`, `/learn`, `/maps` — each shows a list and a simple create form (CRUD where applicable).  
  - **Photos** supports image upload + caption; responsive grid.

### Search Behavior
- Enter or click search icon routes to `/search?q=...`.
- `/api/suggestions?q=` returns short list of strings.
- `/api/search?q=` returns grouped results `{ tasks, notes, music, photos, learn, places }`.

---

## 5) Accessibility (WCAG 2.1 AA)
Implement stricter a11y and the WAI‑ARIA **combobox** pattern:

- **Landmarks & navigation**
  - Use `<header>`, `<main>`, `<footer>`.
  - Provide a visible **Skip to content** link.
- **Search combobox pattern**
  - Combobox wrapper: `role="combobox"`, `aria-expanded`, `aria-controls` → listbox id.
  - Suggestions container: `role="listbox"`.
  - Items: `role="option"`, manage active option via `aria-activedescendant` on input.
  - Arrow keys move active option; `Enter` selects; `Escape` closes.
- **Keyboard/focus**
  - All controls tabbable; visible focus ring; `/` focuses input without hijacking other fields.
- **Live regions**
  - `aria-live="polite"` to announce suggestion counts and voice result text.
- **Contrast/motion**
  - Text contrast: ≥ 4.5:1 (normal), ≥ 3:1 (large) in both themes.
  - Respect `prefers-reduced-motion`: turn off non-essential animations.
- **Images/links**
  - Provide meaningful `alt` text (Photos: use caption or filename).
  - External links use `target="_blank" rel="noopener noreferrer"`.
- **Chakra**
  - Use `VisuallyHidden` for icon-only controls; clear accessible names for toggle buttons.

---

## 6) Backend API (Express)
- `GET /api/health` → `{ ok: true }`
- **Suggestions & Search**
  - `GET /api/suggestions?q=` → `[string]`
  - `GET /api/search?q=` → `{ tasks, notes, music, photos, learn, places }`
- **CRUD**
  - `GET|POST|PUT|DELETE /api/tasks`
  - `GET|POST|PUT|DELETE /api/notes`
  - `GET|POST|PUT|DELETE /api/music`
  - `GET|POST|DELETE /api/photos` (POST uses `multipart/form-data` with file `photo`)
  - `GET|POST|PUT|DELETE /api/learn`
  - `GET|POST|PUT|DELETE /api/places`
- Serve uploaded photos statically at `/uploads/photos/*`.

---

## 7) Database Schema (MySQL 8+)
Create tables (include timestamps):

```sql
CREATE TABLE tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status ENUM('todo','in_progress','done') DEFAULT 'todo',
  due_date DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  body MEDIUMTEXT,
  tags VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE music_links (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  url VARCHAR(512) NOT NULL,
  platform VARCHAR(64) DEFAULT 'youtube',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE photos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  url VARCHAR(512) NOT NULL,
  caption VARCHAR(255),
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE learn_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  url VARCHAR(512) NOT NULL,
  category VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE places (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address VARCHAR(255),
  lat DECIMAL(10,7),
  lng DECIMAL(10,7),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE inspired_prompts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  text VARCHAR(255) UNIQUE
);
```
Seed several `inspired_prompts` rows.

---

## 8) Frontend Configuration (CRA)
- `package.json` must include: `"homepage": "/auriah"` for correct asset paths on the target domain.
- Router must use: `<BrowserRouter basename={process.env.PUBLIC_URL}>`.
- Include `.htaccess` under the deployed directory to serve `index.html` for deep links:
  ```apache
  RewriteEngine On
  RewriteBase /auriah/
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /auriah/index.html [L]
  ```
- In development, either:
  - Use CRA proxy (`"proxy": "http://localhost:4000"`) and `REACT_APP_API_BASE=/api`, or
  - Set `REACT_APP_API_BASE=http://localhost:4000/api`.

---

## 9) Automated A11y & CI (must pass)
### Dev Dependencies
Add to `frontend`:
- `eslint`, `eslint-plugin-react`, `eslint-plugin-jsx-a11y`
- `@axe-core/cli` or `@axe-core/playwright` + `@playwright/test`
- `pa11y-ci`
- `lighthouse-ci`
- `serve`, `wait-on`

### Scripts (frontend `package.json`)
```jsonc
{
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "start:ci": "npx serve -s build -l 3000",

    "lint": "eslint src --ext .js,.jsx",

    "test:a11y:pa11y": "pa11y-ci --config pa11yci.json",
    "test:a11y:axe": "axe http://localhost:3000 --timeout 60000 --exit 2",
    "test:lighthouse": "lhci autorun",

    "test:e2e": "playwright test",
    "test:e2e:report": "playwright show-report",

    "ci:dev:a11y": "npm start & npx wait-on http://localhost:3000 && npm run test:a11y:pa11y && npm run test:a11y:axe",
    "ci:full": "npm run build && (npm run test:lighthouse || true) && npm run test:e2e"
  }
}
```

### `pa11yci.json`
```json
{
  "defaults": {
    "standard": "WCAG2AA",
    "wait": 1000,
    "timeout": 60000,
    "runners": ["axe"],
    "chromeLaunchConfig": { "args": ["--no-sandbox", "--disable-dev-shm-usage"] },
    "viewport": { "width": 1366, "height": 900 }
  },
  "urls": [
    "http://localhost:3000/",
    "http://localhost:3000/search?q=test",
    "http://localhost:3000/tasks",
    "http://localhost:3000/notes",
    "http://localhost:3000/music",
    "http://localhost:3000/photos",
    "http://localhost:3000/learn",
    "http://localhost:3000/maps"
  ]
}
```

### `lighthouserc.json`
```json
{
  "ci": {
    "collect": {
      "startServerCommand": "npm run start:ci",
      "url": ["http://localhost:3000/", "http://localhost:3000/search?q=test"],
      "numberOfRuns": 1
    },
    "assert": {
      "assertions": {
        "categories:accessibility": ["error", { "minScore": 0.95 }],
        "categories:best-practices": ["warn", { "minScore": 0.90 }],
        "categories:performance": ["warn", { "minScore": 0.75 }]
      }
    },
    "upload": { "target": "temporary-public-storage" }
  }
}
```

### Playwright + axe
`playwright.config.js`
```js
const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  timeout: 60000,
  use: { baseURL: 'http://localhost:3000', viewport: { width: 1366, height: 900 } },
  webServer: {
    command: 'npm start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000
  },
  reporter: [['list']]
});
```

`tests/a11y.e2e.spec.js`
```js
const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

async function assertNoSeriousViolations(page, context = 'page') {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze();
  const issues = results.violations.filter(v => ['serious', 'critical'].includes(v.impact));
  if (issues.length) console.log(`Axe ${context} violations:`, JSON.stringify(issues, null, 2));
  expect(issues, `Axe ${context} has serious/critical violations`).toHaveLength(0);
}

test.describe('Auirah a11y', () => {
  test('Home: landmarks, skip link, combobox semantics, axe clean', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('a[href*=\"#\"]')).toBeVisible();
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();
    const input = page.locator('input[placeholder*=\"Search Auirah\"]');
    await expect(input).toBeVisible();
    await page.keyboard.press('/');     // focus shortcut
    await expect(input).toBeFocused();
    await input.type('te');             // trigger suggestions
    await expect(page.locator('[role=\"listbox\"]').first()).toBeVisible({ timeout: 3000 });
    await page.keyboard.press('ArrowDown');
    await assertNoSeriousViolations(page, 'home');
  });

  for (const route of ['search?q=test','tasks','notes','music','photos','learn','maps']) {
    test(`/${route}: no serious axe violations`, async ({ page }) => {
      await page.goto('/' + route);
      await assertNoSeriousViolations(page, `/${route}`);
    });
  }
});
```

### GitHub Actions (optional, recommended)
`.github/workflows/ci.yml` (excerpt)
```yaml
name: Auirah CI

on:
  pull_request:
    branches: [ main ]
  push:
    branches: [ main ]

jobs:
  frontend:
    runs-on: ubuntu-latest
    defaults: { run: { working-directory: frontend } }
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 18, cache: 'npm' }

      - name: Install deps
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Dev server (bg)
        run: |
          npm start &
          npx wait-on http://localhost:3000

      - name: A11y (Pa11y)
        run: npm run test:a11y:pa11y

      - name: A11y (Axe CLI)
        run: npm run test:a11y:axe

      - name: Build
        run: npm run build

      - name: Lighthouse CI
        run: npm run test:lighthouse

      - name: Playwright + axe
        run: npx playwright install --with-deps && npm run test:e2e

      - name: Upload build
        uses: actions/upload-artifact@v4
        with: { name: auriah-build, path: build }

  backend-smoke:
    runs-on: ubuntu-latest
    defaults: { run: { working-directory: backend } }
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 18, cache: 'npm' }
      - name: Install backend deps
        run: npm ci
      - name: Smoke test
        run: node -e "console.log('Backend compiles');"
```

---

## 10) Deployment
- Upload `frontend/build/*` to `public_html/auriah/` on the target host.
- Keep the `.htaccess` above so SPA routes resolve.
- Ensure backend is reachable and set `REACT_APP_API_BASE` accordingly.  
  - In development: CRA proxy to `http://localhost:4000`.  
  - In production: point to your deployed backend base (e.g., `/auriah-api` or a subdomain).

---

## 11) Acceptance Criteria
- Home **visually matches** the reference; logo colors per letter.
- `/` focuses the search input; voice button works (supported browsers).
- Suggestions use **proper ARIA combobox** semantics and keyboard control.
- **A11y thresholds pass in CI**:
  - **Lighthouse Accessibility ≥ 95**
  - **axe**: 0 **serious/critical** violations on key routes
  - **Pa11y**: WCAG2AA passes on key routes
- Contrast and focus visibility verified for both themes.
- Quick‑app pages function (list + create) and are keyboard accessible.
- Photo upload works; images display with correct `alt`.
- Mobile and desktop layouts match reference spacing/flow.

---

## 12) Deliverables
1. **Complete codebase**: `frontend/`, `backend/`, `sql/schema.sql` (+ seeds for `inspired_prompts`).  
2. **Configs**: `pa11yci.json`, `lighthouserc.json`, `playwright.config.js`, `tests/a11y.e2e.spec.js`, `.github/workflows/ci.yml`.  
3. **Production build** in `frontend/build/` ready to upload to `/public_html/auriah/`.  
4. **README** with run/build/deploy steps and environment variables.

---

### Notes
- Use Chakra’s `VisuallyHidden` for icon-only buttons (theme toggle, voice, search).
- For CRA under Node 20+ builds, use `NODE_OPTIONS=--openssl-legacy-provider` or Node 18 LTS.
