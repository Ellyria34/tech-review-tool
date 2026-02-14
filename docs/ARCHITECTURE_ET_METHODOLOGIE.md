# 🏗️ TechReviewTool — Document d'Architecture et de Méthodologie

> **Nom du projet** : TechReviewTool — Agrégateur intelligent de veille technologique
> **Date de création** : 14 février 2026
> **Auteur** : Ellyria34
> **Statut** : Phase 0 — Setup terminé, prête à coder

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
11. [Glossaire C# → Angular](#11-glossaire-c--angular)

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

Chaque projet est isolé : ses propres sources, articles, et contenus générés. C'est le pattern **Multi-Tenant** appliqué côté front-end.
---

## 2. Choix technologiques argumentés

### 2.1 Stack Frontend

| Technologie | Version | Justification |
|---|---|---|
| **Angular** | **21.1.4** (Active, support jusqu'en mai 2027) | Framework structuré avec TypeScript natif, injection de dépendances, Signals comme paradigme réactif. Le plus proche de l'écosystème C#/.NET en termes de concepts (DI, classes, décorateurs, structure forte). |
| **TypeScript** | **5.8+** (embarqué avec Angular 21) | Typage statique fort — familier pour un·e dev C#. TypeScript EST le langage d'Angular, pas une option. |
| **SCSS** | — | CSS avec variables, nesting et mixins pour un code maintenable et un responsive mobile-first propre. |
| **Node.js** | **22.22.0** (Maintenance LTS "Jod", support jusqu'en avril 2027) | Runtime JavaScript pour l'outillage (CLI Angular, build, dev server). Version LTS = stabilité garantie. |
| **npm** | **10.9.4** (bundled avec Node.js 22.22.0) | Gestionnaire de paquets livré avec Node.js. On utilise la version bundled pour éviter les incompatibilités. |

### 2.2 Pourquoi Angular 21 et pas une autre version ?

Angular 21 est en support "Active" — il reçoit nouvelles features + bugfixes + sécurité. 
Angular 20 est en LTS (sécurité seulement). 
Pour un nouveau projet, on prend toujours la version Active.

**Pourquoi pas React ou Vue ?** Angular est le framework front le plus proche de l'écosystème C#/.NET :
- TypeScript natif (pas optionnel)
- Injection de dépendances intégrée
- Framework opinionated : il impose une structure (comme ASP.NET)
- Concepts OOP familiers : classes, interfaces, décorateurs ≈ attributs C#
- Séparation des responsabilités : Component / Service / Route ≈ Controller / Service / Repository

### 2.3 Pourquoi Node.js 22 et pas Node.js 24 ?

Node.js 22 est en Maintenance LTS (support jusqu'en avril 2027). Node.js 24 est en Active LTS (support jusqu'en avril 2028). 
On a choisi Node 22 car :
- Angular 21 supporte `^20.19.0 || ^22.12.0 || ^24.0.0` — les deux fonctionnent
- Node 22 était déjà installé et à jour (22.22.0 avec les derniers correctifs CVE)
- Éviter un changement de runtime en cours de projet
- 14 mois de support restants — largement suffisant pour le développement

**Règle de décision** : 
npm est livré (bundled) avec Node.js. 
On ne met JAMAIS à jour npm indépendamment (npm 11 ≠ compatible Node 22). 
Pour vérifier la version bundled : consulter les release notes sur https://nodejs.org/en/blog/release/

---

## 3. Architecture globale

### 3.1 Modèle de données

Le **Projet** (ReviewProject) est l'entité racine. Tout est scopé par projet :

```
ReviewProject (entité racine)
├── Source[]         (sources RSS du projet)
├── Article[]        (articles agrégés)
└── GeneratedContent[] (contenus IA générés)
```

Chaque entité porte un `projectId` — c'est le pattern **Multi-Tenant**.

### 3.2 Navigation

```
/projects                    → Liste des projets (page d'accueil)
/projects/new                → Créer un projet
/projects/:id                → Dashboard du projet
/projects/:id/articles       → Articles du projet
/projects/:id/sources        → Sources du projet
/projects/:id/history        → Historique des générations
```

### 3.3 Composants Angular prévus

**Nouveaux composants (multi-projets)** :

| Wireframe | Composant Angular | Dossier |
|---|---|---|
| Liste des projets | ProjectListComponent | features/projects/ |
| Carte projet | ProjectCardComponent | features/projects/ |
| Formulaire création | ProjectFormComponent | features/projects/ |
| Barre contexte projet | ProjectContextBarComponent | core/ |
| Sélecteur rapide | ProjectSwitcherComponent | core/ |
| Historique générations | HistoryListComponent | features/history/ |

**Composants existants (à créer)** :

| Wireframe | Composant Angular | Dossier |
|---|---|---|
| Navigation | NavigationComponent | core/ |
| Liste d'articles | ArticleListComponent | features/articles/ |
| Carte d'article | ArticleCardComponent | features/articles/ |
| Barre de sélection | SelectionBarComponent | features/articles/ |
| Panneau Action IA | AiActionPanelComponent | features/ai-actions/ |
| Contenu généré | GeneratedContentComponent | features/ai-actions/ |

---

## 4. Principes SOLID appliqués à Angular/TypeScript

### S — Single Responsibility (Responsabilité unique)

**C#** : Un Controller ne fait que router, un Service ne fait que la logique métier.
**Angular** : Un Component ne fait que l'affichage, un Service ne fait que les données.

```typescript
// ❌ Mauvais : le composant fait TOUT
export class ProjectListComponent {
  projects = signal<Project[]>([]);

  loadProjects() { /* appel HTTP */ }
  saveProject() { /* appel HTTP */ }
  filterByDate() { /* logique métier */ }
}

// le composant AFFICHE, le service GÈRE
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

**C#** : On étend via des interfaces, pas en modifiant le code existant.
**Angular** : On étend via l'injection de dépendances et les tokens.

### L — Liskov Substitution

**C#** : Une sous-classe peut remplacer sa classe parente.
**Angular** : Un service implémentant une interface peut remplacer un autre.

### I — Interface Segregation (Ségrégation des interfaces)

**C#** : Plein de petites interfaces plutôt qu'une grosse.
**Angular** : Plein de petits services plutôt qu'un "God Service".

### D — Dependency Inversion

**C#** : `services.AddScoped<IProjectService, ProjectService>()`
**Angular** : `{ provide: ProjectService, useClass: MockProjectService }`

---

## 5. Structure du projet

```
src/
├── app/
│   ├── core/                  # Services singleton, guards, interceptors
│   │   ├── services/
│   │   ├── guards/
│   │   └── interceptors/
│   ├── features/              # Modules fonctionnels
│   │   ├── projects/          # CRUD projets
│   │   ├── articles/          # Liste, filtres, sélection
│   │   ├── sources/           # Gestion des sources RSS
│   │   ├── ai-actions/        # Panneau IA, génération
│   │   └── history/           # Historique des générations
│   ├── shared/                # Composants réutilisables, pipes, directives
│   │   ├── components/
│   │   ├── pipes/
│   │   └── directives/
│   ├── app.ts                 # Composant racine
│   ├── app.html               # Template racine
│   ├── app.scss               # Styles racine
│   ├── app.config.ts          # Configuration
│   └── app.routes.ts          # Routes principales
├── assets/                    # Images, fonts, fichiers statiques
├── environments/              # Variables d'environnement
├── index.html                 # Page HTML principale
├── main.ts                    # Point d'entrée
└── styles.scss                # Styles globaux (variables SCSS, reset)
```

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
| **Droit à l'effacement** | Suppression complète d'un projet = suppression de toutes ses données |

### 7.2 Sécurité applicative

| Mesure | Comment |
|---|---|
| Pas de secrets côté client | Les clés API ne sont jamais dans le code source |
| Dépendances auditées | `npm audit` régulier pour détecter les vulnérabilités |
| Intégrité des paquets | `package-lock.json` commité, vérification SHA-512 automatique par npm |
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

**Parallèle C#** : Vitest ≈ xUnit, Angular Testing Library ≈ bUnit (Blazor), Playwright ≈ Selenium.

---

## 10. Plan d'exécution par étapes

| Étape | Contenu | Statut |
|---|---|---|
| **0** | Conception, wireframes, document d'architecture | ✅ Terminé |
| **0.5** | Setup : Node.js 22, Angular CLI 21, Git, GitHub | ✅ Terminé |
| **1** | Structure projet, linting, Tailwind CSS, premier composant | ⬜ À faire |
| **2** | Feature multi-projets (CRUD projets) | ⬜ À faire |
| **3** | Gestion des sources RSS par projet | ⬜ À faire |
| **4** | Liste d'articles avec filtres (mots-clés, période) | ⬜ À faire |
| **5** | Actions IA (synthèse, revue de presse, LinkedIn) | ⬜ À faire |
| **6** | Historique des générations par projet | ⬜ À faire |
| **7** | Layout desktop (sidebar + onglets projets) | ⬜ À faire |
| **8** | Tests, audit accessibilité, build production | ⬜ À faire |

---

## 11. Glossaire C# → Angular

| Concept C# | Équivalent Angular | Notes |
|---|---|---|
| `Program.cs` | `main.ts` | Point d'entrée de l'application |
| `.csproj` | `package.json` | Dépendances et métadonnées du projet |
| `dotnet restore` | `npm install` | Installer les dépendances |
| `dotnet run` | `ng serve` | Lancer l'application en développement |
| `dotnet build` | `ng build` | Compiler pour la production |
| Controller | Component | Gère l'affichage et les interactions |
| Service (DI) | Service (DI) | Identique ! Injectable avec `@Injectable()` |
| `[ApiController]` | `@Component()` | Décorateur de classe |
| Razor `@Model.Title` | `{{ title() }}` | Interpolation dans le template |
| `INotifyPropertyChanged` | `signal()` | Réactivité — mise à jour auto de la vue |
| `appsettings.json` | `environment.ts` | Variables de configuration |
| Middleware | Interceptor / Guard | Traitement avant/après les requêtes |
| `bin/` + `obj/` | `node_modules/` + `.angular/` | Fichiers générés, ignorés par Git |
| `.editorconfig` | `.editorconfig` | Identique ! |
| `global.json` | `package.json` (engines) | Contraintes de version du runtime |
| Areas | Routes imbriquées (children) | Organisation par domaine fonctionnel |
| `[Authorize]` | Guard (`canActivate`) | Protection des routes |
| NuGet | npm | Gestionnaire de paquets |
| Solution (.sln) | Workspace (angular.json) | Conteneur de projet(s) |
