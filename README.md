# 📬 TechReviewTool

> Full-stack Angular 21 + Fastify tech review tool — RSS aggregator with AI-powered content generation.

## 📋 Overview

TechReviewTool is a web application that helps developers and tech professionals stay on top of technology news. It aggregates articles from configurable RSS sources, filters them by topic and keywords, and uses AI to generate summaries, press reviews, and LinkedIn posts.

### Key Features

- ✅ **Multi-project workspace** — Organize your tech watch by theme (Cybersecurity, AI, Frontend...)
- ✅ **Configurable RSS sources** — Add/remove sources per project (global catalog, many-to-many)
- ✅ **Smart filtering** — Filter articles by keywords, time window (12h, 24h, 48h, 7d) and source
- ✅ **Article selection** — Select articles with checkboxes, select all, sticky selection bar
- ✅ **AI-powered generation** — Select articles and generate:
  - Concise synthesis of key points
  - Structured press review
  - Optimized LinkedIn post
- ✅ **Generation history** — Find, expand, copy and export past AI-generated content
- ✅ **Responsive design** — Mobile-first with adaptive desktop layout (sidebar + contextual navigation)
- 🔲 **Real RSS fetching** — Backend service to fetch and parse real RSS feeds (planned)
- 🔲 **Multi-provider AI** — Strategy pattern supporting Ollama (local), Claude API, and OpenAI (planned)

## 🛠️ Tech Stack

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| Angular | 21.1.4 (Active) | Frontend framework |
| TypeScript | 5.8+ | Type-safe JavaScript |
| SCSS | — | Styling with variables, nesting, mixins |
| Tailwind CSS | 4.x | Utility-first CSS framework |

### Backend (planned — Step 9+)

| Technology | Version | Purpose |
|---|---|---|
| Fastify | 5.x | High-performance Node.js HTTP framework |
| @anthropic-ai/sdk | latest | Claude API integration |
| rss-parser | latest | RSS/Atom feed parsing |
| zod | latest | Input validation and type safety |
| Ollama | latest | Local LLM inference (optional) |

### Tooling

| Technology | Version | Purpose |
|---|---|---|
| Node.js | 22.22.0 (Maintenance LTS) | JavaScript runtime |
| npm | 10.9.4 (bundled) | Package manager |
| Vitest | (bundled with Angular 21) | Unit testing framework |
| Playwright | latest | End-to-end testing |

## 📁 Project Structure

### Current (Steps 1-7: Frontend only)

```
tech-review-tool/
├── src/                                    # Angular frontend source
│   ├── app/
│   │   ├── core/
│   │   │   ├── components/
│   │   │   │   ├── bottom-nav/             # Contextual mobile nav (visible inside projects only)
│   │   │   │   ├── header/                 # App header (mobile only, hidden on desktop)
│   │   │   │   └── sidebar/               # Desktop sidebar (project list + contextual nav)
│   │   │   ├── guards/                     # Route protection (planned)
│   │   │   ├── interceptors/               # HTTP interceptors (planned)
│   │   │   └── services/
│   │   │       └── storage.helper.ts       # Generic localStorage helpers
│   │   ├── features/
│   │   │   ├── ai-actions/                 # AI content generation
│   │   │   │   ├── components/
│   │   │   │   │   ├── ai-action-panel/    # Bottom sheet: type selection + generation + result
│   │   │   │   │   └── generated-content/  # Content display with copy, .md export, delete
│   │   │   │   └── services/
│   │   │   │       └── ai.service.ts       # Mock generation, localStorage, project filtering
│   │   │   ├── articles/                   # Article listing, filters, selection
│   │   │   │   ├── components/
│   │   │   │   │   ├── article-card/       # Single article card
│   │   │   │   │   ├── article-filters/    # Search bar, time window, source dropdown
│   │   │   │   │   └── article-list/       # Container: filters + cards + selection bar
│   │   │   │   └── services/
│   │   │   │       └── article.service.ts  # Filters (computed chain), selection (Set), mock data
│   │   │   ├── history/                    # Generation history
│   │   │   │   └── components/
│   │   │   │       └── history-list/       # Full history page with delete per entry
│   │   │   ├── projects/                   # Project management
│   │   │   │   ├── components/
│   │   │   │   │   ├── project-card/       # Single project card
│   │   │   │   │   ├── project-form/       # Create/edit form (Reactive Forms)
│   │   │   │   │   ├── project-list/       # Project list (responsive grid)
│   │   │   │   │   └── project-workspace/  # Project dashboard (stats, actions, history)
│   │   │   │   └── services/
│   │   │   │       └── project.service.ts  # CRUD + Signals + localStorage
│   │   │   └── sources/                    # RSS source management
│   │   │       ├── components/
│   │   │       │   ├── source-card/        # Single source card (toggle, edit, delete)
│   │   │       │   ├── source-form/        # Create/edit form (URL validation)
│   │   │       │   └── source-list/        # Source list per project (responsive grid)
│   │   │       └── services/
│   │   │           └── source.service.ts   # Catalog + liaisons + localStorage
│   │   ├── shared/
│   │   │   ├── components/                 # Reusable UI components (planned)
│   │   │   ├── data/                       # Centralized app data
│   │   │   │   ├── categories.ts           # Category labels, icons, colors
│   │   │   │   └── mock-articles.ts        # Mock article templates (dev only)
│   │   │   ├── directives/                 # Custom directives (planned)
│   │   │   ├── models/                     # TypeScript interfaces
│   │   │   │   ├── article.model.ts        # Article, ArticleFilters, TimeWindow
│   │   │   │   ├── generated-content.model.ts  # GeneratedContent, ContentType
│   │   │   │   ├── project.model.ts        # ReviewProject
│   │   │   │   ├── source.model.ts         # Source, ProjectSource, LinkedSource
│   │   │   │   └── index.ts               # Barrel exports
│   │   │   └── pipes/
│   │   │       └── relative-time.pipe.ts   # "Il y a 2h", "Hier à 14h30"
│   │   ├── app.config.ts                   # Application configuration
│   │   ├── app.html                        # Root template (responsive App Shell)
│   │   ├── app.routes.ts                   # Route definitions (lazy-loaded)
│   │   ├── app.scss                        # Root styles
│   │   ├── app.spec.ts                     # Root component tests
│   │   └── app.ts                          # Root component
│   ├── index.html                          # Main HTML page
│   ├── main.ts                             # Application entry point
│   ├── styles.scss                         # Global styles
│   └── tailwind.css                        # Tailwind CSS entry point
├── docs/
│   └── ARCHITECTURE_ET_METHODOLOGIE.md     # Architecture decisions (FR)
├── .vscode/                                # VS Code workspace settings
├── public/                                 # Static assets
├── angular.json                            # Angular CLI configuration
├── package.json                            # Dependencies and scripts
├── tsconfig.json                           # Base TypeScript configuration
└── README.md                               # This file
```

### Planned monorepo structure (Step 9+)

```
tech-review-tool/
├── client/                    # Angular frontend (current src/ moves here)
├── api/                       # Fastify backend (new)
│   ├── src/
│   │   ├── routes/
│   │   │   ├── rss.routes.ts      # GET /api/rss/fetch
│   │   │   └── ai.routes.ts       # POST /api/ai/generate
│   │   ├── services/
│   │   │   ├── rss.service.ts     # RSS fetch + XML parsing
│   │   │   └── ai.service.ts      # Prompt building + LLM provider orchestration
│   │   ├── providers/
│   │   │   ├── ai-provider.interface.ts  # Strategy pattern interface
│   │   │   ├── claude.provider.ts        # Anthropic API
│   │   │   ├── ollama.provider.ts        # Local LLM via Ollama
│   │   │   └── mock.provider.ts          # Mock for tests
│   │   ├── middleware/
│   │   │   ├── rate-limiter.ts    # Request rate limiting
│   │   │   ├── validator.ts       # Input validation (zod)
│   │   │   └── cors.ts            # CORS configuration
│   │   ├── config/
│   │   │   └── env.ts             # Environment variables (dotenv)
│   │   └── app.ts                 # Fastify entry point
│   ├── .env.example               # Environment template (no secrets)
│   ├── package.json
│   └── tsconfig.json
├── shared/                    # Shared TypeScript interfaces
│   └── models/                # Article, Source, GeneratedContent...
├── docs/                      # Documentation (FR)
├── package.json               # Workspace root
└── README.md
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

# Install dependencies
npm install

# Start the development server
ng serve
```

Open [http://localhost:4200](http://localhost:4200) in your browser.

### Available Scripts

| Command | Description |
|---|---|
| `ng serve` | Start development server with hot reload |
| `ng build` | Build for production |
| `ng test` | Run unit tests |
| `ng lint` | Run ESLint code quality checks |
| `npx prettier --check src/` | Check code formatting |
| `npx prettier --write src/` | Auto-fix code formatting |

## 🏗️ Architecture

### Overview

This project follows a **BFF (Backend For Frontend)** architecture pattern:

```
Angular (client)  ──HTTP──>  Fastify (api)  ──>  RSS feeds (Internet)
                                            ──>  LLM provider (Ollama / Claude / OpenAI)
```

The frontend never calls external APIs directly — the backend handles CORS, API keys, data parsing, and prompt engineering. This ensures security (no secrets in the browser) and GDPR compliance (data flow control).

### Frontend Architecture

The frontend follows a **multi-project workspace** pattern where each review project acts as an isolated context. Sources are managed as a **global catalog** with many-to-many liaisons to projects.

### Responsive Layout

The application uses a **pure CSS breakpoint switch** for responsive behavior:

- **Mobile** (default): vertical stack — header + scrollable content + bottom navigation
- **Desktop** (lg: ≥ 1024px): horizontal layout — sidebar (256px fixed) + content area (flex-1)

### AI Provider Abstraction (Strategy Pattern)

The backend uses the Strategy Pattern to support multiple AI providers interchangeably:

```
AiProvider (interface)
├── ClaudeProvider    → Anthropic API (cloud, best quality)
├── OllamaProvider    → Local LLM via Ollama (free, GDPR-friendly)
├── OpenAiProvider    → OpenAI API (cloud, alternative)
└── MockProvider      → Fake responses (for testing)
```

The frontend doesn't know which provider is used — it sends articles and receives generated content.

### Design Principles

- **SOLID** — Single responsibility components and services
- **YAGNI** — Don't build for reuse, build for use
- **Mobile-first** — Responsive design starting from smallest screens
- **Accessibility (a11y)** — WCAG 2.1 AA compliance
- **GDPR-friendly** — Local-first data, API keys server-side only
- **Security** — No secrets in frontend, rate limiting, input validation
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
- [x] **Step 8** — Frontend unit tests (Vitest — 138 tests, 7 test files)

### Phase 2 — Backend + Integration

- [x] **Step 8** — Frontend unit tests (Vitest — bridge between phases)
- [ ] **Step 9** — Backend setup: Fastify monorepo + real RSS fetching endpoint
- [ ] **Step 10** — Frontend ↔ Backend RSS integration (replace mock articles)
- [ ] **Step 11** — Backend AI endpoint with Strategy Pattern (Claude + Ollama + Mock)
- [ ] **Step 12** — Frontend ↔ Backend AI integration (replace mock generation)
- [ ] **Step 13** — E2E tests (Playwright), security hardening, GDPR compliance, production build

### TODOs (deferred improvements)

| TODO | Description | When |
|---|---|---|
| **3.5** — Source catalog reuse UI | Add a "📂 From catalog" button to link existing sources without recreating them. Architecture ready (`getAvailableForProject()` exists). | Standalone |
| **5.7** — Audit `theme()` in component SCSS | Replace remaining `theme()` calls with hex values in component SCSS files. | Step 8 |
| **6.7** — Dedicated generation page | Create a guided wizard (select articles → choose format → generate). | Standalone |

## 📄 License

This project is licensed under [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) — you may share and adapt it for **non-commercial purposes only**, with attribution and under the same license.