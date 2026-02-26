# 📬 TechReviewTool

> Angular 21 + Fastify monorepo — RSS aggregator with AI-powered content generation.

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
- ✅ **Tested** — 133 unit tests across 7 test files (services, pipes, components)

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| Angular | 21.1.4 (Active) | Frontend framework |
| TypeScript | 5.8+ | Type-safe JavaScript |
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
│   │   │   │       └── storage.helper.ts       # Generic localStorage helpers
│   │   │   ├── features/
│   │   │   │   ├── ai-actions/                 # AI content generation
│   │   │   │   │   ├── components/
│   │   │   │   │   │   ├── ai-action-panel/    # Bottom sheet: type selection + generation + result
│   │   │   │   │   │   └── generated-content/  # Content display with copy, .md export, delete
│   │   │   │   │   └── services/
│   │   │   │   │       └── ai.service.ts       # Mock generation, localStorage, project filtering
│   │   │   │   ├── articles/                   # Article listing, filters, selection
│   │   │   │   │   ├── components/
│   │   │   │   │   │   ├── article-card/       # Single article card (checkbox, metadata, link)
│   │   │   │   │   │   ├── article-filters/    # Search bar, time window, source dropdown, reset
│   │   │   │   │   │   └── article-list/       # Container: filters + cards + selection bar
│   │   │   │   │   └── services/
│   │   │   │   │       └── article.service.ts  # Filters (computed chain), selection (Set), mock
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
│   │   │   │   │   ├── article.model.ts        # Article, ArticleFilters, TimeWindow
│   │   │   │   │   ├── generated-content.model.ts
│   │   │   │   │   ├── project.model.ts        # ReviewProject
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
│   ├── tsconfig.json
│   ├── tsconfig.app.json
│   └── tsconfig.spec.json
├── api/                                        # Backend (Step 9 — in progress)
│   └── package.json                            # Fastify dependencies (placeholder)
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

# Start the Angular dev server
cd client
ng serve
```

Open [http://localhost:4200](http://localhost:4200) in your browser.

### Available Scripts

| Command | Location | Description |
|---|---|---|
| `ng serve` | `client/` | Start dev server with hot reload |
| `ng build` | `client/` | Build for production |
| `ng test` | `client/` | Run unit tests (133 tests) |
| `ng test --watch=false` | `client/` | Run tests once (CI mode) |
| `ng lint` | `client/` | Run ESLint code quality checks |
| `npx prettier --check src/` | `client/` | Check code formatting |
| `npx prettier --write src/` | `client/` | Auto-fix code formatting |

> **Note**: Angular commands must be run from the `client/` directory. Dependencies are installed once at root level via npm workspaces.

## 🏗️ Architecture

### Monorepo with npm Workspaces

The project uses **npm workspaces** to manage frontend and backend in a single repository:

```
package.json (root)
├── workspaces: ["client", "api"]
├── client/package.json   → Angular dependencies
└── api/package.json      → Fastify dependencies (Step 9)
```

Dependencies are **hoisted** to a single `node_modules/` at root — shared packages are installed once. Each workspace has its own `package.json` declaring its specific dependencies.

### Multi-project Workspace Pattern

Each review project acts as an isolated context. Sources are managed as a **global catalog** with many-to-many liaisons to projects — a source can be shared across multiple projects without duplication.

### Responsive Layout

The application uses a **pure CSS breakpoint switch** for responsive behavior:

- **Mobile** (default): vertical stack — header + scrollable content + bottom navigation
- **Desktop** (lg: ≥ 1024px): horizontal layout — sidebar (256px fixed) + content area (flex-1)

The header and bottom nav are hidden on desktop; the sidebar takes over branding and navigation. No JavaScript is involved in the layout switch.

### Reactive Data Flow

```
Signal _articles          →  computed projectArticles     →  computed filteredArticles
(all articles in storage)    (filtered by currentProject)    (+ keywords, timeWindow, source)
                                                                    ↓
                                                             displayed in template
```

Each `computed()` auto-recalculates when its dependencies change — forming a reactive pipeline that updates the UI automatically.

### Design Principles

- **SOLID** — Single responsibility components and services
- **Mobile-first** — Responsive design starting from smallest screens
- **Accessibility (a11y)** — WCAG 2.1 AA compliance (ARIA roles, keyboard navigation, screen readers)
- **GDPR-friendly** — Local-first data, no unnecessary third-party tracking
- **Security** — `noopener,noreferrer` on external links, `stopPropagation()` for event isolation
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
- [x] **Step 8** — Unit tests (Vitest — 133 tests, 7 test files)

### Phase 2 — Backend + Integration

- [ ] **Step 9** — Fastify backend: monorepo setup + real RSS endpoint
- [ ] **Step 10** — Angular ↔ Backend RSS integration (replace mock articles)
- [ ] **Step 11** — Backend: AI endpoint with Strategy Pattern (Claude + Ollama + Mock)
- [ ] **Step 12** — Angular ↔ Backend AI integration (replace mock generation)
- [ ] **Step 13** — E2E tests (Playwright), security, GDPR, production build

### TODOs (deferred improvements)

| TODO | Description | When |
|---|---|---|
| **3.5** — Source catalog reuse UI | Add a "📂 From catalog" button to link existing sources without recreating. Architecture ready (`getAvailableForProject()` exists). | Standalone |
| **4.8** — Real RSS fetching | Replace mock data with real RSS feeds via backend API. | Step 9-10 |
| **5.7** — Audit `theme()` in component SCSS | Tailwind `theme()` doesn't work in Angular component SCSS. Audit and replace with hex values. | Standalone |
| **6.7** — Dedicated generation page | Create a guided wizard instead of the current selection-first flow. | Standalone |

## 📄 License

This project is licensed under [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) — you may share and adapt it for **non-commercial purposes only**, with attribution and under the same license.