# 🏗️ TechReviewTool — Document d'Architecture et de Méthodologie

> **Nom du projet** : TechReviewTool — Agrégateur intelligent de veille technologique
> **Date de création** : 14 février 2026
> **Auteur** : Ellyria34 - Sarah LLEON
> **Statut** : Phase 1 (frontend) terminée ✅ — Phase 2 (backend) en cours — Step 9 terminé (Fastify + RSS + proxy)

---

## Table des matières

1. [Vision du projet](#1-vision-du-projet)
2. [Choix technologiques argumentés](#2-choix-technologiques-argumentés)
3. [Architecture globale](#3-architecture-globale)
4. [Flux de données réactif](#4-flux-de-données-réactif)
5. [Principes SOLID appliqués à Angular/TypeScript](#5-principes-solid-appliqués-à-angulartypescript)
6. [Structure du projet](#6-structure-du-projet)
7. [Méthodologie de travail](#7-méthodologie-de-travail)
8. [Sécurité et RGPD](#8-sécurité-et-rgpd)
9. [Accessibilité (a11y)](#9-accessibilité-a11y)
10. [Stratégie de tests](#10-stratégie-de-tests)
11. [Plan d'exécution par étapes](#11-plan-dexécution-par-étapes)
12. [TODOs — Améliorations reportées](#12-todos--améliorations-reportées)
13. [Glossaire Angular / TypeScript](#13-glossaire-angular--typescript)

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
  - **Synthèse** : résumé concis des points clés avec liens vers les sources
  - **Revue de presse** : format journalistique structuré
  - **Publication LinkedIn** : post engageant à partir de la veille

### 1.3 Pattern architectural : Multi-projets (Workspace)

L'application suit le pattern **Workspace** (comme Slack, Notion, VS Code) :

1. **Phase 1** — Choisir ou créer un projet de veille
2. **Phase 2** — Travailler DANS le contexte de ce projet

Chaque projet est isolé : ses propres sources, articles, et contenus générés. En Angular, un signal `currentProject` joue le rôle de contexte global qui détermine les données affichées.

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
- Séparation des responsabilités : Component (affichage) / Service (logique) / Route (navigation)

### 2.3 Pourquoi Node.js 22 et pas Node.js 24 ?

Node.js 22 est en Maintenance LTS (support jusqu'en avril 2027). Node.js 24 est en Active LTS (support jusqu'en avril 2028). On a choisi Node 22 car :

- Angular 21 supporte `^20.19.0 || ^22.12.0 || ^24.0.0` — les deux fonctionnent
- Node 22 était déjà installé et à jour (22.22.0 avec les derniers correctifs CVE)
- Éviter un changement de runtime en cours de projet
- 14 mois de support restants — largement suffisant pour le développement

**Règle de décision** : npm est livré (bundled) avec Node.js. On ne met JAMAIS à jour npm indépendamment (npm 11 ≠ compatible Node 22). Pour vérifier la version bundled : consulter les release notes sur https://nodejs.org/en/blog/release/

### 2.4 Tailwind `theme()` dans les SCSS de composants

**Contrainte découverte à l'étape 5** : la fonction `theme()` de Tailwind fonctionne dans les fichiers globaux (`styles.scss`) mais **pas dans les fichiers SCSS de composants Angular**. Angular compile les styles de composants de façon isolée — il ne passe pas par le processeur Tailwind.

**Solution** : utiliser les valeurs hexadécimales directement dans les SCSS de composants.

| `theme()` | Valeur hex |
|---|---|
| `theme('colors.gray.50')` | `#f9fafb` |
| `theme('colors.gray.200')` | `#e5e7eb` |
| `theme('colors.gray.300')` | `#d1d5db` |
| `theme('colors.teal.50')` | `#f0fdfa` |
| `theme('colors.teal.300')` | `#5eead4` |
| `theme('colors.teal.500')` | `#14b8a6` |
| `theme('colors.teal.600')` | `#0d9488` |
| `theme('colors.teal.700')` | `#0f766e` |

**Règle** : Tailwind dans le HTML (classes utilitaires), hex dans le SCSS (styles composant). Les classes Tailwind dans le template fonctionnent normalement — seule la fonction `theme()` dans les fichiers `.scss` de composants est concernée.

### 2.5 Monorepo avec npm Workspaces

**Décidé à l'étape 9** : plutôt que de maintenir un repo séparé pour le backend, on restructure en **monorepo** avec npm workspaces.

| Approche | Avantage | Inconvénient |
|---|---|---|
| Repos séparés | Isolation totale | Synchronisation des types impossible, 2 repos à maintenir |
| Monorepo (npm workspaces) | Types partagés, un seul `npm install`, un seul repo Git | Config initiale plus complexe |
| Monorepo (Nx/Turborepo) | Cache intelligent, graph de dépendances | Overkill pour un projet à 2 workspaces |

**Choix** : npm workspaces natif — zéro outil externe, supporté nativement par npm depuis v7. Suffisant pour notre besoin (2 workspaces : `client` + `api`).

**Fonctionnement** : le `package.json` racine déclare les workspaces. npm **hoist** (remonte) les dépendances partagées dans un seul `node_modules/` à la racine. Chaque workspace a son propre `package.json` avec ses dépendances spécifiques.

```json
// package.json (racine)
{
  "name": "tech-review-tool",
  "private": true,
  "workspaces": ["client", "api"]
}
```

**Règle** : `npm install` se lance toujours depuis la racine du monorepo. Les commandes spécifiques à un workspace se lancent depuis le dossier du workspace (`cd client && ng serve`).

### 2.6 Stack Backend

| Technologie | Version | Justification |
|---|---|---|
| **Fastify** | **5.x** | Framework HTTP minimaliste et performant pour Node.js. Non-opinionated — on construit l'architecture nous-mêmes, ce qui permet de comprendre les fondations (routes, middleware, cycle requête/réponse). TypeScript-friendly avec support natif. |
| **TypeScript** | **5.9** (dernière stable) | Même langage que le frontend Angular. Configuration stricte (`strict: true`, `noUncheckedIndexedAccess`, `verbatimModuleSyntax`) pour un typage maximal. |
| **tsx** | **4.x** | Exécuteur TypeScript qui compile et recharge à la volée. `tsx watch` relance le serveur à chaque modification — équivalent de `ng serve` pour le backend. |
| **@rowanmanning/feed-parser** | **2.x** | Parser RSS et Atom activement maintenu, testé contre ~40 flux réels, supporte ESM nativement. Séparation des responsabilités : ne fait que le parsing (pas le téléchargement). |

### 2.7 Pourquoi Fastify et pas NestJS/Express ?

| Framework | Style | Forces | Faiblesses |
|---|---|---|---|
| **Express** | Minimaliste (2010) | Écosystème immense, documentation abondante | Vieillissant, pas de TypeScript natif, async/await mal géré |
| **Fastify** | Moderne, léger (2017) | Performant, TypeScript-friendly, JSON Schema, plugin system | Communauté plus petite qu'Express |
| **NestJS** | Full framework (2017) | Architecture imposée (modules, DI, decorators), très structuré | Courbe d'apprentissage raide, abstraction épaisse |

**Choix : Fastify** — Pour un projet d'apprentissage, Fastify expose les mécanismes fondamentaux de Node.js (serveur HTTP, routing, middleware) sans couche d'abstraction. On construit SOI-MÊME l'architecture models/routes/services, ce qui consolide la compréhension. NestJS masque ces mécanismes derrière des decorators et de l'injection de dépendances automatique — utile en entreprise, mais contre-productif pour apprendre.

**NestJS pourra venir après** : quand on connaît les fondations (ce que fait Fastify), on comprend ce que NestJS automatise. L'inverse est plus difficile.

### 2.8 Pourquoi @rowanmanning/feed-parser et pas rss-parser ?

| Package | Dernière MAJ | ESM natif | Maintenu |
|---|---|---|---|
| `rss-parser` (3.13.0) | 3 ans | ❌ CommonJS | ❌ |
| `@rowanmanning/feed-parser` (2.1.2) | Actif | ✅ | ✅ |

**Choix** : `@rowanmanning/feed-parser` — activement maintenu, supporte ESM nativement (compatible avec notre config `"type": "module"`), testé contre des flux réels. De plus, il ne fait QUE le parsing (pas le téléchargement) — on utilise le `fetch` natif de Node.js pour la partie réseau, ce qui respecte le principe de responsabilité unique (SRP).

### 2.9 Module System : ESM vs CommonJS

Node.js a historiquement deux systèmes de modules :

| | CommonJS (ancien) | ESM (standard) |
|---|---|---|
| Syntaxe | `require()` / `module.exports` | `import` / `export` |
| Époque | 2009 (inventé par Node.js) | 2015 (standard ECMAScript) |
| Extensions | Optionnelles | Obligatoires (`.js`) |
| Chargement | Synchrone | Asynchrone |
| Statut en 2026 | Legacy | Standard — ce qu'on utilise |

**Configuration** : `"type": "module"` dans `package.json` + `"module": "NodeNext"` dans `tsconfig.json` active ESM. Les imports doivent spécifier l'extension `.js` (même pour des fichiers `.ts` — TypeScript résout vers le fichier compilé).

```typescript
// ESM avec TypeScript — le fichier source est .ts, mais on importe en .js
import { rssRoutes } from "./routes/rss.routes.js";   // ✅ Correct
import { rssRoutes } from "./routes/rss.routes.ts";   // ❌ Node.js ne comprend pas
import { rssRoutes } from "./routes/rss.routes";      // ❌ ESM exige l'extension
```

### 2.10 Proxy Angular → Fastify (dev only)

**Problème** : en dev, Angular (port 4200) et Fastify (port 3000) sont sur deux ports différents. Le navigateur bloque les requêtes cross-origin (CORS).

**Solution dev** : `proxy.conf.json` dans `client/` redirige les appels `/api/*` vers `localhost:3000`. Le navigateur ne voit qu'un seul origin (`localhost:4200`), pas de CORS.

```
Navigateur → localhost:4200/api/health → [proxy ng serve] → localhost:3000/api/health (Fastify)
```

**En production** : le proxy n'existe pas (`ng serve` n'est jamais utilisé en prod). Le déploiement utilise soit Fastify qui sert les fichiers Angular statiques, soit un reverse proxy (nginx) qui route `/api/*` vers Fastify et `/*` vers les fichiers Angular. Dans les deux cas, un seul domaine = pas de CORS.

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
| `trt-articles` | Les articles agrégés (toutes sources confondues) |
| `trt-generated-contents` | Les contenus générés par l'IA |

**Helper partagé** : Les opérations localStorage sont factorisées dans `core/services/storage.helper.ts` avec deux fonctions génériques `loadFromStorage<T>()` et `saveToStorage<T>()`, utilisées par tous les services.

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

### 3.3 Layout responsive (Mobile-first)

L'application utilise un **switch CSS pur** via les breakpoints Tailwind — aucun JavaScript n'est impliqué dans le changement de layout :

```
Mobile (défaut) :  Header → Contenu → Bottom Nav    (pile verticale)
Desktop (lg:) :    Sidebar | Contenu                 (layout horizontal)
```

**Principe** : trois composants de navigation coexistent dans le DOM, mais seuls ceux adaptés au breakpoint actuel sont visibles :

| Composant | Mobile | Desktop (lg:) | Rôle |
|---|---|---|---|
| `Header` | Visible | Masqué (`lg:hidden`) | Branding + titre |
| `BottomNav` | Visible | Masqué (`lg:hidden`) | Navigation contextuelle projet |
| `Sidebar` | Masqué (`hidden`) | Visible (`lg:flex`) | Branding + liste projets + navigation contextuelle |

**Pourquoi CSS pur ?** Pas de `window.matchMedia()`, pas de signal `isMobile`, pas de `@HostListener('resize')`. Le CSS gère le responsive nativement et sans coût de performance. JavaScript n'intervient que pour la logique métier, jamais pour le layout.

**Adaptation des pages** : chaque page utilise des classes Tailwind responsive pour s'adapter :

- Listes → `lg:grid lg:grid-cols-2 xl:grid-cols-3` (grille sur desktop)
- Formulaires → `max-w-2xl mx-auto` (largeur contrainte et centrée)
- Padding → `px-4 py-3 lg:px-8 lg:py-6` (plus large sur desktop)
- Bottom nav space → `pb-16 lg:pb-0` (espace réservé en mobile, supprimé en desktop)

### 3.4 Composants Angular

**Composants implémentés** :

| Wireframe | Composant Angular | Dossier | Statut |
|---|---|---|---|
| Header de l'app (mobile uniquement) | Header | core/components/ | ✅ |
| Navigation mobile | BottomNav | core/components/ | ✅ |
| Sidebar desktop (projets + nav contextuelle) | SidebarComponent | core/components/ | ✅ |
| Liste des projets | ProjectList | features/projects/components/ | ✅ |
| Carte projet | ProjectCard | features/projects/components/ | ✅ |
| Formulaire création/édition projet | ProjectForm | features/projects/components/ | ✅ |
| Dashboard projet | ProjectWorkspace | features/projects/components/ | ✅ |
| Liste des sources | SourceList | features/sources/components/ | ✅ |
| Carte source (toggle, actions) | SourceCard | features/sources/components/ | ✅ |
| Formulaire création/édition source | SourceForm | features/sources/components/ | ✅ |
| Liste d'articles + filtres | ArticleList | features/articles/components/ | ✅ |
| Carte d'article (checkbox, lien) | ArticleCard | features/articles/components/ | ✅ |
| Barre de filtres (recherche, période, source) | ArticleFilters | features/articles/components/ | ✅ |
| Panneau Action IA (bottom sheet) | AiActionPanelComponent | features/ai-actions/components/ | ✅ |
| Contenu généré (copier/exporter/supprimer) | GeneratedContentComponent | features/ai-actions/components/ | ✅ |
| Historique générations | HistoryListComponent | features/history/components/ | ✅ |
| Temps relatif (pipe) | RelativeTimePipe | shared/pipes/ | ✅ |

---

## 4. Flux de données réactif

### 4.1 Chaîne de filtres

Le filtrage des articles utilise une **chaîne de `computed()`** qui se recalcule automatiquement quand une dépendance change :

```typescript
// Chaîne de computed() — auto-recalculating
readonly projectArticles = computed(() =>
  this._articles().filter(a => a.projectId === this.currentProjectId())
);
readonly filteredArticles = computed(() => {
  let articles = this.projectArticles();
  if (this.filters().timeWindow !== 'all') {
    articles = articles.filter(a => a.publishedAt > cutoffDate);
  }
  if (this.filters().keywords) {
    articles = articles.filter(a => a.title.includes(keyword));
  }
  return articles.sort((a, b) => b.publishedAt - a.publishedAt);
});
```

Chaque `computed()` se recalcule automatiquement quand une de ses dépendances change. C'est un pipeline réactif — modifier un filtre met à jour l'affichage sans intervention manuelle.

### 4.2 Sélection avec Set

La sélection d'articles utilise un `Set<string>` pour des recherches en O(1) :

```typescript
// Set<string> pour la sélection — recherche O(1) au lieu de O(n)
private _selectedIds = signal(new Set<string>());
isSelected(id: string): boolean {
  return this._selectedIds().has(id);
}
toggleSelection(id: string): void {
  this._selectedIds.update(set => {
    const newSet = new Set(set);
    newSet.has(id) ? newSet.delete(id) : newSet.add(id);
    return newSet;
  });
}
```

### 4.3 Contexte projet

Le `currentProjectId` est un signal global qui détermine les données affichées. Chaque service filtre ses données par ce contexte :

```typescript
export class ArticleService {
  currentProjectId = signal<string | null>(null);
  readonly projectArticles = computed(() =>
    this._articles().filter(a => a.projectId === this.currentProjectId())
  );
}
```

Ce pattern est répliqué dans `AiService` pour `projectContents` — les contenus générés filtrés par projet actif.

### 4.4 Règle d'or : pas d'effets de bord dans les computed

Un `computed()` doit être **pur** — il calcule et retourne une valeur, rien d'autre. Les effets de bord (appels service, navigation, modification d'état) vont dans `effect()` ou dans les méthodes déclenchées par l'utilisateur :

```typescript
// ❌ MAUVAIS — effet de bord dans un computed
readonly sources = computed(() => {
  this.articleService.setCurrentProject(this.projectId()); // SIDE EFFECT!
  return this.sourceService.getByProject(this.projectId())();
});

// ✅ BON — effet de bord dans effect(), computed reste pur
constructor() {
  effect(() => {
    this.articleService.setCurrentProject(this.projectId());
  });
}
readonly sources = computed(() => {
  const projectId = this.articleService.currentProjectId();
  return this.sourceService.getByProject(projectId)();
});
```

`effect()` est préféré à `ngOnInit()` quand l'effet dépend d'un signal qui peut changer (ex: paramètre de route). `effect()` se ré-exécute automatiquement quand ses dépendances changent, alors que `ngOnInit()` ne s'exécute qu'une seule fois à la création du composant.

### 4.5 Génération IA — flux async

La génération de contenu IA utilise `async/await` avec `Promise<T>`. Le pattern `try/finally` garantit que l'état de chargement est nettoyé même en cas d'erreur :

```typescript
async generate(type: ContentType, articles: Article[], projectId: string): Promise<GeneratedContent> {
  this._isGenerating.set(true);
  this._lastGenerated.set(null);
  try {
    await this.simulateDelay(300, 800); // Sera remplacé par l'appel API réel
    const content = { /* ... */ };
    this._generatedContents.update(contents => [...contents, content]);
    return content;
  } finally {
    this._isGenerating.set(false); // Toujours exécuté, même en cas d'erreur
  }
}
```

Le service expose un signal `isGenerating` consommé par le composant pour afficher un spinner et bloquer les interactions pendant la génération.

---

## 5. Principes SOLID appliqués à Angular/TypeScript

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

**Exemples concrets dans le projet** :
- Les données mock (`MOCK_ARTICLE_TEMPLATES`) sont séparées dans `shared/data/mock-articles.ts`, pas dans le service
- `ArticleService` gère les articles et les filtres, `AiService` gère la génération IA — deux domaines distincts
- Les opérations localStorage sont factorisées dans `storage.helper.ts`, pas dupliquées dans chaque service

### O — Open/Closed (Ouvert/Fermé)

On étend le comportement via l'injection de dépendances et les tokens d'injection, sans modifier le code existant. Exemple concret : le `AiService` utilise un mock de génération. Pour passer à une vraie API, on remplace **une seule méthode privée** (`generateMockContent`) sans toucher aux composants consommateurs.

### L — Liskov Substitution

Un service implémentant une interface peut remplacer un autre. Exemple : un `MockProjectService` peut remplacer `ProjectService` dans les tests sans casser l'application. Le mock de génération IA et la future API réelle ont la même signature — les composants ne font pas la différence.

### I — Interface Segregation (Ségrégation des interfaces)

Plein de petits services spécialisés plutôt qu'un "God Service" qui fait tout : `ProjectService`, `SourceService`, `ArticleService`, `AiService` — chacun a un domaine clair.

### D — Dependency Inversion

Les composants dépendent d'abstractions (interfaces/tokens), pas d'implémentations concrètes. Angular le gère nativement via son système d'injection de dépendances :

```typescript
{ provide: ProjectService, useClass: MockProjectService }
```

---

## 6. Structure du projet

### 6.1 Structure monorepo

```
tech-review-tool/                  ← Monorepo root (npm workspaces)
├── client/                        ← Frontend Angular
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/              # Singleton : composants, services, guards, interceptors
│   │   │   │   ├── components/
│   │   │   │   │   ├── bottom-nav/    # Navigation mobile contextuelle
│   │   │   │   │   ├── header/        # Header de l'app (mobile uniquement)
│   │   │   │   │   └── sidebar/       # Sidebar desktop (liste projets + nav)
│   │   │   │   └── services/
│   │   │   │       └── storage.helper.ts
│   │   │   ├── features/          # Domaines fonctionnels
│   │   │   │   ├── projects/      # CRUD projets
│   │   │   │   ├── sources/       # Gestion des sources RSS (Many-to-Many)
│   │   │   │   ├── articles/      # Liste d'articles, filtres, sélection
│   │   │   │   ├── ai-actions/    # Génération IA (synthèse, revue de presse, LinkedIn)
│   │   │   │   └── history/       # Historique des générations par projet
│   │   │   └── shared/            # Composants réutilisables, pipes, directives, modèles
│   │   │       ├── data/          # Données centralisées (catégories, mock articles)
│   │   │       ├── models/        # Interfaces TypeScript
│   │   │       └── pipes/         # RelativeTimePipe
│   │   ├── index.html
│   │   ├── main.ts
│   │   ├── styles.scss
│   │   └── tailwind.css
│   ├── angular.json
│   ├── eslint.config.js
│   ├── package.json               # Dépendances Angular
│   ├── tsconfig.json
│   ├── tsconfig.app.json
│   └── tsconfig.spec.json
├── api/                           ← Backend Fastify (TypeScript)
│   ├── src/
│   │   ├── models/
│   │   │   └── rss-article.model.ts   # DTO article RSS normalisé
│   │   ├── routes/
│   │   │   └── rss.routes.ts          # Routes GET /api/rss/*
│   │   ├── services/
│   │   │   └── rss.service.ts         # Fetch + parsing RSS/Atom
│   │   └── server.ts                  # Point d'entrée Fastify
│   ├── package.json               # Dépendances Fastify + feed-parser
│   └── tsconfig.json              # Config TypeScript strict (NodeNext)
├── docs/
│   └── ARCHITECTURE_ET_METHODOLOGIE.md
├── package.json                   # Workspace root (npm workspaces)
├── package-lock.json              # Lock file unique pour tous les workspaces
└── README.md
```

### 6.2 Logique d'organisation Angular (client/)

| Dossier | Rôle | Combien de fois utilisé ? |
|---|---|---|
| `core/` | Composants et services singleton (app-level) | 1 fois dans l'app |
| `features/` | Domaines métier isolés | Spécifique à chaque domaine |
| `shared/` | Composants, pipes, directives réutilisables | N fois dans plusieurs features |

### 6.3 Logique d'organisation monorepo (racine)

| Dossier | Rôle | Package manager |
|---|---|---|
| `client/` | Frontend Angular — tout le code UI | `package.json` propre (Angular, Tailwind, Vitest) |
| `api/` | Backend Fastify — API REST, RSS, IA | `package.json` propre (Fastify, feed-parser, providers IA) |

### 6.4 Architecture backend (api/)

Le backend suit une architecture en couches séparant les responsabilités :

| Couche | Dossier | Rôle | Connaît HTTP ? |
|---|---|---|---|
| **Models** | `src/models/` | Contrats de données (interfaces TypeScript / DTOs) | Non |
| **Services** | `src/services/` | Logique métier (fetch, parsing, transformations) | Non |
| **Routes** | `src/routes/` | Couche HTTP (validation requêtes, codes de statut, formatage réponses) | Oui |
| **Server** | `src/server.ts` | Point d'entrée — crée l'instance Fastify et enregistre les routes | Oui |

**Pattern plugin Fastify** : chaque fichier de routes exporte une fonction async qui reçoit l'instance Fastify et y enregistre ses routes via `app.register()`. Chaque plugin est autonome et testable indépendamment.

```typescript
// routes/rss.routes.ts — pattern plugin
export async function rssRoutes(app: FastifyInstance): Promise<void> {
  app.get("/api/rss/fetch", async (request, reply) => { /* ... */ });
}

// server.ts — enregistrement
await app.register(rssRoutes);
```
| Racine | Orchestration des workspaces | `package.json` avec `"workspaces": ["client", "api"]` |

**Règle** : `npm install` se lance toujours depuis la **racine**. Les commandes spécifiques (`ng serve`, `ng test`) se lancent depuis le **dossier du workspace** (`cd client`).

---

## 7. Méthodologie de travail

### 7.1 Conventional Commits

Chaque commit suit le format : `type(scope): description`

| Type | Quand | Exemple |
|---|---|---|
| `feat` | Nouvelle fonctionnalité | `feat(projects): add project list component` |
| `fix` | Correction de bug | `fix(articles): fix source filter empty on init` |
| `chore` | Maintenance, config | `chore: add .gitattributes for LF normalization` |
| `docs` | Documentation | `docs: update README with Step 5 completion` |
| `style` | Formatage (pas de logique) | `style: fix indentation in app.html` |
| `refactor` | Refactoring sans changement fonctionnel | `refactor: restructure to monorepo with npm workspaces` |
| `test` | Ajout/modification de tests | `test(projects): add unit tests for ProjectService` |

### 7.2 Branching Strategy

Pour un projet solo avec montée en compétence :

- `main` — code stable, toujours fonctionnel
- `feat/xxx` — branches de feature (une par étape ou sous-étape)

### 7.3 Workflow quotidien

```
1. git checkout -b feat/project-list    # Nouvelle branche
2. git push -u origin feat/project-list # Lier branche locale ↔ distante
3. Coder + tester localement            # cd client && ng serve
4. git add . && git commit              # Commits réguliers
5. git push                             # Push (sans préciser origin grâce au -u)
6. Créer une Pull Request sur GitHub    # Revue de code
7. Merger dans main                     # Valider
```

---

## 8. Sécurité et RGPD

### 8.1 Principes RGPD appliqués

| Principe | Application dans TechReviewTool |
|---|---|
| **Minimisation** | On ne collecte que les données nécessaires (URLs de sources, préférences) |
| **Local-first** | Les données sont stockées localement (localStorage), pas sur un serveur tiers |
| **Pas de tracking** | Télémétrie Angular désactivée, pas de cookies tiers |
| **Transparence** | L'utilisateur sait quelles données sont stockées et peut les supprimer |
| **Droit à l'effacement** | Suppression d'un projet = suppression des liaisons et des contenus générés associés (cascade delete) |

### 8.2 Sécurité applicative

| Mesure | Comment |
|---|---|
| Pas de secrets côté client | Les clés API ne sont jamais dans le code source |
| Dépendances auditées | `npm audit` régulier pour détecter les vulnérabilités |
| Intégrité des paquets | `package-lock.json` committé, vérification SHA-512 automatique par npm |
| CSP (Content Security Policy) | Headers de sécurité pour empêcher les injections XSS |
| Liens externes sécurisés | `target="_blank"` toujours avec `rel="noopener noreferrer"` |
| Clés localStorage non sensibles | Les clés de stockage ne contiennent pas de données personnelles |

---

## 9. Accessibilité (a11y)

### Objectif : WCAG 2.1 niveau AA

| Règle | Application |
|---|---|
| Contraste | Ratio minimum 4.5:1 pour le texte |
| Navigation clavier | Tous les éléments interactifs accessibles au clavier (Tab, Enter, Escape) |
| Lecteurs d'écran | Attributs ARIA sur les composants dynamiques (`role="dialog"`, `role="radio"`, `aria-modal`, `aria-checked`, `aria-busy`, `aria-label`) |
| Focus visible | Indicateur de focus toujours visible (`focus-visible` avec outline teal) |
| Sémantique HTML | Utiliser les bonnes balises (`<nav>`, `<main>`, `<article>`, `<button>`) |
| Labels | Tous les champs de formulaire ont un label associé |
| Feedback accessible | `role="status"` pour les messages de confirmation (ex: "Copié !"), `role="alert"` pour les erreurs |
| Événements clavier | `(click)` toujours accompagné de `(keydown)` ou `(keyup)` (ESLint enforce cette règle) |

---

## 10. Stratégie de tests

### Approche intercalée (décidée le 24 février 2026)

Plutôt que de tout tester à la fin, les tests sont **intercalés** entre les phases de développement :

| Phase | Type de test | Outil | Quoi tester |
|---|---|---|---|
| **Étape 8** (fin Phase 1) | Unitaire + Composant | Vitest + Angular Testing Library | Services, pipes, logique métier frontend — avec les mocks actuels |
| **Étapes 9-12** (pendant backend) | Unitaire backend | Vitest | Routes Fastify, services RSS, providers IA |
| **Étape 13** (après intégration) | E2E | Playwright | Parcours utilisateur complets (créer projet → ajouter sources → voir articles réels → générer contenu IA) |

**Pourquoi intercaler ?** Tester les services frontend sur les mocks a de la valeur : ça vérifie que la logique métier (filtres, sélection, computed chains) est correcte indépendamment de la source de données. Quand on branchera le vrai backend, si un test casse, on saura que c'est le backend qui pose problème, pas le frontend.

### Règle de décision : quoi tester ?

| Type de code | Tester ? | Pourquoi |
|---|---|---|
| **Services** (logique métier) | ✅ Oui — priorité maximale | C'est TON code, c'est la logique métier |
| **Pipes** (transformateurs) | ✅ Oui | Fonctions pures, faciles à tester, beaucoup de branches |
| **Composants avec logique propre** (debounce, RxJS) | ✅ Oui | Logique qui n'est pas dans un service |
| **Composants d'affichage** (cards, lists) | ❌ Non | Juste du HTML — testés par les tests E2E |
| **Formulaires** (FormBuilder, Validators, Router) | ❌ Non | "Plomberie" Angular — déjà testée par le framework |
| **Composants orchestrateurs** (workspace) | ❌ Non | Connectent des services déjà testés à 100% |

### Fichiers de test — Étape 8

| Fichier | Tests | Ce qui est couvert |
|---|---|---|
| `app.spec.ts` | 3 | Layout shell (header, sidebar, bottom-nav, router-outlet) |
| `relative-time.pipe.spec.ts` | 16 | 5 branches temporelles, fuseaux horaires |
| `project.service.spec.ts` | 19 | CRUD complet, validation, cascade delete, timestamps |
| `source.service.spec.ts` | 33 | Catalogue CRUD, liaisons Many-to-Many, computed queries |
| `article.service.spec.ts` | 34 | Chaîne computed, filtres combinés, sélection, déduplication |
| `ai.service.spec.ts` | 20 | Génération async, transitions d'état, persistence, cascade |
| `article-filters.spec.ts` | 8 | Debounce RxJS 300ms, distinctUntilChanged, cleanup destroy$ |
| **Total** | **133** | **4/4 services, 1/1 pipe, 2 composants (les seuls avec logique)** |

### Techniques de test utilisées

| Technique | Pourquoi |
|---|---|
| `vi.useFakeTimers()` + `vi.setSystemTime()` | Contrôler `new Date()`, `setTimeout`, `debounceTime` — tests déterministes |
| `vi.fn()` + `.toHaveBeenCalledWith()` | Mocks de fonctions — vérifier les appels et arguments |
| `vi.advanceTimersByTime(ms)` | Avancer le temps pour résoudre debounce/delay sans attendre |
| `vi.advanceTimersByTimeAsync(ms)` | Idem mais pour les Promises (AiService `simulateDelay`) |
| Factory functions (`buildArticle()`) | `Partial<T>` + spread — créer des objets de test lisibles |
| `localStorage.clear()` dans `beforeEach` + `afterEach` | Double nettoyage pour l'isolation entre tests |

### Angular 21 et les tests — mode zoneless

Angular 21 fonctionne **sans Zone.js** par défaut. Les utilitaires de test historiques (`fakeAsync`, `tick`) nécessitent Zone.js et ne fonctionnent plus. On utilise les fake timers natifs de Vitest à la place :

```typescript
// ❌ NE FONCTIONNE PLUS en Angular 21 zoneless
it('should debounce', fakeAsync(() => {
  tick(300);
}));

// ✅ CORRECT — fake timers Vitest natifs
it('should debounce', () => {
  vi.useFakeTimers();
  vi.advanceTimersByTime(300);
  vi.useRealTimers();
});
```

---

## 11. Plan d'exécution par étapes

### Phase 1 — Frontend (terminée ✅)

| Étape | Contenu | Statut |
|---|---|---|
| **0** | Conception, wireframes, document d'architecture | ✅ Terminé |
| **0.5** | Setup : Node.js 22, Angular CLI 21, Git, GitHub | ✅ Terminé |
| **1** | Structure projet, linting, Tailwind CSS, App Shell | ✅ Terminé |
| **2** | Feature multi-projets (CRUD projets) | ✅ Terminé |
| **3** | Gestion des sources RSS par projet (catalogue Many-to-Many) | ✅ Terminé |
| **4** | Liste d'articles avec filtres, sélection, intégration workspace | ✅ Terminé |
| **5** | Actions IA (synthèse, revue de presse, LinkedIn) — mock | ✅ Terminé |
| **6** | Historique des générations par projet | ✅ Terminé |
| **7** | Layout desktop responsive (sidebar + navigation contextuelle) | ✅ Terminé |
| **8** | Tests unitaires frontend (Vitest — 133 tests, 7 fichiers) | ✅ Terminé |

### Phase 2 — Backend + Intégration

| Étape | Contenu | Statut |
|---|---|---|
| **9** | Backend Fastify : setup monorepo + endpoint RSS réel + proxy Angular | ✅ Terminé |
| **10** | Intégration Angular ↔ Backend RSS (remplacement des mocks articles) | ⬜ À faire |
| **11** | Backend : endpoint IA avec Strategy Pattern (Claude + Ollama + Mock) | ⬜ À faire |
| **12** | Intégration Angular ↔ Backend IA (remplacement des mocks génération) | ⬜ À faire |
| **13** | Tests E2E (Playwright), sécurité, RGPD, build production | ⬜ À faire |

---

## 12. TODOs — Améliorations reportées

### TODO 3.5 — UI réutilisation du catalogue de sources

**Problème** : Créer plusieurs projets sur le même thème oblige à recréer les mêmes sources à chaque fois.

**Architecture** : Le Many-to-Many supporte déjà ce cas. `SourceService.getAvailableForProject()` retourne les sources du catalogue non encore liées au projet.

**Ce qu'il manque** : Un bouton "📂 Depuis le catalogue" dans la page sources, qui affiche les sources disponibles et permet de les lier en un clic.

**Quand** : Sous-étape autonome.

### TODO 4.8 — Récupération RSS réelle

**Situation actuelle** : Les articles sont générés par des données mock (`MOCK_ARTICLE_TEMPLATES` dans `shared/data/mock-articles.ts`). L'endpoint backend `GET /api/rss/fetch?url=` existe et fonctionne (Step 9).

**Ce qu'il faudra** : Connecter le frontend Angular au backend Fastify — remplacer les données mock par de vrais appels `HttpClient` vers `/api/rss/fetch`.

**Quand** : Étape 10 (intégration Angular ↔ Backend RSS).

### TODO 5.7 — Audit `theme()` dans les SCSS de composants

**Situation** : Découvert à l'étape 5 que la fonction Tailwind `theme()` ne fonctionne pas dans les fichiers SCSS de composants Angular (compilation isolée). Corrigé dans `ai-action-panel.scss` et `generated-content.scss` en utilisant les valeurs hex.

**Ce qu'il faudra** : Auditer tous les SCSS de composants existants pour remplacer d'éventuels `theme()` restants par les valeurs hex.

**Quand** : Sous-étape autonome.

### TODO 6.7 — Page de génération guidée (wizard)

**Problème** : Le flux actuel "sélectionner des articles → cliquer Générer" n'est pas intuitif. L'utilisateur doit deviner qu'il faut d'abord sélectionner des articles dans la page articles. Un bandeau guidage a été ajouté comme amélioration rapide.

**Ce qu'il faudrait** : Une page dédiée `/projects/:id/generate` avec un wizard pas-à-pas : voir les articles → sélectionner → choisir le format → générer. L'onglet "Générer" dans la BottomNav pointerait vers cette page.

**Quand** : Sous-étape autonome.

---

## 13. Glossaire Angular / TypeScript

| Terme | Définition |
|---|---|
| `Component` | Brique d'interface : un template HTML + une classe TypeScript + des styles. Gère l'affichage et les interactions utilisateur. |
| `Service` | Classe injectable qui contient la logique métier et la gestion des données. Singleton par défaut (`providedIn: 'root'`). |
| `Signal` | Valeur réactive qui notifie automatiquement les composants quand elle change. Remplace RxJS pour les cas simples. |
| `Computed` | Signal dérivé qui se recalcule automatiquement quand ses dépendances changent. Doit rester pur (pas d'effets de bord). |
| `toSignal()` | Fonction qui convertit un Observable (flux RxJS) en Signal Angular. Indispensable pour les données provenant de sources externes (paramètres de route, requêtes HTTP, événements router). Le Signal se met à jour automatiquement à chaque émission de l'Observable. |
| `effect()` | Fonction qui exécute un callback chaque fois que les signaux qu'elle lit changent. Utilisée pour les effets de bord réactifs (appeler un service quand un paramètre change). Remplace `ngOnInit` quand l'effet doit se ré-exécuter au cours de la vie du composant. |
| `snapshot` | Lecture ponctuelle d'un paramètre de route (`route.snapshot.paramMap`). Lit la valeur une seule fois à la création. Adapté aux guards/resolvers ou quand le composant est toujours détruit/recréé. |
| `Route` | Association entre une URL et un composant. Définies dans `app.routes.ts`. |
| `Guard` | Fonction qui protège l'accès à une route (ex: vérifier qu'un projet existe avant d'y accéder). |
| `Interceptor` | Fonction qui intercepte les requêtes HTTP sortantes (ex: ajouter un token d'authentification). |
| `Pipe` | Transformateur de données dans le template (ex: `{{ date \| relativeTime }}`). Pur par défaut (recalculé uniquement quand l'entrée change). |
| `Directive` | Attribut qui modifie le comportement d'un élément HTML existant. |
| `DI (Dependency Injection)` | Mécanisme Angular qui fournit automatiquement les services aux composants qui en ont besoin via `inject()`. |
| `Standalone Component` | Composant auto-suffisant qui déclare ses propres imports. Pas besoin de NgModule (standard depuis Angular 17+). |
| `Resolver` | Fonction qui charge des données AVANT que la route ne s'affiche. |
| `Template syntax` | `{{ }}` pour l'interpolation, `@for` / `@if` / `@switch` pour le contrôle de flux (Angular 17+). |
| `Tree-shaking` | Suppression automatique du code non utilisé au build. Réduit la taille du bundle final. |
| `Many-to-Many` | Relation où une entité peut être liée à N autres et inversement. Implémentée via une table de liaison (junction table). |
| `LinkedSource` | Type enrichi combinant les données du catalogue (Source) avec les données de la liaison (isActive, linkId). |
| `Set<T>` | Collection sans doublons avec recherche en O(1). Utilisé pour la sélection d'articles. |
| `Record<K, V>` | Type utilitaire TypeScript qui force l'exhaustivité : chaque valeur de K doit avoir une entrée. Utilisé pour `CONTENT_TYPE_OPTIONS`. |
| `Promise<T>` | Représente une opération asynchrone qui retournera une valeur de type T. Utilisé avec `async/await`. |
| `Bottom sheet` | Pattern mobile : panneau glissant depuis le bas de l'écran. Utilisé pour le panneau d'actions IA. |
| `Blob` | Objet représentant des données binaires en mémoire. Utilisé pour l'export de fichiers côté client. |
| `Accordion` | Pattern UI où cliquer sur un élément l'expand pour montrer son contenu, recliquer le referme. Utilisé dans l'aperçu historique du workspace. |
| `BEM` | Convention de nommage CSS : Block Element Modifier (`.block`, `.block__element`, `.block--modifier`). En SCSS, le `&` référence le sélecteur parent : `&--modifier` génère `.block--modifier`. Sans `&`, on crée un sélecteur descendant qui ne matchera pas. |
| `Breakpoint CSS` | Point de rupture qui active des styles différents selon la largeur de l'écran. Tailwind utilise `lg:` pour ≥1024px. Un switch de layout purement CSS ne nécessite aucun JavaScript. |
| `npm workspaces` | Fonctionnalité native de npm (depuis v7) permettant de gérer plusieurs packages dans un seul repo. Les dépendances sont hoistées (remontées) dans un `node_modules/` unique à la racine. Chaque workspace a son propre `package.json`. |
| `Hoisting` | Mécanisme npm workspaces qui remonte les dépendances partagées dans le `node_modules/` racine. Si `client` et `api` utilisent tous les deux `typescript`, il n'est installé qu'une seule fois. |
| `Fake timers` | Technique de test qui remplace `Date`, `setTimeout`, `setInterval` par des implémentations contrôlables. `vi.useFakeTimers()` active le mode, `vi.advanceTimersByTime(ms)` avance le temps. Indispensable pour tester du code asynchrone de façon déterministe. |
| `vi.fn()` | Crée une fonction mock dans Vitest. `.toHaveBeenCalledWith()` vérifie les arguments, `.toHaveBeenCalledTimes()` le nombre d'appels, `.mockClear()` remet les compteurs à zéro. |
| `Factory function (test)` | Fonction utilitaire qui crée des objets de test avec des valeurs par défaut. `buildArticle({ title: 'Custom' })` crée un Article complet en ne spécifiant que ce qui change. Pattern `Partial<T>` + spread. |
| `Zoneless` | Mode Angular 21 par défaut où Zone.js n'est plus chargé. Les utilitaires historiques (`fakeAsync`, `tick`) ne fonctionnent plus — remplacés par les fake timers natifs de Vitest. |
| `Fastify` | Framework HTTP pour Node.js, léger et performant. Utilise un système de plugins pour organiser les routes. Chaque plugin est une fonction async qui reçoit l'instance Fastify. Alternative moderne à Express. |
| `ESM (ECMAScript Modules)` | Système de modules standard de JavaScript (`import`/`export`). Activé par `"type": "module"` dans `package.json`. Les imports doivent inclure l'extension `.js`. Remplace CommonJS (`require`/`module.exports`). |
| `CommonJS (CJS)` | Ancien système de modules Node.js (`require()`/`module.exports`). Encore présent dans beaucoup de packages npm mais progressivement remplacé par ESM. |
| `CORS` | Cross-Origin Resource Sharing — protection du navigateur qui bloque les requêtes vers un domaine/port différent de celui de la page. Résolu en dev par le proxy Angular, en prod par un même domaine ou des headers CORS. |
| `Proxy (dev)` | Mécanisme de `ng serve` qui redirige certaines URLs vers un autre serveur. `proxy.conf.json` redirige `/api/*` vers Fastify (port 3000). N'existe qu'en dev — jamais déployé en production. |
| `DTO (Data Transfer Object)` | Interface TypeScript qui définit la forme des données échangées entre couches (service → route → client). N'a pas de logique, uniquement des propriétés typées. Placé dans le dossier `models/`. |
| `tsx` | Outil qui exécute du TypeScript directement sans étape de compilation préalable. `tsx watch` relance automatiquement le serveur à chaque modification — équivalent de `ng serve` pour le backend. |
| `feed-parser` | Package `@rowanmanning/feed-parser` qui parse du XML RSS/Atom en objets JavaScript structurés. Ne fait que le parsing (pas le téléchargement) — on utilise `fetch` natif pour la partie réseau (SRP). |
| `fetch (Node.js)` | API native de Node.js (depuis v21) pour faire des requêtes HTTP. Équivalent du `fetch` du navigateur. Pas besoin d'installer de librairie externe (axios, got). |
| `verbatimModuleSyntax` | Option TypeScript qui impose de distinguer `import type { X }` (type uniquement, disparaît à la compilation) de `import { X }` (code runtime). Rend explicite ce qui est du typage et ce qui est du code. |
| `import type` | Import TypeScript réservé aux types. Supprimé à la compilation — ne génère aucun code JavaScript. Obligatoire avec `verbatimModuleSyntax` pour les imports qui ne sont utilisés que comme types. |
| `@types/node` | Package npm contenant les définitions de types TypeScript pour les APIs Node.js (`process`, `console`, `Buffer`, etc.). La version majeure doit correspondre à la version majeure de Node.js installée. |