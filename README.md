# TechReviewTool

> Angular 21 tech review tool — RSS aggregator with AI-powered content generation.

## Overview

TechReviewTool is a web application that helps developers and tech professionals stay on top of technology news. It aggregates articles from configurable RSS sources, filters them by topic and keywords, and uses AI to generate summaries, press reviews, and LinkedIn posts.

### Key Features (Planned)

- **Multi-project workspace** — Organize your tech watch by theme (Cybersecurity, AI, Frontend, .NET...)
- **Configurable RSS sources** — Add/remove sources per project (global catalog, many-to-many)
- **Smart filtering** — Filter articles by keywords and time window (12h, 24h, 48h, 7d)
- **AI-powered generation** — Select articles and generate:
  - Concise synthesis of key points
  - Structured press review
  - Optimized LinkedIn post
- **Generation history** — Find and reuse past AI-generated content
- **Mobile-first responsive design** — Works on phone, tablet, and desktop

## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| Angular | 21.1.4 (Active) | Frontend framework |
| TypeScript | 5.8+ | Type-safe JavaScript |
| SCSS | — | Styling with variables, nesting, mixins |
| Tailwind CSS | 4.x | Utility-first CSS framework |
| Node.js | 22.22.0 (Maintenance LTS) | JavaScript runtime |
| npm | 10.9.4 (bundled) | Package manager |

## Project Structure

```
tech-review-tool/
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── components/
│   │   │   │   ├── bottom-nav/             # Mobile navigation bar
│   │   │   │   │   ├── bottom-nav.html
│   │   │   │   │   ├── bottom-nav.scss
│   │   │   │   │   └── bottom-nav.ts
│   │   │   │   └── header/                 # App header (always visible)
│   │   │   │       ├── header.html
│   │   │   │       ├── header.scss
│   │   │   │       └── header.ts
│   │   │   ├── guards/                     # Route protection (planned)
│   │   │   ├── interceptors/               # HTTP interceptors (planned)
│   │   │   └── services/                   # Singleton services (planned)
│   │   ├── features/
│   │   │   ├── ai-actions/                 # AI content generation (planned)
│   │   │   ├── articles/                   # Article listing and filters (planned)
│   │   │   ├── history/                    # Generation history (planned)
│   │   │   ├── projects/                   # Project management
│   │   │   │   ├── components/
│   │   │   │   │   ├── project-card/       # Single project card (input/output)
│   │   │   │   │   ├── project-form/       # Create/edit form (Reactive Forms)
│   │   │   │   │   ├── project-list/       # Project list (home screen)
│   │   │   │   │   └── project-workspace/  # Project dashboard (stats, actions)
│   │   │   │   └── services/
│   │   │   │       └── project.service.ts  # CRUD + Signals + localStorage
│   │   │   └── sources/                    # RSS source management
│   │   │       ├── components/
│   │   │       │   ├── source-card/        # Single source card (toggle, edit, delete)
│   │   │       │   ├── source-form/        # Create/edit form (URL validation, categories)
│   │   │       │   └── source-list/        # Source list per project (container)
│   │   │       └── services/
│   │   │           └── source.service.ts   # Catalog + liaisons + localStorage
│   │   ├── shared/
│   │   │   ├── components/                 # Reusable UI components (planned)
│   │   │   ├── data/                       # Centralized app data
│   │   │   │   └── categories.ts           # Category labels, icons, colors
│   │   │   ├── directives/                 # Custom directives (planned)
│   │   │   ├── models/                     # TypeScript interfaces (data models)
│   │   │   └── pipes/                      # Custom pipes (planned)
│   │   ├── app.config.ts                   # Application configuration
│   │   ├── app.html                        # Root template (App Shell)
│   │   ├── app.routes.ts                   # Route definitions
│   │   ├── app.scss                        # Root styles
│   │   ├── app.spec.ts                     # Root component tests
│   │   └── app.ts                          # Root component
│   ├── index.html                          # Main HTML page
│   ├── main.ts                             # Application entry point
│   ├── styles.scss                         # Global styles
│   └── tailwind.css                        # Tailwind CSS entry point
├── .vscode/                                # VS Code workspace settings
├── docs/
│   └── ARCHITECTURE_ET_METHODOLOGIE.md     # Architecture decisions (FR)
├── public/                                 # Static assets (favicon, images)
├── .editorconfig                           # Editor formatting conventions
├── .gitattributes                          # Line ending normalization (LF)
├── .gitignore                              # Files ignored by Git
├── LICENSE                                 # CC BY-NC-SA 4.0 (non-commercial)
├── .postcssrc.json                         # PostCSS configuration (Tailwind)
├── .prettierrc                             # Prettier code formatting rules
├── eslint.config.js                        # ESLint code quality rules
├── angular.json                            # Angular CLI configuration
├── package.json                            # Dependencies and scripts
├── package-lock.json                       # Locked dependency versions
├── tsconfig.json                           # Base TypeScript configuration
├── tsconfig.app.json                       # App-specific TypeScript config
├── tsconfig.spec.json                      # Test-specific TypeScript config
└── README.md                               # This file
```

## Getting Started

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

## Architecture

This project follows a **multi-project workspace** pattern where each review project acts as an isolated context. Sources are managed as a **global catalog** with many-to-many liaisons to projects — a source can be shared across multiple projects without duplication.

### Design Principles

- **SOLID** — Single responsibility components and services
- **Mobile-first** — Responsive design starting from smallest screens
- **Accessibility (a11y)** — WCAG 2.1 AA compliance
- **GDPR-friendly** — Local-first data, no unnecessary third-party tracking
- **Conventional Commits** — Structured commit messages for readable history

## Documentation

| Document | Language | Description |
|---|---|---|
| [ARCHITECTURE_ET_METHODOLOGIE.md](./docs/ARCHITECTURE_ET_METHODOLOGIE.md) | 🇫🇷 French | Architecture decisions, methodology, SOLID principles |

## Roadmap

- [x] **Step 0** — Project setup (Angular 21, Git, GitHub)
- [x] **Step 1** — Project structure, linting, Tailwind CSS, App Shell
- [x] **Step 2** — Multi-project feature (CRUD projects)
- [x] **Step 3** — RSS source management per project (many-to-many catalog)
- [ ] **Step 4** — Article listing with filters
- [ ] **Step 5** — AI-powered content generation
- [ ] **Step 6** — Generation history
- [ ] **Step 7** — Desktop layout adaptation
- [ ] **Step 8** — Testing, accessibility audit, production build

## License

This project is licensed under [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) — you may share and adapt it for **non-commercial purposes only**, with attribution and under the same license.