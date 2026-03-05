# 📬 TechReviewTool

> Angular 21 + Fastify monorepo — RSS aggregator with AI-powered content generation.

## 📋 Overview

TechReviewTool is a web application that helps developers and tech professionals stay on top of technology news. It aggregates articles from configurable RSS sources, filters them by topic and keywords, and uses AI to generate summaries, press reviews, and LinkedIn posts.

### Key Features

- ✅ **Multi-project workspace** — Organize your tech watch by theme (Cybersecurity, AI, Frontend...)
- ✅ **Configurable RSS sources** — Add/remove sources per project (global catalog, many-to-many)
- ✅ **Smart filtering** — Filter articles by keywords, time window (12h, 24h, 48h, 7d) and source
- ✅ **Article selection** — Select articles with checkboxes, select all, sticky selection bar (max 15)
- ✅ **AI-powered generation** — Select articles and generate:
  - Concise synthesis of key points
  - Structured press review
  - Optimized LinkedIn post
- ✅ **AI Strategy Pattern** — Pluggable AI providers (Mock, Mistral) via environment variable
- ✅ **Real AI integration** — Frontend calls backend API, DTO mapping, error handling with retry
- ✅ **Generation history** — Find, expand, copy and export past AI-generated content
- ✅ **Responsive design** — Mobile-first with adaptive desktop layout (sidebar + contextual navigation)
- ✅ **Tested** — 151 unit tests (Vitest) + 19 E2E tests (Playwright) across 3 browsers
- ✅ **Real RSS backend** — Fastify API fetching and parsing live RSS/Atom feeds
- ✅ **Security** — Helmet (CSP, HSTS), CORS, rate limiting, dependency auditing, Dependabot alerts
- ✅ **GDPR-compliant** — Data export (JSON), full erasure, AI transparency notice, local-first storage
- ✅ **Settings page** — Data management (export, delete all), privacy information

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| Angular | 21.2.0 (Active) | Frontend framework |
| Fastify | 5.x | Backend HTTP framework (TypeScript) |
| TypeScript | 5.8+ (client) / 5.9+ (api) | Type-safe JavaScript |
| Mistral AI API | mistral-small-latest | AI content generation (synthesis, press review, LinkedIn) |
| @rowanmanning/feed-parser | 2.x | RSS and Atom feed parser |
| @fastify/helmet | latest | HTTP security headers (CSP, HSTS, X-Frame-Options) |
| @fastify/cors | latest | Cross-Origin Resource Sharing configuration |
| @fastify/rate-limit | latest | API rate limiting (100 req/min per IP) |
| SCSS | — | Styling with variables, nesting, mixins |
| Tailwind CSS | 4.x | Utility-first CSS framework |
| Node.js | 22.22.0 (Maintenance LTS) | JavaScript runtime |
| npm | 10.9.4 (bundled) | Package manager + workspaces |
| Vitest | 4.x (bundled with Angular 21) | Unit testing framework |
| Playwright | latest | End-to-end testing (Chromium, Firefox, Mobile Chrome) |

## 📁 Project Structure

```
tech-review-tool/                      ← Monorepo root (npm workspaces)
├── client/                            ← Angular frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/
│   │   │   │   ├── components/
│   │   │   │   │   ├── bottom-nav/             # Contextual mobile nav (visible inside projects only)
│   │   │   │   │   ├── header/                 # App header (mobile only, hidden on desktop)
│   │   │   │   │   └── sidebar/                # Desktop sidebar (project list + contextual nav)
│   │   │   │   └── services/
│   │   │   │       ├── ai-api.service.ts       # Thin HTTP client for backend AI API
│   │   │   │       ├── rss-api.service.ts      # Thin HTTP client for backend RSS API
│   │   │   │       └── storage.helper.ts       # Generic localStorage helpers
│   │   │   ├── features/
│   │   │   │   ├── ai-actions/                 # AI content generation
│   │   │   │   │   ├── components/
│   │   │   │   │   │   ├── ai-action-panel/    # Bottom sheet: type selection + GDPR notice + generation
│   │   │   │   │   │   └── generated-content/  # Content display with copy, .md export, delete
│   │   │   │   │   └── services/
│   │   │   │   │       └── ai.service.ts       # Backend AI calls, DTO mapping, localStorage
│   │   │   │   ├── articles/                   # Article listing, filters, selection
│   │   │   │   │   ├── components/
│   │   │   │   │   │   ├── article-card/       # Single article card (checkbox, metadata, link)
│   │   │   │   │   │   ├── article-filters/    # Search bar, time window, source dropdown, reset
│   │   │   │   │   │   └── article-list/       # Container: filters + cards + selection bar
│   │   │   │   │   └── services/
│   │   │   │   │       └── article.service.ts  # Filters (computed chain), selection (Set), backend fetch
│   │   │   │   ├── history/                    # Generation history per project
│   │   │   │   │   └── components/
│   │   │   │   │       └── history-list/       # Full history page with delete per entry
│   │   │   │   ├── projects/                   # Project management
│   │   │   │   │   ├── components/
│   │   │   │   │   │   ├── project-card/       # Single project card (input/output)
│   │   │   │   │   │   ├── project-form/       # Create/edit form (Reactive Forms)
│   │   │   │   │   │   ├── project-list/       # Project list (responsive grid on desktop)
│   │   │   │   │   │   └── project-workspace/  # Project dashboard (stats, actions, history)
│   │   │   │   │   └── services/
│   │   │   │   │       └── project.service.ts  # CRUD + Signals + localStorage
│   │   │   │   ├── settings/                   # GDPR settings (data export, erasure)
│   │   │   │   │   └── components/
│   │   │   │   │       └── settings-page/      # Export JSON, delete all, privacy info
│   │   │   │   └── sources/                    # RSS source management
│   │   │   │       ├── components/
│   │   │   │       │   ├── source-card/        # Single source card (toggle, edit, delete)
│   │   │   │       │   ├── source-form/        # Create/edit form (URL validation)
│   │   │   │       │   └── source-list/        # Source list per project (responsive grid)
│   │   │   │       └── services/
│   │   │   │           └── source.service.ts   # Catalog + liaisons + localStorage
│   │   │   ├── shared/
│   │   │   │   ├── data/
│   │   │   │   │   └── categories.ts           # Category labels, icons, colors
│   │   │   │   ├── models/                     # TypeScript interfaces
│   │   │   │   │   ├── ai-api.model.ts         # Backend AI DTOs (AiGenerateRequestDto, ResponseDto)
│   │   │   │   │   ├── article.model.ts        # Article, ArticleFilters, TimeWindow
│   │   │   │   │   ├── generated-content.model.ts
│   │   │   │   │   ├── project.model.ts        # ReviewProject
│   │   │   │   │   ├── rss-api.model.ts        # Backend RSS DTOs (RssArticleDto, FeedResult)
│   │   │   │   │   ├── source.model.ts         # Source, ProjectSource, LinkedSource
│   │   │   │   │   └── index.ts                # Barrel exports
│   │   │   │   └── pipes/
│   │   │   │       └── relative-time.pipe.ts   # "Il y a 2h", "Hier à 14h30", "20/02/2026"
│   │   │   ├── app.config.ts                   # Application configuration
│   │   │   ├── app.html                        # Root template (responsive App Shell)
│   │   │   ├── app.routes.ts                   # Route definitions (lazy-loaded)
│   │   │   ├── app.scss                        # Root styles
│   │   │   ├── app.spec.ts                     # Root component tests
│   │   │   └── app.ts                          # Root component
│   │   ├── index.html
│   │   ├── main.ts
│   │   ├── styles.scss                         # Global styles
│   │   └── tailwind.css                        # Tailwind CSS entry point
│   ├── angular.json
│   ├── package.json                            # Angular dependencies
│   ├── proxy.conf.json                         # Dev proxy: /api/* → Fastify (localhost:3000)
│   └── tsconfig.json
├── api/                                        ← Fastify backend (TypeScript)
│   ├── src/
│   │   ├── models/
│   │   │   ├── ai.model.ts                     # AiProvider interface + shared types (Strategy Pattern)
│   │   │   └── rss-article.model.ts            # RSS article DTO + batch types
│   │   ├── providers/
│   │   │   ├── mistral-ai.provider.ts          # Mistral AI provider (API chat completions)
│   │   │   └── mock-ai.provider.ts             # Mock AI provider (dev, no API key needed)
│   │   ├── routes/
│   │   │   ├── ai.routes.ts                    # POST /api/ai/generate endpoint
│   │   │   └── rss.routes.ts                   # GET + POST /api/rss/* endpoints
│   │   ├── services/
│   │   │   ├── ai.service.ts                   # AI orchestration + provider factory
│   │   │   └── rss.service.ts                  # RSS feed fetching and parsing
│   │   └── server.ts                           # Fastify server + security plugins (Helmet, CORS, Rate Limit)
│   ├── .env.example                            # Environment variables template (committed)
│   ├── package.json                            # Fastify + feed-parser + security plugins
│   └── tsconfig.json                           # TypeScript strict config (NodeNext)
├── e2e/                                        ← Playwright E2E tests
│   ├── smoke.spec.ts                           # App shell, responsive navigation, empty state
│   ├── projects.spec.ts                        # Project CRUD lifecycle
│   ├── sources.spec.ts                         # Source management (add, toggle, delete)
│   ├── articles.spec.ts                        # Article loading, filters, selection
│   └── generation.spec.ts                      # AI content generation (synthesis, press review, LinkedIn)
├── playwright.config.ts                        # E2E config (webServer, browsers, timeouts)
├── package.json                                # Workspace root (npm workspaces)
├── package-lock.json                           # Lock file for all workspaces
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js 22.x (LTS)
- npm 10.x (bundled with Node.js)

### Installation

```bash
git clone https://github.com/Ellyria34/tech-review-tool.git
cd tech-review-tool
npm install
```

### Running the application

```bash
# Terminal 1 — Start the backend API
cd api
cp .env.example .env        # Then edit .env with your API keys
npm run dev                  # Fastify on http://localhost:3000

# Terminal 2 — Start the frontend
cd client
ng serve                     # Angular on http://localhost:4200
```

### Available Commands

| Command | Directory | Description |
|---|---|---|
| `npm run dev` | `api/` | Start Fastify dev server (tsx watch) |
| `ng serve` | `client/` | Start Angular dev server with proxy |
| `ng build` | `client/` | Build for production |
| `ng test` | `client/` | Run unit tests (151 tests) |
| `ng test --watch=false` | `client/` | Run tests once (CI mode) |
| `npx playwright test` | root | Run all E2E tests (19 tests, 3 browsers) |
| `npx playwright test --project=chromium` | root | Run E2E tests on Chromium only |
| `npx playwright show-report` | root | Open last E2E test report |
| `ng lint` | `client/` | Run ESLint code quality checks |
| `npm audit` | root | Check for dependency vulnerabilities |

> **Note**: Commands must be run from the respective workspace directory. Dependencies are installed once at root level via npm workspaces.

### API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check — returns `{ status: "ok" }` |
| `GET` | `/api/rss/fetch?url=<feed_url>` | Fetch and parse an RSS/Atom feed |
| `POST` | `/api/rss/fetch-multiple` | Batch fetch multiple RSS feeds (body: { urls: string[] }, max 20) |
| `POST` | `/api/ai/generate` | Generate AI content (body: { type, articles, projectName? }, max 15 articles) |

## 🧪 Testing

### Test Pyramid

| Layer | Tool | Tests | What it covers |
|---|---|---|---|
| Unit | Vitest | 151 | Services (4/4), pipes (1/1), components with logic (2) |
| E2E | Playwright | 19 | Full user journeys across 3 browsers (Chromium, Firefox, Mobile Chrome) |

### E2E Test Coverage

| File | Tests | User journey |
|---|---|---|
| `smoke.spec.ts` | 3 | App loads, responsive navigation, empty state |
| `projects.spec.ts` | 5 | Create, display, open workspace, edit, delete project |
| `sources.spec.ts` | 5 | Empty state, add source, toggle on/off, delete with confirm, count |
| `articles.spec.ts` | 4 | Load articles from RSS, keyword filter, reset filters, selection + AI panel |
| `generation.spec.ts` | 3 | Generate synthesis, press review, LinkedIn post (mock provider) |

## 🔒 Security

### HTTP Security Headers (via @fastify/helmet)

The backend sends security headers with every response: Content-Security-Policy (CSP), Strict-Transport-Security (HSTS), X-Content-Type-Options, X-Frame-Options, Referrer-Policy, and more.

### CORS

API access is restricted to the Angular origin via `@fastify/cors`. The allowed origin is configurable via the `CORS_ORIGIN` environment variable (defaults to `http://localhost:4200` in development).

### Rate Limiting

`@fastify/rate-limit` limits API requests to 100 per minute per IP address. Localhost is allowlisted for development and E2E testing.

### Dependency Auditing

Dependencies are monitored via `npm audit` and GitHub Dependabot (alerts + automatic security PRs). Angular was updated from 21.1.5 to 21.2.0 to fix a high-severity XSS vulnerability (GHSA-prjf-86w9-mfqv).

## 🛡️ GDPR Compliance

| GDPR Right | Implementation |
|---|---|
| **Transparency** (Art. 13) | Notice in AI panel: informs users that article data is sent to an external AI service |
| **Data portability** (Art. 20) | Settings page: export all data as JSON (projects, sources, articles, generations) |
| **Right to erasure** (Art. 17) | Settings page: delete all data with confirmation (`localStorage.clear()`) |
| **Data minimization** | Local-first: all data stored in browser localStorage, no server-side user data |
| **No tracking** | Angular telemetry disabled, no third-party cookies, no analytics |

## 🏗️ Architecture

### Monorepo with npm Workspaces

The project uses **npm workspaces** to manage frontend and backend in a single repository:

```
package.json (root)
├── workspaces: ["client", "api"]
├── client/package.json   → Angular dependencies
└── api/package.json      → Fastify dependencies
```

Dependencies are **hoisted** to a single `node_modules/` at root — shared packages are installed once. Each workspace has its own `package.json` declaring its specific dependencies.

### Backend Architecture (api/)

The backend follows a layered architecture separating concerns:

```
routes/      → HTTP layer (request validation, response formatting)
services/    → Business logic (orchestration, provider factory)
providers/   → AI provider implementations (Strategy Pattern)
models/      → Data contracts (TypeScript interfaces / DTOs)
server.ts    → Entry point + security plugins (Helmet, CORS, Rate Limit)
```

### Frontend ↔ Backend Integration

The frontend communicates with the backend via thin HTTP client services (SRP pattern):

```
AiApiService  (HTTP only)  →  AiService  (state + DTO mapping)  →  Components (UI)
RssApiService (HTTP only)  →  ArticleService (state + mapping)  →  Components (UI)
```

Each integration layer handles bidirectional DTO mapping between frontend models and backend contracts. Type differences (e.g., frontend `linkedin-post` ↔ backend `linkedin`) are translated in the mapping layer.

### Dev Proxy (Angular → Fastify)

In development, Angular (port 4200) proxies `/api/*` requests to Fastify (port 3000) via `proxy.conf.json`. This avoids CORS issues without requiring CORS headers. The proxy only exists in the dev server (`ng serve`) and is not deployed to production.

### Multi-project Workspace Pattern

Each review project acts as an isolated context. Sources are managed as a **global catalog** with many-to-many liaisons to projects — a source can be shared across multiple projects without duplication.

### Responsive Layout

The application uses a **pure CSS breakpoint switch** for responsive behavior:

- **Mobile** (default): vertical stack — header + scrollable content + bottom navigation
- **Desktop** (lg: ≥ 1024px): horizontal layout — sidebar (256px fixed) + content area (flex-1)

The header and bottom nav are hidden on desktop; the sidebar takes over branding and navigation. No JavaScript is involved in the layout switch.

### Reactive Data Flow

```
RssApiService (HTTP)  →  ArticleService (state)  →  computed projectArticles  →  computed filteredArticles
(POST /api/rss/...)      Signal _articles            (filtered by project)       (+ keywords, timeWindow)
                                                                                        ↓
                                                                                  displayed in template

AiApiService (HTTP)   →  AiService (state)        →  computed projectContents  →  displayed in template
(POST /api/ai/...)       Signal _generatedContents    (filtered by project)
```

Each `computed()` auto-recalculates when its dependencies change — forming a reactive pipeline that updates the UI automatically.

### Design Principles

- **SOLID** — Single responsibility components and services
- **Strategy Pattern** — Pluggable AI providers via interface + factory
- **DTO Pattern** — Separate data contracts for API communication and frontend models
- **Mobile-first** — Responsive design starting from smallest screens
- **Accessibility (a11y)** — WCAG 2.1 AA compliance (ARIA roles, keyboard navigation, screen readers)
- **GDPR-friendly** — Local-first data, export/erasure, AI transparency notice
- **Defense in depth** — Helmet (CSP/HSTS), CORS, rate limiting, `npm audit`, Dependabot
- **Test Pyramid** — Unit tests (Vitest) for logic, E2E tests (Playwright) for user journeys
- **Conventional Commits** — Structured commit messages for readable history

## 📖 Documentation

| Document | Language | Description |
|---|---|---|
| [ARCHITECTURE_ET_METHODOLOGIE.md](./docs/ARCHITECTURE_ET_METHODOLOGIE.md) | 🇫🇷 French | Architecture decisions, methodology, SOLID principles |
| [JOURNAL_DE_BORD.md](./JOURNAL_DE_BORD.md) | 🇫🇷 French | Development log Phase 1 (Steps 0-8) |
| [JOURNAL_DE_BORD2.md](./JOURNAL_DE_BORD2.md) | 🇫🇷 French | Development log Phase 2 (Steps 9-13) |

## 🗺️ Roadmap

### Phase 1 — Frontend (completed ✅)

- [x] **Step 0** — Project setup (Angular 21, Git, GitHub)
- [x] **Step 1** — Project structure, linting, Tailwind CSS, App Shell
- [x] **Step 2** — Multi-project feature (CRUD projects)
- [x] **Step 3** — RSS source management per project (many-to-many catalog)
- [x] **Step 4** — Article listing with filters, selection, workspace integration
- [x] **Step 5** — AI-powered content generation (synthesis, press review, LinkedIn)
- [x] **Step 6** — Generation history per project
- [x] **Step 7** — Responsive desktop layout (sidebar + contextual navigation)
- [x] **Step 8** — Unit tests (Vitest — 137 tests, 7 test files)

### Phase 2 — Backend + Integration

- [x] **Step 9** — Fastify backend: monorepo, real RSS endpoint, Angular proxy
- [x] **Step 10** — Angular ↔ Backend RSS integration (replace mock articles)
- [x] **Step 11** — Backend: AI endpoint with Strategy Pattern (Mistral + Mock)
- [x] **Step 12** — Angular ↔ Backend AI integration (DTOs, error handling, selection limit, 151 tests)
- [ ] **Step 13** — E2E tests ✅, security ✅, GDPR ✅, production build 🔄

### TODOs (deferred improvements)

| TODO | Description | When |
|---|---|---|
| **3.5** — Source catalog reuse UI | Add a "📂 From catalog" button to link existing sources without recreating. Architecture ready (`getAvailableForProject()` exists). | Standalone |
| ~~**5.7** — Audit `theme()` in component SCSS~~ | ~~Audit and replace with hex values.~~ Resolved at step 13.5 — no `theme()` found. | ✅ Done |
| **6.7** — Dedicated generation page | Create a guided wizard instead of the current selection-first flow. | Standalone |
| **10.1** — Auto-detect RSS feed URL | User enters a website URL → backend fetches the HTML page → extracts `<link rel="alternate" type="application/rss+xml">` from `<head>` → returns the feed URL. Fallback error if no feed found. | Standalone |
| **11.x** — Content enrichment | Fetch full article content via `mozilla/readability` before sending to AI. Snippet RSS is too short for LinkedIn/article generation. | Standalone |

## 📄 License

This project is licensed under [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) — you may share and adapt it for **non-commercial purposes only**, with attribution and under the same license.