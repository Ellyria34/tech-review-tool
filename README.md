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
- ✅ **Tested** — 151 unit tests across 7 test files (services, pipes, components)
- ✅ **Real RSS backend** — Fastify API fetching and parsing live RSS/Atom feeds

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| Angular | 21.1.4 (Active) | Frontend framework |
| Fastify | 5.x | Backend HTTP framework (TypeScript) |
| TypeScript | 5.8+ (client) / 5.9+ (api) | Type-safe JavaScript |
| Mistral AI API | mistral-small-latest | AI content generation (synthesis, press review, LinkedIn) |
| @rowanmanning/feed-parser | 2.x | RSS and Atom feed parser |
| SCSS | — | Styling with variables, nesting, mixins |
| Tailwind CSS | 4.x | Utility-first CSS framework |
| Node.js | 22.22.0 (Maintenance LTS) | JavaScript runtime |
| npm | 10.9.4 (bundled) | Package manager + workspaces |
| Vitest | 4.x (bundled with Angular 21) | Unit testing framework |

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
│   │   │   │   │   │   ├── ai-action-panel/    # Bottom sheet: type selection + generation + result
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
│   │   │   │   └── sources/                    # RSS source management
│   │   │   │       ├── components/
│   │   │   │       │   ├── source-card/        # Single source card (toggle, edit, delete)
│   │   │   │       │   ├── source-form/        # Create/edit form (URL validation)
│   │   │   │       │   └── source-list/        # Source list per project (responsive grid)
│   │   │   │       └── services/
│   │   │   │           └── source.service.ts   # Catalog + liaisons + localStorage
│   │   │   ├── shared/
│   │   │   │   ├── data/                       # Centralized app data
│   │   │   │   │   ├── categories.ts           # Category labels, icons, colors
│   │   │   │   │   └── mock-articles.ts        # Mock article templates (dev only)
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
│   ├── .postcssrc.json
│   ├── .prettierrc
│   ├── angular.json
│   ├── eslint.config.js
│   ├── package.json                            # Angular dependencies
│   ├── proxy.conf.json                         # Dev proxy: /api/* → Fastify (localhost:3000)
│   ├── tsconfig.json
│   ├── tsconfig.app.json
│   └── tsconfig.spec.json
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
│   │   └── server.ts                           # Fastify server entry point
│   ├── .env.example                            # Environment variables template (committed)
│   ├── package.json                            # Fastify + feed-parser dependencies
│   └── tsconfig.json                           # Strict TypeScript config (NodeNext)
├── docs/
│   └── ARCHITECTURE_ET_METHODOLOGIE.md         # Architecture decisions (FR)
├── .editorconfig
├── .gitattributes
├── .gitignore
├── .vscode/                                    # VS Code workspace settings
├── LICENSE                                     # CC BY-NC-SA 4.0 (non-commercial)
├── package.json                                # Workspace root (npm workspaces)
├── package-lock.json                           # Locked versions (all workspaces)
└── README.md                                   # This file
```

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) >= 22.12.0 (LTS recommended)
- npm >= 10.x (bundled with Node.js)
- [Angular CLI](https://angular.dev/cli) 21.x

### Installation

```bash
# Clone the repository
git clone https://github.com/Ellyria34/tech-review-tool.git
cd tech-review-tool

# Install all workspaces (client + api)
npm install

# Configure environment (copy and edit with your API keys)
cp api/.env.example api/.env
```

### Running in Development

Start both servers in separate terminals:

```bash
# Terminal 1 — Backend (Fastify on port 3000)
cd api
npm run dev

# Terminal 2 — Frontend (Angular on port 4200)
cd client
ng serve
```

Open [http://localhost:4200](http://localhost:4200) in your browser. The Angular dev server proxies `/api/*` requests to Fastify automatically.

### Available Scripts

| Command | Location | Description |
|---|---|---|
| `npm run dev` | `api/` | Start Fastify server with hot reload (tsx watch) |
| `ng serve` | `client/` | Start Angular dev server with proxy to backend |
| `ng build` | `client/` | Build for production |
| `ng test` | `client/` | Run unit tests (151 tests) |
| `ng test --watch=false` | `client/` | Run tests once (CI mode) |
| `ng lint` | `client/` | Run ESLint code quality checks |
| `npx prettier --check src/` | `client/` | Check code formatting |
| `npx prettier --write src/` | `client/` | Auto-fix code formatting |

> **Note**: Commands must be run from the respective workspace directory. Dependencies are installed once at root level via npm workspaces.

### API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check — returns `{ status: "ok" }` |
| `GET` | `/api/rss/fetch?url=<feed_url>` | Fetch and parse an RSS/Atom feed |
| `POST` | `/api/rss/fetch-multiple` | Batch fetch multiple RSS feeds (body: { urls: string[] }, max 20) |
| `POST` | `/api/ai/generate` | Generate AI content (body: { type, articles, projectName? }, max 15 articles) |

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
- **GDPR-friendly** — Local-first data, no unnecessary third-party tracking
- **Security** — `noopener,noreferrer` on external links, API keys in `.env` (never committed)
- **Conventional Commits** — Structured commit messages for readable history

## 📖 Documentation

| Document | Language | Description |
|---|---|---|
| [ARCHITECTURE_ET_METHODOLOGIE.md](./docs/ARCHITECTURE_ET_METHODOLOGIE.md) | 🇫🇷 French | Architecture decisions, methodology, SOLID principles |

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
- [ ] **Step 13** — E2E tests (Playwright), security, GDPR, production build

### TODOs (deferred improvements)

| TODO | Description | When |
|---|---|---|
| **3.5** — Source catalog reuse UI | Add a "📂 From catalog" button to link existing sources without recreating. Architecture ready (`getAvailableForProject()` exists). | Standalone |
| **5.7** — Audit `theme()` in component SCSS | Tailwind `theme()` doesn't work in Angular component SCSS. Audit and replace with hex values. | Standalone |
| **6.7** — Dedicated generation page | Create a guided wizard instead of the current selection-first flow. | Standalone |
| **10.1** — Auto-detect RSS feed URL | User enters a website URL → backend fetches the HTML page → extracts `<link rel="alternate" type="application/rss+xml">` from `<head>` → returns the feed URL. Fallback error if no feed found. | Standalone |
| **11.x** — Content enrichment | Fetch full article content via `mozilla/readability` before sending to AI. Snippet RSS is too short for LinkedIn/article generation. | Standalone |

## 📄 License

This project is licensed under [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) — you may share and adapt it for **non-commercial purposes only**, with attribution and under the same license.