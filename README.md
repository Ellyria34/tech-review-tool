## Mises à jour README.md

### 1. Dans la section "Project Structure", ajouter sous features/projects/ :

│   │   │   ├── sources/                # RSS source management
│   │   │   │   ├── components/
│   │   │   │   │   ├── source-card/       # Single source card (toggle, edit, delete)
│   │   │   │   │   ├── source-form/       # Create/edit form (URL validation, categories)
│   │   │   │   │   └── source-list/       # Source list per project (container)
│   │   │   │   └── services/
│   │   │   │       └── source.service.ts  # Catalog + liaisons + localStorage
│   │   │   ├── articles/               # Article listing and filters (planned)

### 2. Ajouter le dossier shared/data/ :

│   │   ├── shared/
│   │   │   ├── components/             # Reusable UI components (planned)
│   │   │   ├── data/                   # Centralized app data (categories, presets)
│   │   │   │   └── categories.ts       # Category labels, icons, colors
│   │   │   ├── directives/             # Custom directives (planned)
│   │   │   ├── models/                 # TypeScript interfaces (data models)
│   │   │   └── pipes/                  # Custom pipes (planned)

### 3. Dans la section Roadmap, cocher l'étape 3 :

- [x] **Step 0** — Project setup (Angular 21, Git, GitHub)
- [x] **Step 1** — Project structure, linting, Tailwind CSS, App Shell
- [x] **Step 2** — Multi-project feature (CRUD projects)
- [x] **Step 3** — RSS source management per project (many-to-many catalog)
- [ ] **Step 4** — Article listing with filters
- [ ] **Step 5** — AI-powered content generation
- [ ] **Step 6** — Generation history
- [ ] **Step 7** — Desktop layout adaptation
- [ ] **Step 8** — Testing, accessibility audit, production build

### 4. Dans la section Architecture, mettre à jour le texte :

This project follows a **multi-project workspace** pattern where each review project acts as an isolated context. Sources are managed as a **global catalog** with many-to-many liaisons to projects — a source can be shared across multiple projects without duplication.