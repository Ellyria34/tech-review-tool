# 🏗️ TechReviewTool — Document d'Architecture et de Méthodologie

> **Nom du projet** : TechReviewTool — Agrégateur intelligent de veille technologique
> **Date de création** : 14 février 2026
> **Auteur** : Ellyria34 - Sarah LLEON
> **Statut** : Phase 1 (frontend) terminée ✅ — Phase 2 (backend) en cours — Step 13 en cours (E2E tests ✅, sécurité/RGPD en cours)

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
- Permet de **sélectionner des articles** dans les résultats (maximum 15 pour la génération IA)
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
| **Angular** | **21.2.0** (Active, support jusqu'en mai 2027) | Framework structuré avec TypeScript natif, injection de dépendances, Signals comme paradigme réactif. Structure forte et opinionated, idéal pour les applications d'entreprise. Mis à jour de 21.1.4 → 21.2.0 suite au correctif CVE XSS i18n (GHSA-prjf-86w9-mfqv). |
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
| **Mistral AI API** | `mistral-small-latest` | Provider IA principal. API REST chat completions. Appelé avec `fetch` natif (pas de SDK). Temperature 0.4 pour un équilibre factualité/créativité. |

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

### 2.11 Pourquoi Mistral comme premier provider IA ?

| Provider | Forces | Faiblesses |
|---|---|---|
| **OpenAI (GPT)** | Très populaire, documentation abondante | Payant dès le premier token, pas européen |
| **Anthropic (Claude)** | Excellent en rédaction, 5$ crédit gratuit | SDK recommandé, setup plus complexe |
| **Mistral** | Français, API simple, quota gratuit, bons résultats en français | Communauté plus petite |

**Choix : Mistral** — Clé API disponible immédiatement, résultats de qualité en français (logique pour du contenu francophone), API REST standard sans SDK. Le Strategy Pattern permet d'ajouter Claude ou GPT plus tard sans toucher au code existant.

### 2.12 Pourquoi `fetch` natif plutôt que le SDK Mistral ?

Le SDK `@mistralai/mistralai` est disponible sur npm. On utilise `fetch` natif pour les mêmes raisons que pour le RSS :

- **Zéro dépendance** — moins de surface d'attaque, moins de maintenance
- **Compréhension** — on voit exactement ce qui est envoyé (headers, body, endpoint)
- **Portabilité** — le même code fonctionne pour n'importe quelle API REST (Claude, GPT, Ollama)
- **SRP** — le provider ne dépend que de `fetch`, pas d'une abstraction tierce

Un SDK devient utile quand l'API est complexe (streaming, retry automatique, pagination). Pour un simple POST → réponse JSON, `fetch` suffit.

### 2.13 Pourquoi Playwright pour les tests E2E ?

| Critère | Playwright | Cypress | Selenium |
|---|---|---|---|
| **Créé par** | Microsoft (2020) | Cypress.io (2017) | Selenium HQ (2004) |
| **Navigateurs** | Chromium + Firefox + WebKit | Chromium + Firefox (WebKit expérimental) | Tous via WebDriver |
| **Vitesse** | Très rapide (parallèle natif) | Moyen (séquentiel par défaut) | Lent |
| **Auto-waiting** | Oui | Oui | Non |
| **Multi-onglets** | Oui | Non | Limité |
| **TypeScript** | Natif | Natif | Via config |

**Choix : Playwright** — auto-waiting natif (pas de `sleep()`), multi-navigateurs, parallélisation, TypeScript natif, maintenance Microsoft. Installé à la racine du monorepo (les tests E2E testent l'application entière, pas un workspace).

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

### 4.2 Sélection avec Set (+ limite max)

La sélection d'articles utilise un `Set<string>` pour des recherches en O(1), avec une limite de sélection pour la génération IA :

```typescript
// Constante exportée — alignée avec la validation backend (MAX_ARTICLES = 15)
export const MAX_ARTICLE_SELECTION = 15;

private _selectedIds = signal(new Set<string>());
readonly isSelectionFull = computed(() => this.selectedCount() >= MAX_ARTICLE_SELECTION);

toggleSelection(id: string): void {
  this._selectedIds.update(set => {
    const newSet = new Set(set);
    if (newSet.has(id)) {
      newSet.delete(id);        // Deselect always allowed
    } else if (newSet.size < MAX_ARTICLE_SELECTION) {
      newSet.add(id);           // Select only if under limit
    }
    return newSet;
  });
}
```

**Double validation** : le frontend empêche la sélection au-delà de 15 (UX), le backend refuse les requêtes avec plus de 15 articles (sécurité). On ne fait jamais confiance au client.

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

**`effect()` vs `ngOnInit()` — quand utiliser lequel ?**

| Situation | Outil | Pourquoi |
|---|---|---|
| Composant toujours détruit/recréé au changement de route | `ngOnInit` + `snapshot` | Simple, suffisant |
| Composant qui peut survivre au changement de param de route | `effect()` + `toSignal` | Réactif, se met à jour automatiquement |

**Exemple concret (bug corrigé à l'étape 12)** : `ProjectWorkspace` utilise `toSignal(route.paramMap)` pour rendre `projectId` réactif. Mais `ngOnInit` avec `snapshot` ne se ré-exécutait pas quand on naviguait entre projets → le compteur d'historique affichait l'ancien projet. Remplacé par `effect()` qui réagit automatiquement aux changements.

### 4.5 Génération IA — flux HTTP vers signaux

La génération de contenu IA utilise `async/await` avec un appel HTTP réel vers le backend :

```typescript
async generate(type: ContentType, articles: Article[], projectId: string): Promise<GeneratedContent> {
  this._isGenerating.set(true);
  this._lastGenerated.set(null);
  this._generateError.set(null);
  try {
    const request = this.buildRequest(type, articles);         // Article[] → DTO
    const response = await firstValueFrom(                     // HTTP POST
      this.aiApiService.generate(request)
    );
    const content = this.mapResponseToContent(                 // DTO → GeneratedContent
      response, articles, projectId
    );
    this._generatedContents.update(contents => [...contents, content]);
    return content;
  } catch (error: unknown) {
    this._generateError.set(this.extractErrorMessage(error));  // HTTP status → French message
    throw error;
  } finally {
    this._isGenerating.set(false);
  }
}
```

Le service expose un signal `isGenerating` consommé par le composant pour afficher un spinner et bloquer les interactions pendant la génération, et un signal `generateError` pour afficher les erreurs avec un bouton "Réessayer".

### 4.6 Intégration backend — flux HTTP vers signaux

Le flux complet de récupération des articles réels :

```
ArticleListComponent.loadArticles()
  → ArticleService.fetchArticlesForProject(projectId)
    → SourceService.getByProject(projectId)     // Récupère les sources actives
    → RssApiService.fetchMultipleFeeds(urls)     // POST /api/rss/fetch-multiple
      → HttpClient.post()                        // Observable HTTP
      → firstValueFrom()                         // Conversion Observable → Promise
    → mapFeedResultsToArticles()                 // DTO backend → modèle frontend
    → _articles.update()                         // Signal mis à jour
    → computed chain recalcule automatiquement   // projectArticles → filteredArticles → template
```

Le flux de génération IA suit le même pattern :

```
AiActionPanel.onGenerate()
  → AiService.generate(type, articles, projectId)
    → buildRequest()                              // Article[] → AiGenerateRequestDto
      → mapContentTypeToApi()                     // 'linkedin-post' → 'linkedin'
    → AiApiService.generate(request)              // POST /api/ai/generate
      → HttpClient.post()                         // Observable HTTP
      → firstValueFrom()                          // Conversion Observable → Promise
    → mapResponseToContent()                      // AiGenerateResponseDto → GeneratedContent
      → mapApiTypeToContentType()                 // 'linkedin' → 'linkedin-post'
    → _generatedContents.update()                 // Signal mis à jour
    → computed chain recalcule automatiquement    // projectContents → template
```

**Séparation des responsabilités (pattern répliqué pour RSS et IA)** :

| Couche | Service RSS | Service IA | Rôle |
|---|---|---|---|
| HTTP | `RssApiService` | `AiApiService` | Communication réseau uniquement — pas d'état, pas de logique |
| État | `ArticleService` | `AiService` | Stockage (signaux), mapping DTO → modèle, gestion d'erreur |
| Présentation | `ArticleListComponent` | `AiActionPanelComponent` | Affichage, états de chargement/erreur, interactions utilisateur |

### 4.7 Mapping DTO bidirectionnel (pattern découvert à l'étape 12)

Quand deux systèmes communiquent (frontend Angular, backend Fastify), les noms de champs ne correspondent pas toujours. La couche DTO traduit dans les deux sens :

```
Frontend → Backend (envoi) :
  ContentType 'linkedin-post'  →  AiContentType 'linkedin'
  Article.sourceName           →  AiArticleInputDto.source

Backend → Frontend (réception) :
  AiContentType 'linkedin'     →  ContentType 'linkedin-post'
  response.generatedAt         →  GeneratedContent.createdAt
  response.provider            →  GeneratedContent.provider (nouveau champ optionnel)
```

**Leçon** : les mocks frontend cachent les problèmes d'intégration. Quand tout reste dans le même process JavaScript, les noms sont forcément cohérents. C'est en branchant le vrai backend que les décalages apparaissent — c'est exactement pour ça que la couche DTO et les méthodes de mapping existent.

**Pattern `firstValueFrom()`** : `HttpClient` retourne un `Observable` qui émet une seule valeur. `firstValueFrom()` le convertit en `Promise` pour utiliser `async/await` avec `try/finally` (pattern établi pour les deux services).

**Tolérance aux pannes partielles** : le backend RSS utilise `Promise.allSettled()` — si 1 flux sur 10 échoue, les 9 autres retournent leurs articles normalement. Le frontend affiche une bannière d'avertissement pour les flux en erreur. Pour l'IA, les erreurs HTTP sont mappées vers des messages français avec un bouton "Réessayer".

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
- `ArticleService` gère les articles et les filtres, `AiService` gère la génération IA — deux domaines distincts
- `RssApiService` et `AiApiService` gèrent uniquement la communication HTTP — les services métier gèrent l'état, les filtres et le mapping DTO → modèle
- Les opérations localStorage sont factorisées dans `storage.helper.ts`, pas dupliquées dans chaque service
- Chaque AI provider (Mock, Mistral) a sa propre classe — l'orchestration est dans `AiService`, pas dans les providers

### O — Open/Closed (Ouvert/Fermé)

On étend le comportement sans modifier le code existant. Exemple concret : le **Strategy Pattern IA**. Pour ajouter un provider (Claude, Ollama, GPT), on crée un fichier qui `implements AiProvider` et on ajoute un `case` dans la factory. Ni la route, ni le service, ni le frontend ne changent.

```typescript
// Ajouter un provider = 1 fichier + 1 ligne
case 'claude': return new ClaudeAiProvider();  // ← seul changement
```

### L — Liskov Substitution

Un service implémentant une interface peut remplacer un autre. Exemple : `MockAiProvider` et `MistralAiProvider` implémentent tous les deux `AiProvider`. Le code appelant ne fait pas la différence — il appelle `provider.generate()` sans savoir quelle implémentation est active.

### I — Interface Segregation (Ségrégation des interfaces)

Plein de petits services spécialisés plutôt qu'un "God Service" qui fait tout : `ProjectService`, `SourceService`, `ArticleService`, `RssApiService`, `AiApiService`, `AiService` — chacun a un domaine clair. L'interface `AiProvider` ne contient que ce dont les providers ont besoin (`name` + `generate()`), pas de méthodes superflues.

### D — Dependency Inversion

Les composants dépendent d'abstractions (interfaces/tokens), pas d'implémentations concrètes. Angular le gère nativement via son système d'injection de dépendances :

```typescript
{ provide: ProjectService, useClass: MockProjectService }
```

Côté backend, `AiService` dépend de l'interface `AiProvider`, pas de `MistralAiProvider` directement. La factory injecte l'implémentation concrète à runtime.

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
│   │   │   │       ├── ai-api.service.ts    # Client HTTP pour l'API IA backend
│   │   │   │       ├── rss-api.service.ts   # Client HTTP pour l'API RSS backend
│   │   │   │       └── storage.helper.ts
│   │   │   ├── features/          # Domaines fonctionnels
│   │   │   │   ├── projects/      # CRUD projets
│   │   │   │   ├── sources/       # Gestion des sources RSS (Many-to-Many)
│   │   │   │   ├── articles/      # Liste d'articles, filtres, sélection
│   │   │   │   ├── ai-actions/    # Génération IA (synthèse, revue de presse, LinkedIn)
│   │   │   │   └── history/       # Historique des générations par projet
│   │   │   └── shared/            # Composants réutilisables, pipes, directives, modèles
│   │   │       ├── data/          # Données centralisées (catégories)
│   │   │       ├── models/        # Interfaces TypeScript
│   │   │       │   ├── ai-api.model.ts        # DTOs backend IA (AiGenerateRequestDto, ResponseDto)
│   │   │       │   ├── article.model.ts
│   │   │       │   ├── generated-content.model.ts
│   │   │       │   ├── project.model.ts
│   │   │       │   ├── rss-api.model.ts       # DTOs backend RSS (RssArticleDto, FeedResult)
│   │   │       │   ├── source.model.ts
│   │   │       │   └── index.ts               # Barrel exports
│   │   │       └── pipes/         # RelativeTimePipe
├── api/                           ← Backend Fastify (TypeScript)
│   ├── src/
│   │   ├── models/
│   │   │   ├── ai.model.ts           # Interface AiProvider + types partagés (Strategy Pattern)
│   │   │   └── rss-article.model.ts   # DTO article RSS + types batch
│   │   ├── providers/
│   │   │   ├── mistral-ai.provider.ts # Provider Mistral (API chat completions)
│   │   │   └── mock-ai.provider.ts    # Provider mock (dev, pas de clé API)
│   │   ├── routes/
│   │   │   ├── ai.routes.ts           # POST /api/ai/generate (max 15 articles)
│   │   │   └── rss.routes.ts         # GET + POST /api/rss/*
│   │   ├── services/
│   │   │   ├── ai.service.ts          # Orchestration IA + factory provider
│   │   │   └── rss.service.ts         # Fetch + parsing RSS/Atom (single + batch)
│   │   └── server.ts                  # Point d'entrée Fastify
│   ├── .env.example               # Template variables d'env (committé, sans secrets)
│   ├── package.json               # Dépendances Fastify + feed-parser
│   └── tsconfig.json              # Config TypeScript strict (NodeNext)
├── e2e/                           ← Tests E2E Playwright
│   ├── smoke.spec.ts                  # App Shell, navigation responsive, état vide
│   ├── projects.spec.ts               # CRUD projet complet
│   ├── sources.spec.ts                # Gestion des sources (ajout, toggle, suppression)
│   ├── articles.spec.ts               # Chargement, filtres, sélection
│   └── generation.spec.ts             # Génération IA (synthèse, revue, LinkedIn)
├── playwright.config.ts           # Configuration E2E (navigateurs, serveurs, timeouts)
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

### 6.3 Architecture backend (api/)

Le backend suit une architecture en couches séparant les responsabilités :

| Couche | Dossier | Rôle | Connaît HTTP ? |
|---|---|---|---|
| **Models** | `src/models/` | Contrats de données (interfaces TypeScript / DTOs) | Non |
| **Providers** | `src/providers/` | Implémentations concrètes des interfaces (Strategy Pattern) | Non |
| **Services** | `src/services/` | Logique métier (fetch, parsing, orchestration, factory) | Non |
| **Routes** | `src/routes/` | Couche HTTP (validation requêtes, codes de statut, formatage réponses) | Oui |
| **Server** | `src/server.ts` | Point d'entrée — crée l'instance Fastify et enregistre les routes | Oui |

**Endpoints disponibles** :

| Méthode | Route | Description |
|---|---|---|
| `GET` | `/api/health` | Health check — retourne `{ status: "ok" }` |
| `GET` | `/api/rss/fetch?url=` | Fetch et parse un seul flux RSS/Atom |
| `POST` | `/api/rss/fetch-multiple` | Batch fetch — body `{ urls: string[] }`, max 20 URLs |
| `POST` | `/api/ai/generate` | Génère du contenu IA — body `{ type, articles, projectName? }`, max 15 articles |

---

## 7. Méthodologie de travail

### 7.1 Conventional Commits

Chaque commit suit le format : `type(scope): description`

| Type | Quand | Exemple |
|---|---|---|
| `feat` | Nouvelle fonctionnalité | `feat(projects): add project list component` |
| `fix` | Correction de bug | `fix(workspace): use effect() instead of ngOnInit for project context` |
| `chore` | Maintenance, config | `chore: add .gitattributes for LF normalization` |
| `docs` | Documentation | `docs: update README with Step 12 completion` |
| `style` | Formatage (pas de logique) | `style: fix indentation in app.html` |
| `refactor` | Refactoring sans changement fonctionnel | `refactor: restructure to monorepo with npm workspaces` |
| `test` | Ajout/modification de tests | `test(ai): rewrite tests for real backend API integration` |

### 7.2 Branching Strategy

Pour un projet solo avec montée en compétence :

- `main` — code stable, toujours fonctionnel
- `feat/xxx` — branches de feature (une par étape ou sous-étape)

### 7.3 Workflow quotidien

```
1. git checkout -b feat/step-12-ai-integration    # Nouvelle branche
2. git push -u origin feat/step-12-ai-integration # Lier branche locale ↔ distante
3. Coder + tester localement                      # cd client && ng serve
4. git add . && git commit                        # Commits réguliers
5. git push                                       # Push (sans préciser origin grâce au -u)
6. Créer une Pull Request sur GitHub              # Revue de code
7. Merger dans main                               # Valider
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
| Clés API dans `.env` | Les secrets (`MISTRAL_API_KEY`) sont dans `.env` (non committé). Seul `.env.example` (template sans secrets) est versionné |
| `--env-file` natif | Node.js 22 charge le `.env` nativement — pas de package `dotenv` (moins de surface d'attaque) |
| Dépendances auditées | `npm audit` régulier pour détecter les vulnérabilités. Dependabot activé sur GitHub pour les alertes automatiques |
| Intégrité des paquets | `package-lock.json` committé, vérification SHA-512 automatique par npm |
| CSP (Content Security Policy) | Headers de sécurité pour empêcher les injections XSS |
| Liens externes sécurisés | `target="_blank"` toujours avec `rel="noopener noreferrer"` |
| Clés localStorage non sensibles | Les clés de stockage ne contiennent pas de données personnelles |
| Limite batch RSS | L'endpoint `POST /api/rss/fetch-multiple` refuse plus de 20 URLs par requête (protection contre les abus) |
| Limite articles IA | L'endpoint `POST /api/ai/generate` refuse plus de 15 articles (protection tokens API). Double validation : frontend bloque la sélection, backend valide la requête |
| Correctifs de sécurité | Angular mis à jour de 21.1.5 → 21.2.0 pour corriger CVE XSS i18n (GHSA-prjf-86w9-mfqv). Commit dédié avec référence CVE pour la traçabilité |

---

## 9. Accessibilité (a11y)

### Objectif : WCAG 2.1 niveau AA

| Règle | Application |
|---|---|
| Contraste | Ratio minimum 4.5:1 pour le texte |
| Navigation clavier | Tous les éléments interactifs accessibles au clavier (Tab, Enter, Escape) |
| Lecteurs d'écran | Attributs ARIA sur les composants dynamiques (`role="dialog"`, `role="radio"`, `role="modal"`, `aria-checked`, `aria-busy`, `aria-label`, `aria-disabled`) |
| Focus visible | Indicateur de focus toujours visible (`focus-visible` avec outline teal) |
| Sémantique HTML | Utiliser les bonnes balises (`<nav>`, `<main>`, `<article>`, `<button>`) |
| Labels | Tous les champs de formulaire ont un label associé |
| Feedback accessible | `role="status"` pour les messages de confirmation (ex: "Copié !"), `role="alert"` pour les erreurs |
| États de chargement | `role="status"` avec `aria-live="polite"` sur les messages de chargement dynamiques |
| Événements clavier | `(click)` toujours accompagné de `(keydown)` ou `(keyup)` (ESLint enforce cette règle) |
| Sélection désactivée | `aria-disabled` sur les cartes articles quand la limite de sélection est atteinte |

---

## 10. Stratégie de tests

### Approche intercalée (décidée le 24 février 2026)

Plutôt que de tout tester à la fin, les tests sont **intercalés** entre les phases de développement :

| Phase | Type de test | Outil | Quoi tester |
|---|---|---|---|
| **Étape 8** (fin Phase 1) | Unitaire + Composant | Vitest + Angular Testing Library | Services, pipes, logique métier frontend — avec les mocks actuels |
| **Étapes 10-12** (pendant intégration) | Unitaire frontend mis à jour | Vitest | Services avec mocks des services HTTP (RssApiService, AiApiService) |
| **Étape 13** (après intégration) | E2E | Playwright | ✅ 19 tests : parcours complets (projet CRUD, sources, articles RSS, génération IA) × 3 navigateurs |

### Fichiers de test unitaires — Étapes 8 + 10 + 12

| Fichier | Tests | Ce qui est couvert |
|---|---|---|
| `app.spec.ts` | 3 | Layout shell (header, sidebar, bottom-nav, router-outlet) |
| `relative-time.pipe.spec.ts` | 16 | 5 branches temporelles, fuseaux horaires |
| `project.service.spec.ts` | 19 | CRUD complet, validation, cascade delete, timestamps |
| `source.service.spec.ts` | 33 | Catalogue CRUD, liaisons Many-to-Many, computed queries |
| `article.service.spec.ts` | 38 | Chaîne computed, filtres combinés, sélection, déduplication, fetch backend, erreurs partielles |
| `ai.service.spec.ts` | 34 | Backend API calls, DTO mapping, type translation, error handling (HTTP 400/429/500/503/0), persistence, cascade |
| `article-filters.spec.ts` | 8 | Debounce RxJS 300ms, distinctUntilChanged, cleanup destroy$ |
| **Total** | **151** | **4/4 services, 1/1 pipe, 2 composants (les seuls avec logique)** |

### Fichiers de test E2E — Étape 13

| Fichier | Tests | Ce qui est couvert |
|---|---|---|
| `e2e/smoke.spec.ts` | 3 | App shell charge, navigation responsive (sidebar vs header), état vide |
| `e2e/projects.spec.ts` | 5 | CRUD complet : créer, afficher, ouvrir workspace, modifier, supprimer |
| `e2e/sources.spec.ts` | 5 | État vide, ajouter source, toggle on/off, supprimer (window.confirm), compteur |
| `e2e/articles.spec.ts` | 4 | Chargement RSS réel, filtre keyword, reset filtres, sélection + panel IA |
| `e2e/generation.spec.ts` | 3 | Générer synthèse, revue de presse, post LinkedIn (provider mock) |
| **Total** | **19** | **5 parcours critiques × 3 navigateurs (Chromium, Firefox, Mobile Chrome)** |

### Techniques de test unitaires

| Technique | Pourquoi |
|---|---|
| `vi.useFakeTimers()` + `vi.setSystemTime()` | Contrôler `new Date()`, `setTimeout`, `debounceTime` — tests déterministes |
| `vi.fn()` + `.toHaveBeenCalledWith()` | Mocks de fonctions — vérifier les appels et arguments |
| `vi.advanceTimersByTime(ms)` | Avancer le temps pour résoudre debounce/delay sans attendre |
| Factory functions (`buildArticle()`, `buildResponse()`) | `Partial<T>` + spread — créer des objets de test lisibles |
| `localStorage.clear()` dans `beforeEach` + `afterEach` | Double nettoyage pour l'isolation entre tests |
| Mock `RssApiService` / `AiApiService` avec `vi.fn()` | Isolation des tests — pas de vraie requête HTTP, réponse contrôlée |
| `of()` de RxJS pour les mocks Observable | Retourne un Observable synchrone — simule `HttpClient.post()` sans réseau |
| `throwError()` de RxJS pour les mocks d'erreur | Simule une erreur HTTP — teste `HttpErrorResponse` et le mapping vers messages français |

### Techniques E2E

| Technique | Pourquoi |
|---|---|
| `page.locator('main')` scoping | La sidebar duplique les textes sur desktop — scoper sur `<main>` évite les ambiguïtés `strict mode violation` |
| `getByRole('button', { name: ... })` | Utilise les `aria-label` existants — teste l'accessibilité en même temps que la fonctionnalité |
| `page.on('dialog', ...)` | Les `window.confirm()` natifs sont invisibles aux sélecteurs CSS — Playwright a une API dédiée |
| `waitFor('visible').catch(() => {})` | Gère la race condition du loading RSS : si le spinner est déjà parti, le `catch` évite l'échec |
| `test.describe.configure({ mode: 'serial' })` | Les tests de génération chargent le même flux RSS — le mode séquentiel évite la saturation |
| `AI_PROVIDER: 'mock'` dans webServer.env | Résultats déterministes, pas de clé API nécessaire, 400-900ms au lieu de 5-30s |

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
| **10** | Intégration Angular ↔ Backend RSS (remplacement des mocks articles) | ✅ Terminé |
| **11** | Backend : endpoint IA avec Strategy Pattern (Mistral + Mock) | ✅ Terminé |
| **12** | Intégration Angular ↔ Backend IA (DTOs, mapping, erreurs, limite sélection, 151 tests) | ✅ Terminé |
| **13** | Tests E2E (Playwright) ✅, sécurité 🔄, RGPD, build production | 🔄 En cours |

---

## 12. TODOs — Améliorations reportées

### TODO 3.5 — UI réutilisation du catalogue de sources

**Problème** : Créer plusieurs projets sur le même thème oblige à recréer les mêmes sources à chaque fois.

**Architecture** : Le Many-to-Many supporte déjà ce cas. `SourceService.getAvailableForProject()` retourne les sources du catalogue non encore liées au projet.

**Ce qu'il manque** : Un bouton "📂 Depuis le catalogue" dans la page sources, qui affiche les sources disponibles et permet de les lier en un clic.

**Quand** : Sous-étape autonome.

### ~~TODO 5.7 — Audit `theme()` dans les SCSS de composants~~ ✅ Résolu

**Situation** : Découvert à l'étape 5 que la fonction Tailwind `theme()` ne fonctionne pas dans les fichiers SCSS de composants Angular (compilation isolée). Corrigé dans `ai-action-panel.scss` et `generated-content.scss` en utilisant les valeurs hex.

**Résolution** : Audit complet effectué à l'étape 13.5 via `Get-ChildItem -Filter *.scss | Select-String "theme("`. Résultat : aucun `theme()` restant. Tous ont été corrigés aux étapes précédentes.

### TODO 6.7 — Page de génération guidée (wizard)

**Problème** : Le flux actuel "sélectionner des articles → cliquer Générer" n'est pas intuitif. L'utilisateur doit deviner qu'il faut d'abord sélectionner des articles dans la page articles. Un bandeau guidage a été ajouté comme amélioration rapide.

**Ce qu'il faudrait** : Une page dédiée `/projects/:id/generate` avec un wizard pas-à-pas : voir les articles → sélectionner → choisir le format → générer. L'onglet "Générer" dans la BottomNav pointerait vers cette page.

**Quand** : Sous-étape autonome.

### TODO 10.1 — Détection automatique des flux RSS

**Problème** : L'utilisateur doit connaître l'URL exacte du flux RSS d'un site (ex: `cert.ssi.gouv.fr/feed/` au lieu de `cert.ssi.gouv.fr/`). Beaucoup de sites modernes (SPA React/Next.js comme Anthropic) n'ont pas de flux RSS du tout.

**Solution envisagée** : Le backend reçoit une URL de site web → télécharge la page HTML → cherche `<link rel="alternate" type="application/rss+xml">` dans le `<head>` → retourne l'URL du flux RSS. Si aucun flux trouvé, retourne une erreur explicite avec les conventions courantes à essayer (`/feed`, `/rss`, `/atom.xml`).

**Quand** : Sous-étape autonome.

### TODO 11.x — Enrichissement du contenu avant génération

**Problème** : L'IA reçoit le snippet RSS (souvent les 200 premiers caractères tronqués). Suffisant pour une synthèse ou une revue de presse, insuffisant pour un post LinkedIn ou un article original — l'IA n'a pas assez de contexte.

**Solution envisagée** : Avant d'envoyer à l'IA, le backend télécharge chaque article sélectionné et extrait le contenu textuel via `mozilla/readability` (même librairie que le mode lecture de Firefox). Le champ `summary` contiendra le contenu complet au lieu du snippet. Si le fetch échoue (paywall, 403, Cloudflare), le snippet RSS sert de fallback.

**Quand** : Sous-étape autonome. L'interface `AiProvider` ne change pas — seul le contenu de `summary` sera plus riche.

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
| `Record<K, V>` | Type utilitaire TypeScript qui force l'exhaustivité : chaque valeur de K doit avoir une entrée. Utilisé pour `CONTENT_TYPE_OPTIONS` et les mappings de types DTO. |
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
| `Factory function (test)` | Fonction utilitaire qui crée des objets de test avec des valeurs par défaut. `buildArticle({ title: 'Custom' })` ou `buildResponse({ provider: 'mistral' })` — pattern `Partial<T>` + spread. |
| `Zoneless` | Mode Angular 21 par défaut où Zone.js n'est plus chargé. Les utilitaires historiques (`fakeAsync`, `tick`) ne fonctionnent plus — remplacés par les fake timers natifs de Vitest. |
| `Fastify` | Framework HTTP pour Node.js, léger et performant. Utilise un système de plugins pour organiser les routes. Chaque plugin est une fonction async qui reçoit l'instance Fastify. Alternative moderne à Express. |
| `ESM (ECMAScript Modules)` | Système de modules standard de JavaScript (`import`/`export`). Activé par `"type": "module"` dans `package.json`. Les imports doivent inclure l'extension `.js`. Remplace CommonJS (`require`/`module.exports`). |
| `CommonJS (CJS)` | Ancien système de modules Node.js (`require()`/`module.exports`). Encore présent dans beaucoup de packages npm mais progressivement remplacé par ESM. |
| `CORS` | Cross-Origin Resource Sharing — protection du navigateur qui bloque les requêtes vers un domaine/port différent de celui de la page. Résolu en dev par le proxy Angular, en prod par un même domaine ou des headers CORS. |
| `Proxy (dev)` | Mécanisme de `ng serve` qui redirige certaines URLs vers un autre serveur. `proxy.conf.json` redirige `/api/*` vers Fastify (port 3000). N'existe qu'en dev — jamais déployé en production. |
| `DTO (Data Transfer Object)` | Interface TypeScript qui définit la forme des données échangées entre couches (service → route → client). N'a pas de logique, uniquement des propriétés typées. Le DTO est un contrat fidèle à la réponse API ; le modèle métier frontend est adapté aux besoins de l'UI. Les noms de champs peuvent différer entre DTO et modèle — le mapping traduit entre les deux. |
| `Mapping bidirectionnel` | Traduction dans les deux sens entre les types frontend et les types backend. Exemple : `ContentType 'linkedin-post'` (frontend) ↔ `AiContentType 'linkedin'` (backend). Nécessaire car chaque système définit ses propres conventions de nommage. |
| `HttpClient` | Service Angular pour les requêtes HTTP. Retourne des Observables. Activé via `provideHttpClient()` dans `app.config.ts`. |
| `HttpErrorResponse` | Classe Angular qui encapsule les erreurs HTTP. Permet de détecter le code de statut (`error.status`) et de mapper vers des messages utilisateur. |
| `firstValueFrom()` | Fonction RxJS qui prend la première valeur d'un Observable et la retourne comme Promise. Utile pour convertir un appel `HttpClient` en `async/await`. L'Observable doit émettre au moins une valeur (sinon erreur). |
| `throwError()` | Fonction RxJS qui crée un Observable qui émet immédiatement une erreur. Utilisée dans les tests pour simuler des erreurs HTTP sans réseau. |
| `Promise.allSettled()` | Attend que toutes les promesses se terminent (succès ou échec). Contrairement à `Promise.all()`, ne rejette pas au premier échec — retourne le résultat individuel de chaque promesse. Utilisé pour la tolérance aux pannes partielles (batch RSS). |
| `Strategy Pattern` | Design pattern qui définit une famille d'algorithmes interchangeables via une interface commune. Une factory sélectionne l'implémentation à runtime. Dans le projet : `AiProvider` (interface) + `MockAiProvider` / `MistralAiProvider` (implémentations) + factory dans `AiService`. |
| `Provider (IA)` | Implémentation concrète de l'interface `AiProvider`. Chaque provider encapsule l'appel à une API spécifique (Mistral, Claude, mock). Le code appelant ne connaît que l'interface. |
| `Factory function` | Fonction qui crée et retourne un objet sans exposer la logique de création. `createProvider()` décide quelle classe instancier selon `AI_PROVIDER`. |
| `Prompt engineering` | Technique de rédaction des instructions envoyées à un modèle IA. Le prompt système définit le rôle et le style, le prompt utilisateur fournit les données. Chaque `ContentType` a son propre prompt. |
| `.env / .env.example` | `.env` contient les secrets (clés API) — JAMAIS committé. `.env.example` est le template committé qui documente les variables attendues. Pattern standard 12-factor app. |
| `12-factor app` | Méthodologie de développement d'applications cloud-native. Principe III : la configuration (clés API, ports) vient de l'environnement (`process.env`), pas du code source. |
| `tsx` | Outil qui exécute du TypeScript directement sans étape de compilation préalable. `tsx watch` relance automatiquement le serveur à chaque modification — équivalent de `ng serve` pour le backend. |
| `feed-parser` | Package `@rowanmanning/feed-parser` qui parse du XML RSS/Atom en objets JavaScript structurés. Ne fait que le parsing (pas le téléchargement) — on utilise `fetch` natif pour la partie réseau (SRP). |
| `fetch (Node.js)` | API native de Node.js (depuis v21) pour faire des requêtes HTTP. Équivalent du `fetch` du navigateur. Pas besoin d'installer de librairie externe (axios, got). |
| `verbatimModuleSyntax` | Option TypeScript qui impose de distinguer `import type { X }` (type uniquement, disparaît à la compilation) de `import { X }` (code runtime). Rend explicite ce qui est du typage et ce qui est du code. |
| `import type` | Import TypeScript réservé aux types. Supprimé à la compilation — ne génère aucun code JavaScript. Obligatoire avec `verbatimModuleSyntax` pour les imports qui ne sont utilisés que comme types. |
| `@types/node` | Package npm contenant les définitions de types TypeScript pour les APIs Node.js (`process`, `console`, `Buffer`, etc.). La version majeure doit correspondre à la version majeure de Node.js installée. |
| `Playwright` | Framework de tests E2E par Microsoft. Automatise un vrai navigateur (Chromium, Firefox, WebKit) pour simuler les parcours utilisateur. Auto-waiting natif — pas besoin de `sleep()` ou `waitFor()`. |
| `Test E2E (End-to-End)` | Test qui vérifie un parcours utilisateur complet dans un vrai navigateur. Contrairement aux tests unitaires (qui testent une fonction isolée), les tests E2E testent toutes les couches ensemble (UI + backend + réseau). Plus lent mais détecte les bugs d'intégration. |
| `Pyramide des tests` | Stratégie de test : beaucoup de tests unitaires (rapides, bas niveau), peu de tests E2E (lents, haut niveau). Ratio typique : 151 unitaires pour 19 E2E. Les unitaires vérifient chaque pièce, les E2E vérifient l'assemblage. |
| `Auto-waiting` | Mécanisme Playwright qui attend automatiquement qu'un élément soit visible, cliquable et stable avant d'interagir. Élimine les `sleep(2000)` et les tests flaky (instables). |
| `Strict mode (Playwright)` | Mode par défaut où Playwright refuse d'agir si un sélecteur matche plusieurs éléments. Force à écrire des sélecteurs précis. Solution courante : scoper sur `page.locator('main')`. |
| `npm audit` | Commande qui compare les versions des dépendances avec la base de données GitHub Advisory. Détecte les vulnérabilités connues. `npm audit --audit-level=high` en CI/CD bloque le déploiement si faille critique. |
| `Dependabot` | Service GitHub qui surveille les dépendances et crée automatiquement des PR quand une faille de sécurité est découverte. Filet de sécurité passif — travaille 24/7. |
| `semver (Semantic Versioning)` | Convention de versioning : `MAJOR.MINOR.PATCH`. MAJOR = breaking change, MINOR = nouvelle feature (compatible), PATCH = correctif (compatible). Le `^` dans package.json autorise minor+patch, le `~` autorise patch seulement. |
| `CVE / GHSA` | Identifiants uniques de vulnérabilités de sécurité. CVE = Common Vulnerabilities and Exposures (standard mondial). GHSA = GitHub Security Advisory (base GitHub). Un commit de correction doit référencer l'identifiant pour la traçabilité. |