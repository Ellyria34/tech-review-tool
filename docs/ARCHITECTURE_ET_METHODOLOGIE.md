# 🏗️ TechReviewTool — Document d'Architecture et de Méthodologie

> **Nom du projet** : TechReviewTool — Agrégateur intelligent de veille technologique
> **Date de création** : 14 février 2026
> **Auteur** : Ellyria34
> **Statut** : Étape 3 terminée — Sources RSS Many-to-Many fonctionnel avec persistance

---

## Table des matières

1. [Vision du projet](#1-vision-du-projet)
2. [Choix technologiques argumentés](#2-choix-technologiques-argumentés)
3. [Architecture globale](#3-architecture-globale)
4. [Principes SOLID appliqués à Angular/TypeScript](#4-principes-solid-appliqués-à-angulartypescript)
5. [Structure du projet](#5-structure-du-projet)
6. [Méthodologie de travail](#6-méthodologie-de-travail)
7. [Sécurité et RGPD](#7-sécurité-et-rgpd)
8. [Accessibilité (a11y)](#8-accessibilité-a11y)
9. [Stratégie de tests](#9-stratégie-de-tests)
10. [Plan d'exécution par étapes](#10-plan-dexécution-par-étapes)
11. [Glossaire Angular / TypeScript](#11-glossaire-angular--typescript)

---

## 1. Vision du projet

### 1.1 Le problème

En tant que développeur·se, on passe un temps considérable à faire de la veille technologique : visiter des dizaines de sites, filtrer le bruit, puis synthétiser l'information. Ce processus est manuel, chronophage et non reproductible.

### 1.2 La solution — TechReviewTool

Une application web qui :

- Permet de **configurer des sources RSS** par thématique (IA, .NET, Front, Back, UI, Cybersécurité...)
- **Agrège les articles récents** selon une fenêtre temporelle (12h, 24h, 48h, 7j)
- **Filtre par mots-clés** (GPT-5, Claude Code, faille, ransomware...)
- Permet de **sélectionner des articles** dans les résultats
- Offre 3 **actions IA** sur la sélection :
  - **Synthèse** : résumé concis des points clés
  - **Revue de presse** : format journalistique structuré
  - **Publication LinkedIn** : post optimisé pour le réseau professionnel

### 1.3 Pattern architectural : Multi-projets (Workspace)

L'application suit le pattern **Workspace** (comme Slack, Notion, VS Code) :

1. **Phase 1** — Choisir ou créer un projet de veille
2. **Phase 2** — Travailler DANS le contexte de ce projet

Chaque projet est isolé : ses propres sources, articles, et contenus générés. C'est le pattern **Multi-Tenant** appliqué côté front-end. En Angular, un signal `currentProject` joue le rôle de contexte global qui détermine les données affichées.

---

## 2. Choix technologiques argumentés

### 2.1 Stack Frontend

| Technologie | Version | Justification |
|---|---|---|
| **Angular** | **21.1.4** (Active, support jusqu'en mai 2027) | Framework structuré avec TypeScript natif, injection de dépendances, Signals comme paradigme réactif. Structure forte et opinionated, idéal pour les applications d'entreprise. |
| **TypeScript** | **5.8+** (embarqué avec Angular 21) | Typage statique fort qui sécurise le code et améliore l'autocomplétion. TypeScript EST le langage d'Angular, pas une option. |
| **Tailwind CSS** | **4.x** | Framework CSS utility-first. Ne génère que les classes utilisées (tree-shaking). Disparaît en production. |
| **SCSS** | — | CSS avec variables, nesting et mixins pour un code maintenable et un responsive mobile-first propre. |
| **Node.js** | **22.22.0** (Maintenance LTS "Jod", support jusqu'en avril 2027) | Runtime JavaScript pour l'outillage (CLI Angular, build, dev server). Version LTS = stabilité garantie. |
| **npm** | **10.9.4** (bundled avec Node.js 22.22.0) | Gestionnaire de paquets livré avec Node.js. On utilise la version bundled pour éviter les incompatibilités. |

### 2.2 Pourquoi Angular 21 et pas une autre version ?

**Pourquoi pas Angular 20 (LTS) ?** Angular 21 est en support "Active" — il reçoit nouvelles features + bugfixes + sécurité. Angular 20 est en LTS (sécurité seulement). Pour un nouveau projet, on prend toujours la version Active.

**Pourquoi pas React ou Vue ?** Angular est un framework opinionated qui impose une structure claire :

- TypeScript natif (pas optionnel)
- Injection de dépendances intégrée
- Framework opinionated : il impose une structure (conventions > configuration)
- Concepts OOP : classes, interfaces, décorateurs
- Séparation des responsabilités : Component (affichage) / Service (logique) / Route (navigation)

### 2.3 Pourquoi Node.js 22 et pas Node.js 24 ?

Node.js 22 est en Maintenance LTS (support jusqu'en avril 2027). Node.js 24 est en Active LTS (support jusqu'en avril 2028). On a choisi Node 22 car :

- Angular 21 supporte `^20.19.0 || ^22.12.0 || ^24.0.0` — les deux fonctionnent
- Node 22 était déjà installé et à jour (22.22.0 avec les derniers correctifs CVE)
- Éviter un changement de runtime en cours de projet
- 14 mois de support restants — largement suffisant pour le développement

**Règle de décision** : npm est livré (bundled) avec Node.js. On ne met JAMAIS à jour npm indépendamment (npm 11 ≠ compatible Node 22). Pour vérifier la version bundled : consulter les release notes sur https://nodejs.org/en/blog/release/

---

## 3. Architecture globale

### 3.1 Modèle de données

Le **Projet** (ReviewProject) est l'entité racine. Les **Sources** sont un catalogue global partagé entre projets :

```
ReviewProject (entité racine)
├── ProjectSource[]     (liaisons vers le catalogue — Many-to-Many)
├── Article[]           (articles agrégés)
└── GeneratedContent[]  (contenus IA générés)

Source (catalogue global)
└── Partagée entre N projets via ProjectSource
```

**Pattern Many-to-Many** : Chaque source appartient à un catalogue global et peut être liée à plusieurs projets via `ProjectSource`. Une source peut être active dans un projet et inactive dans un autre. Supprimer un projet retire les liaisons mais conserve les sources dans le catalogue.

**Persistance localStorage** :

| Clé | Contenu |
|---|---|
| `trt_projects` | Les projets |
| `techreviewtool_sources` | Le catalogue global de sources |
| `techreviewtool_project_sources` | Les liaisons projet ↔ source |

### 3.2 Navigation

```
/projects                              → Liste des projets (page d'accueil)
/projects/new                          → Créer un projet
/projects/:id                          → Dashboard du projet (workspace)
/projects/:id/edit                     → Modifier un projet
/projects/:id/sources                  → Sources du projet
/projects/:id/sources/new              → Ajouter une source
/projects/:id/sources/:sourceId/edit   → Modifier une source
/projects/:id/articles                 → Articles du projet
/projects/:id/history                  → Historique des générations
```

Ce routing utilise le **lazy loading** (`loadComponent`) pour charger chaque composant à la demande. L'ordre des routes est important : les routes spécifiques (`/new`) doivent précéder les routes paramétrées (`/:id`).

### 3.3 Composants Angular prévus

**Composants implémentés** :

| Wireframe | Composant Angular | Dossier | Statut |
|---|---|---|---|
| Header de l'app | Header | core/components/ | ✅ |
| Navigation mobile | BottomNav | core/components/ | ✅ |
| Liste des projets | ProjectList | features/projects/components/ | ✅ |
| Carte projet | ProjectCard | features/projects/components/ | ✅ |
| Formulaire création/édition projet | ProjectForm | features/projects/components/ | ✅ |
| Dashboard projet | ProjectWorkspace | features/projects/components/ | ✅ |
| Liste des sources | SourceList | features/sources/components/ | ✅ |
| Carte source (toggle, actions) | SourceCard | features/sources/components/ | ✅ |
| Formulaire création/édition source | SourceForm | features/sources/components/ | ✅ |

**Composants à venir** :

| Wireframe | Composant Angular | Dossier |
|---|---|---|
| Barre contexte projet | ProjectContextBarComponent | core/ |
| Sélecteur rapide | ProjectSwitcherComponent | core/ |
| Historique générations | HistoryListComponent | features/history/ |
| Liste d'articles | ArticleListComponent | features/articles/ |
| Carte d'article | ArticleCardComponent | features/articles/ |
| Barre de sélection | SelectionBarComponent | features/articles/ |
| Panneau Action IA | AiActionPanelComponent | features/ai-actions/ |
| Contenu généré | GeneratedContentComponent | features/ai-actions/ |

---

## 4. Principes SOLID appliqués à Angular/TypeScript

### S — Single Responsibility (Responsabilité unique)

Un Component ne fait que l'affichage, un Service ne fait que la logique de données.

```typescript
// ❌ Mauvais : le composant fait TOUT
export class ProjectListComponent {
  projects = signal<Project[]>([]);

  loadProjects() { /* appel HTTP */ }
  saveProject() { /* appel HTTP */ }
  filterByDate() { /* logique métier */ }
}

// ✅ Bon : le composant AFFICHE, le service GÈRE
export class ProjectListComponent {
  projects = this.projectService.projects; // Signal du service
}

export class ProjectService {
  projects = signal<Project[]>([]);
  loadProjects() { /* ... */ }
  saveProject() { /* ... */ }
}
```

### O — Open/Closed (Ouvert/Fermé)

On étend le comportement via l'injection de dépendances et les tokens d'injection, sans modifier le code existant.

### L — Liskov Substitution

Un service implémentant une interface peut remplacer un autre. Exemple : un `MockProjectService` peut remplacer `ProjectService` dans les tests sans casser l'application.

### I — Interface Segregation (Ségrégation des interfaces)

Plein de petits services spécialisés plutôt qu'un "God Service" qui fait tout. Exemple : `ProjectService`, `SourceService`, `ArticleService`, `AiService` au lieu d'un unique `AppService`.

### D — Dependency Inversion

Les composants dépendent d'abstractions (interfaces/tokens), pas d'implémentations concrètes. Angular le gère nativement via son système d'injection de dépendances :

```typescript
{ provide: ProjectService, useClass: MockProjectService }
```

---

## 5. Structure du projet

```
src/
├── app/
│   ├── core/                  # Singleton : composants, services, guards, interceptors
│   │   ├── components/
│   │   │   ├── bottom-nav/    # Navigation mobile (toujours visible en bas)
│   │   │   └── header/        # Header de l'app (toujours visible en haut)
│   │   ├── services/
│   │   ├── guards/
│   │   └── interceptors/
│   ├── features/              # Domaines fonctionnels
│   │   ├── projects/          # CRUD projets
│   │   │   ├── components/    # project-list, project-card, project-form, project-workspace
│   │   │   └── services/      # project.service.ts (Signals + localStorage)
│   │   ├── sources/           # Gestion des sources RSS (Many-to-Many)
│   │   │   ├── components/    # source-list, source-card, source-form
│   │   │   └── services/      # source.service.ts (catalogue + liaisons + localStorage)
│   │   ├── articles/          # Liste, filtres, sélection
│   │   ├── ai-actions/        # Panneau IA, génération
│   │   └── history/           # Historique des générations
│   ├── shared/                # Composants réutilisables, pipes, directives
│   │   ├── components/
│   │   ├── data/              # Données centralisées (catégories, presets)
│   │   ├── models/            # Interfaces TypeScript (ReviewProject, Source, Article...)
│   │   ├── pipes/
│   │   └── directives/
│   ├── app.ts                 # Composant racine
│   ├── app.html               # Template racine (App Shell)
│   ├── app.scss               # Styles racine
│   ├── app.spec.ts            # Tests du composant racine
│   ├── app.config.ts          # Configuration (providers, DI)
│   └── app.routes.ts          # Routes principales
├── index.html                 # Page HTML principale
├── main.ts                    # Point d'entrée de l'application
├── styles.scss                # Styles globaux (variables SCSS, reset)
└── tailwind.css               # Point d'entrée Tailwind CSS
```

**Logique d'organisation** :

| Dossier | Rôle | Combien de fois utilisé ? |
|---|---|---|
| `core/` | Composants et services singleton (app-level) | 1 fois dans l'app |
| `features/` | Domaines métier isolés | Spécifique à chaque domaine |
| `shared/` | Composants, pipes, directives réutilisables | N fois dans plusieurs features |

---

## 6. Méthodologie de travail

### 6.1 Conventional Commits

Chaque commit suit le format : `type(scope): description`

| Type | Quand | Exemple |
|---|---|---|
| `feat` | Nouvelle fonctionnalité | `feat(projects): add project list component` |
| `fix` | Correction de bug | `fix(articles): fix date filter timezone issue` |
| `chore` | Maintenance, config | `chore: add .gitattributes for LF normalization` |
| `docs` | Documentation | `docs: update README with setup instructions` |
| `style` | Formatage (pas de logique) | `style: fix indentation in app.html` |
| `refactor` | Refactoring sans changement fonctionnel | `refactor(services): extract HTTP logic` |
| `test` | Ajout/modification de tests | `test(projects): add unit tests for ProjectService` |

### 6.2 Branching Strategy

Pour un projet solo avec montée en compétence :

- `main` — code stable, toujours fonctionnel
- `feat/xxx` — branches de feature (une par étape ou sous-étape)

### 6.3 Workflow quotidien

```
1. git checkout -b feat/project-list    # Nouvelle branche
2. Coder + tester localement            # ng serve
3. git add . && git commit              # Commits réguliers
4. git push origin feat/project-list    # Push sur GitHub
5. Créer une Pull Request sur GitHub    # Revue de code
6. Merger dans main                     # Valider
```

---

## 7. Sécurité et RGPD

### 7.1 Principes RGPD appliqués

| Principe | Application dans TechReviewTool |
|---|---|
| **Minimisation** | On ne collecte que les données nécessaires (URLs de sources, préférences) |
| **Local-first** | Les données sont stockées localement (localStorage/IndexedDB), pas sur un serveur tiers |
| **Pas de tracking** | Télémétrie Angular désactivée, pas de cookies tiers |
| **Transparence** | L'utilisateur sait quelles données sont stockées et peut les supprimer |
| **Droit à l'effacement** | Suppression d'un projet = suppression des liaisons (les sources restent dans le catalogue global) |

### 7.2 Sécurité applicative

| Mesure | Comment |
|---|---|
| Pas de secrets côté client | Les clés API ne sont jamais dans le code source |
| Dépendances auditées | `npm audit` régulier pour détecter les vulnérabilités |
| Intégrité des paquets | `package-lock.json` committé, vérification SHA-512 automatique par npm |
| CSP (Content Security Policy) | Headers de sécurité pour empêcher les injections XSS |

---

## 8. Accessibilité (a11y)

### Objectif : WCAG 2.1 niveau AA

| Règle | Application |
|---|---|
| Contraste | Ratio minimum 4.5:1 pour le texte |
| Navigation clavier | Tous les éléments interactifs accessibles au clavier (Tab, Enter, Escape) |
| Lecteurs d'écran | Attributs ARIA sur les composants dynamiques |
| Focus visible | Indicateur de focus toujours visible |
| Sémantique HTML | Utiliser les bonnes balises (`<nav>`, `<main>`, `<article>`, `<button>`) |
| Labels | Tous les champs de formulaire ont un label associé |

---

## 9. Stratégie de tests

| Type | Outil | Quoi tester |
|---|---|---|
| **Unitaire** | Vitest (intégré Angular 21) | Services, pipes, logique métier |
| **Composant** | Vitest + Angular Testing Library | Rendu, interactions utilisateur |
| **E2E** | Playwright | Parcours utilisateur complets |

---

## 10. Plan d'exécution par étapes

| Étape | Contenu | Statut |
|---|---|---|
| **0** | Conception, wireframes, document d'architecture | ✅ Terminé |
| **0.5** | Setup : Node.js 22, Angular CLI 21, Git, GitHub | ✅ Terminé |
| **1** | Structure projet, linting, Tailwind CSS, App Shell | ✅ Terminé |
| **2** | Feature multi-projets (CRUD projets) | ✅ Terminé |
| **3** | Gestion des sources RSS par projet (catalogue Many-to-Many) | ✅ Terminé |
| **4** | Liste d'articles avec filtres (mots-clés, période) | ⬜ À faire |
| **5** | Actions IA (synthèse, revue de presse, LinkedIn) | ⬜ À faire |
| **6** | Historique des générations par projet | ⬜ À faire |
| **7** | Layout desktop (sidebar + onglets projets) | ⬜ À faire |
| **8** | Tests, audit accessibilité, build production | ⬜ À faire |

---

## 11. Glossaire Angular / TypeScript

| Terme | Définition |
|---|---|
| `Component` | Brique d'interface : un template HTML + une classe TypeScript + des styles. Gère l'affichage et les interactions utilisateur. |
| `Service` | Classe injectable qui contient la logique métier et la gestion des données. Singleton par défaut (`providedIn: 'root'`). |
| `Signal` | Valeur réactive qui notifie automatiquement les composants quand elle change. Remplace RxJS pour les cas simples. |
| `Route` | Association entre une URL et un composant. Définies dans `app.routes.ts`. |
| `Guard` | Fonction qui protège l'accès à une route (ex: vérifier qu'un projet existe avant d'y accéder). |
| `Interceptor` | Fonction qui intercepte les requêtes HTTP sortantes (ex: ajouter un token d'authentification). |
| `Pipe` | Transformateur de données dans le template (ex: `{{ date \| dateFormat }}`). |
| `Directive` | Attribut qui modifie le comportement d'un élément HTML existant. |
| `DI (Dependency Injection)` | Mécanisme Angular qui fournit automatiquement les services aux composants qui en ont besoin via `inject()`. |
| `Standalone Component` | Composant auto-suffisant qui déclare ses propres imports. Pas besoin de NgModule (standard depuis Angular 17+). |
| `Resolver` | Fonction qui charge des données AVANT que la route ne s'affiche. |
| `Template syntax` | `{{ }}` pour l'interpolation, `@for` / `@if` / `@switch` pour le contrôle de flux (Angular 17+). |
| `Tree-shaking` | Suppression automatique du code non utilisé au build. Réduit la taille du bundle final. |
| `Computed` | Signal dérivé qui se recalcule automatiquement quand ses dépendances changent. |
| `Many-to-Many` | Relation où une entité peut être liée à N autres et inversement. Implémentée via une table de liaison (junction table). |
| `LinkedSource` | Type enrichi combinant les données du catalogue (Source) avec les données de la liaison (isActive, linkId). |