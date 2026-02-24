# 🏗️ TechReviewTool — Document d'Architecture et de Méthodologie

> **Nom du projet** : TechReviewTool — Agrégateur intelligent de veille technologique
> **Date de création** : 14 février 2026
> **Auteur** : Ellyria34 - Sarah LLEON
> **Statut** : Étape 7 terminée — Planification backend en cours (étape 8 à venir)

---

## Table des matières

1. [Vision du projet](#1-vision-du-projet)
2. [Choix technologiques argumentés](#2-choix-technologiques-argumentés)
   - 2.1 Stack Frontend
   - 2.5 Stack Backend (planifié)
   - 2.6 Pourquoi un monorepo
3. [Architecture globale](#3-architecture-globale)
   - 3.1–3.4 Frontend (modèle, navigation, layout, composants)
   - 3.5 Architecture Backend — BFF (planifié)
   - 3.6 Abstraction IA — Strategy Pattern (planifié)
4. [Flux de données réactif](#4-flux-de-données-réactif)
5. [Principes SOLID appliqués à Angular/TypeScript](#5-principes-solid-appliqués-à-angulartypescript)
6. [Structure du projet](#6-structure-du-projet)
7. [Méthodologie de travail](#7-méthodologie-de-travail)
8. [Sécurité et RGPD](#8-sécurité-et-rgpd)
9. [Accessibilité (a11y)](#9-accessibilité-a11y)
10. [Stratégie de tests](#10-stratégie-de-tests)
11. [Plan d'exécution par étapes](#11-plan-dexécution-par-étapes)
12. [TODOs — Améliorations reportées](#12-todos--améliorations-reportées)
13. [Glossaire Angular / TypeScript / Backend](#13-glossaire-angular--typescript)

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

### 2.5 Stack Backend (planifié — Étape 9+)

| Technologie | Version | Justification |
|---|---|---|
| **Fastify** | **5.x** | Framework HTTP Node.js plus moderne et plus performant qu'Express. Validation JSON Schema intégrée, système de plugins propre, TypeScript-friendly. Syntaxe quasi identique à Express mais architecture plus robuste. |
| **@anthropic-ai/sdk** | **latest** | SDK officiel Anthropic pour appeler l'API Claude. Intégration TypeScript native. |
| **Ollama** | **latest** | Serveur LLM local. S'installe une fois, expose une API REST sur `localhost:11434`. Gratuit, RGPD-friendly (aucune donnée ne quitte la machine). Compatible avec les GPU NVIDIA via CUDA. |
| **rss-parser** | **latest** | Librairie Node.js pour parser les flux RSS/Atom. Gère les encodages, CDATA, namespaces — bien plus robuste que `DOMParser` côté navigateur. |
| **zod** | **latest** | Validation et typage des inputs côté serveur. Définit un schéma une fois → validation runtime + types TypeScript générés automatiquement. |
| **dotenv** | **latest** | Charge les variables d'environnement depuis un fichier `.env`. Les clés API ne sont jamais dans le code source. |

**Pourquoi Fastify plutôt qu'Express ?** Fastify est le choix recommandé pour un nouveau projet Node.js en 2026. Il est plus rapide (benchmarks), a une validation intégrée via JSON Schema, un système de plugins plus propre, et un support TypeScript natif. La syntaxe est quasi identique à Express — la migration de connaissances est immédiate.

**Pourquoi un backend Node.js plutôt que .NET ?** Le projet est un outil d'apprentissage JavaScript/TypeScript full-stack. Utiliser Node.js côté serveur permet de rester dans le même écosystème et de partager les types TypeScript entre frontend et backend (monorepo avec dossier `shared/`).

### 2.6 Pourquoi un monorepo ?

Le projet utilise un **monorepo** (frontend + backend dans le même repository) :

| Argument | Monorepo ✅ | Repos séparés ❌ |
|---|---|---|
| Types partagés | 1 source de vérité (`shared/models/`) | Duplication → désynchronisation |
| Setup développeur | 1 `git clone`, 1 workspace | 2 repos à cloner et synchroniser |
| Cohérence | 1 PR = 1 feature complète (front + back) | 2 PRs à coordonner |
| Visibilité GitHub | 1 repo montre le projet complet | Le recruteur peut ne voir que le front |
| Complexité | Simple pour un projet solo | Overkill sans équipes séparées |

**Principe YAGNI** : on peut toujours extraire le backend dans un repo séparé si un vrai besoin se présente (équipes distinctes, déploiement indépendant). L'inverse (fusionner 2 repos) est bien plus complexe.

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

### 3.5 Architecture Backend — Pattern BFF (planifié — Étape 9+)

Le backend suit le pattern **BFF (Backend For Frontend)** — un serveur dédié au service du frontend Angular :

```
┌───────────────────────────────┐
│        Angular (client)        │
│                                │
│  ArticleService → GET /api/rss │
│  AiService → POST /api/ai/gen │
│  (aucune clé API, aucun       │
│   appel RSS direct)            │
└──────────┬─────────────────────┘
           │ HTTP (même domaine ou proxy Angular)
           ▼
┌───────────────────────────────┐
│     Fastify (api) — BFF       │
│                                │
│  GET  /api/rss/fetch           │
│    → fetch RSS XML             │
│    → parse (rss-parser)        │
│    → filtrer par date          │
│    → renvoyer JSON             │
│                                │
│  POST /api/ai/generate         │
│    → valider inputs (zod)      │
│    → construire le prompt      │
│    → appeler le provider IA    │
│    → renvoyer le contenu       │
│                                │
│  🔐 Clés API en .env          │
│  🛡️ Rate limiting + CORS      │
└──────────┬─────────────────────┘
           │
     ┌─────┼──────────┐
     ▼     ▼          ▼
  Sites   Ollama    API Claude
  RSS     (local)   (cloud)
```

**Pourquoi un BFF et pas des appels directs depuis Angular ?**

1. **CORS** : les flux RSS ne renvoient pas d'en-têtes CORS — le navigateur bloque les requêtes cross-origin. Le serveur Node.js n'a pas cette restriction.
2. **Sécurité des clés API** : les clés Anthropic/OpenAI doivent rester côté serveur. Les mettre dans le code Angular les expose dans les DevTools du navigateur.
3. **Parsing robuste** : `rss-parser` côté serveur gère les XML mal formés, encodages bizarres, CDATA — bien mieux que `DOMParser` côté client.

### 3.6 Abstraction IA — Strategy Pattern (planifié — Étape 11)

Le backend utilise le **Strategy Pattern** pour supporter plusieurs fournisseurs d'IA de façon interchangeable :

```typescript
// providers/ai-provider.interface.ts
export interface AiProvider {
  readonly name: string;
  generate(prompt: string, options?: GenerateOptions): Promise<string>;
}

// Implémentations concrètes :
// providers/claude.provider.ts    → appelle api.anthropic.com
// providers/ollama.provider.ts    → appelle localhost:11434
// providers/mock.provider.ts      → retourne des données fictives (tests)
```

**Le frontend ne sait pas quel provider est utilisé** — il envoie des articles et reçoit du contenu généré. Le choix du provider est une décision du backend (configurable via variable d'environnement ou paramètre de requête).

**Avantages** :
- **SOLID-O (Open/Closed)** : ajouter un nouveau provider (ex: OpenAI, Mistral API) = 1 nouveau fichier, zéro modification du code existant
- **SOLID-L (Liskov)** : tous les providers respectent la même interface — ils sont interchangeables
- **Testabilité** : le `MockProvider` permet de tester tout le flux sans appel réseau
- **RGPD** : l'utilisateur peut choisir Ollama (local) pour ne jamais envoyer de données à l'extérieur

**Configuration matérielle pour Ollama** :
- Machine de développement : Lenovo Legion 5 Pro (AMD Ryzen 7 5800H, **NVIDIA RTX 3060 6 Go VRAM**, 8 Go RAM)
- Ollama utilise le GPU NVIDIA via CUDA → le modèle tourne dans la VRAM (6 Go), la RAM système reste libre
- Modèle recommandé : Llama 3.2 7B (~4-5 Go VRAM) → réponses en 2-5 secondes

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

```
src/
├── app/
│   ├── core/                  # Singleton : composants, services, guards, interceptors
│   │   ├── components/
│   │   │   ├── bottom-nav/    # Navigation mobile contextuelle (visible dans un projet uniquement)
│   │   │   ├── header/        # Header de l'app (mobile uniquement, masqué sur desktop)
│   │   │   └── sidebar/       # Sidebar desktop (liste projets + navigation contextuelle projet)
│   │   ├── services/
│   │   │   └── storage.helper.ts  # Helpers localStorage partagés (loadFromStorage, saveToStorage)
│   │   ├── guards/
│   │   └── interceptors/
│   ├── features/              # Domaines fonctionnels
│   │   ├── projects/          # CRUD projets
│   │   │   ├── components/    # project-list, project-card, project-form, project-workspace
│   │   │   └── services/      # project.service.ts (Signals + localStorage)
│   │   ├── sources/           # Gestion des sources RSS (Many-to-Many)
│   │   │   ├── components/    # source-list, source-card, source-form
│   │   │   └── services/      # source.service.ts (catalogue + liaisons + localStorage)
│   │   ├── articles/          # Liste d'articles, filtres, sélection
│   │   │   ├── components/    # article-list, article-card, article-filters
│   │   │   └── services/      # article.service.ts (computed chain + selection Set + mock)
│   │   ├── ai-actions/        # Génération IA (synthèse, revue de presse, LinkedIn)
│   │   │   ├── components/    # ai-action-panel (bottom sheet), generated-content (affichage + copie/export)
│   │   │   └── services/      # ai.service.ts (génération mock + localStorage)
│   │   └── history/           # Historique des générations par projet
│   │       └── components/    # history-list (page complète avec suppression)
│   ├── shared/                # Composants réutilisables, pipes, directives
│   │   ├── components/
│   │   ├── data/              # Données centralisées (catégories, mock articles)
│   │   ├── models/            # Interfaces TypeScript (ReviewProject, Source, Article, GeneratedContent...)
│   │   ├── pipes/
│   │   │   └── relative-time.pipe.ts  # "Il y a 2h", "Hier à 14h30", "20/02/2026"
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
| `refactor` | Refactoring sans changement fonctionnel | `refactor: extract localStorage helpers into storage.helper.ts` |
| `test` | Ajout/modification de tests | `test(projects): add unit tests for ProjectService` |

### 7.2 Branching Strategy

Pour un projet solo avec montée en compétence :

- `main` — code stable, toujours fonctionnel
- `feat/xxx` — branches de feature (une par étape ou sous-étape)

### 7.3 Workflow quotidien

```
1. git checkout -b feat/project-list    # Nouvelle branche
2. git push -u origin feat/project-list # Lier branche locale ↔ distante
3. Coder + tester localement            # ng serve
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
| **Choix du provider IA** | L'utilisateur peut choisir Ollama (local) pour que ses données ne quittent jamais sa machine |

### 8.2 Sécurité applicative — Frontend

| Mesure | Comment |
|---|---|
| Pas de secrets côté client | Les clés API ne sont jamais dans le code source Angular |
| Dépendances auditées | `npm audit` régulier pour détecter les vulnérabilités |
| Intégrité des paquets | `package-lock.json` committé, vérification SHA-512 automatique par npm |
| CSP (Content Security Policy) | Headers de sécurité pour empêcher les injections XSS |
| Liens externes sécurisés | `target="_blank"` toujours avec `rel="noopener noreferrer"` |
| Clés localStorage non sensibles | Les clés de stockage ne contiennent pas de données personnelles |

### 8.3 Sécurité applicative — Backend (planifié — Étape 9+)

| Mesure | Comment |
|---|---|
| **Clés API en variables d'environnement** | Fichier `.env` (dans `.gitignore`), jamais dans le code. Template `.env.example` commité. |
| **Validation des inputs** | Tous les inputs validés par `zod` avant traitement (URL RSS, articles, type de contenu) |
| **Rate limiting** | Limite le nombre de requêtes par IP/minute pour éviter les abus |
| **CORS configuré** | Seul le frontend Angular autorisé (pas de wildcard `*` en production) |
| **Pas de données personnelles transitées** | Le backend ne stocke pas d'informations utilisateur — il transforme et relaye |
| **Sanitization des URLs RSS** | Validation du format URL avant fetch pour éviter les SSRF (Server-Side Request Forgery) |

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
| **Étape 8** (avant backend) | Unitaire + Composant | Vitest + Angular Testing Library | Services, pipes, logique métier frontend — avec les mocks actuels |
| **Étape 9-12** (pendant backend) | Unitaire backend | Vitest | Routes Fastify, services RSS, providers IA |
| **Étape 13** (après intégration) | E2E | Playwright | Parcours utilisateur complets (créer projet → ajouter sources → voir articles réels → générer contenu IA) |

**Pourquoi intercaler ?** Tester les services frontend sur les mocks a de la valeur : ça vérifie que la logique métier (filtres, sélection, computed chains) est correcte indépendamment de la source de données. Quand on branchera le vrai backend, si un test casse, on saura que c'est le backend qui pose problème, pas le frontend.

---

## 11. Plan d'exécution par étapes

### Phase 1 — Frontend (en cours)

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
| **8** | Tests unitaires frontend (Vitest + Angular Testing Library) | ⬜ À faire |

### Phase 2 — Backend + Intégration

| Étape | Contenu | Statut |
|---|---|---|
| **8** | Tests unitaires frontend (Vitest + Angular Testing Library) — pont entre les deux phases | ⬜ À faire |
| **9** | Backend Fastify : setup monorepo + endpoint RSS réel | ⬜ À faire |
| **10** | Intégration Angular ↔ Backend RSS (remplacement des mocks articles) | ⬜ À faire |
| **11** | Backend : endpoint IA avec Strategy Pattern (Claude + Ollama + Mock) | ⬜ À faire |
| **12** | Intégration Angular ↔ Backend IA (remplacement des mocks génération) | ⬜ À faire |
| **13** | Tests E2E (Playwright), sécurité, RGPD, build production | ⬜ À faire |

> **Pourquoi l'étape 8 apparaît dans les deux phases ?** Elle **ferme** la Phase 1 (le frontend est complet et testé) et **ouvre** la Phase 2 (les tests valident la logique métier avant de brancher le backend — si un test casse après l'intégration, on saura que c'est le backend qui pose problème, pas le frontend).

### Transition Phase 1 → Phase 2 : restructuration monorepo (Étape 9)

À l'étape 9, le repo sera restructuré en monorepo :

```
tech-review-tool/          (racine du workspace)
├── client/                ← le code Angular actuel (src/ déplacé ici)
├── api/                   ← nouveau backend Fastify
├── shared/                ← types TypeScript partagés (interfaces Article, Source, etc.)
├── docs/                  ← documentation (inchangé)
├── package.json           ← workspace racine (npm workspaces)
└── README.md
```

Les interfaces TypeScript (`Article`, `Source`, `GeneratedContent`...) actuellement dans `src/app/shared/models/` seront déplacées dans `shared/` pour être importées par le frontend ET le backend — une seule source de vérité.

---

## 12. TODOs — Améliorations reportées

### TODO 3.5 — UI réutilisation du catalogue de sources

**Problème** : Créer plusieurs projets sur le même thème oblige à recréer les mêmes sources à chaque fois.

**Architecture** : Le Many-to-Many supporte déjà ce cas. `SourceService.getAvailableForProject()` retourne les sources du catalogue non encore liées au projet.

**Ce qu'il manque** : Un bouton "📂 Depuis le catalogue" dans la page sources, qui affiche les sources disponibles et permet de les lier en un clic.

**Quand** : Sous-étape autonome.

### ~~TODO 4.8 — Récupération RSS réelle~~ → Absorbé dans les étapes 9-10

**Décision du 24 février 2026** : Ce TODO est désormais intégré dans le plan d'exécution principal. L'étape 9 crée le backend avec l'endpoint RSS réel, l'étape 10 connecte Angular au backend. Ce n'est plus un "TODO optionnel" mais une étape à part entière.

### TODO 5.7 — Audit `theme()` dans les SCSS de composants

**Situation** : Découvert à l'étape 5 que la fonction Tailwind `theme()` ne fonctionne pas dans les fichiers SCSS de composants Angular (compilation isolée). Corrigé dans `ai-action-panel.scss` et `generated-content.scss` en utilisant les valeurs hex.

**Ce qu'il faudra** : Auditer tous les SCSS de composants existants pour remplacer d'éventuels `theme()` restants par les valeurs hex.

**Quand** : Étape 8 (audit global).

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
| `Pipe` | Transformateur de données dans le template (ex: `{{ date \| dateFormat }}`). |
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
| `Pipe` | Transformateur de données dans le template. `{{ date \| relativeTime }}` transforme une date ISO en "Il y a 2h". Pur par défaut (recalculé uniquement quand l'entrée change). |
| `Accordion` | Pattern UI où cliquer sur un élément l'expand pour montrer son contenu, recliquer le referme. Utilisé dans l'aperçu historique du workspace. |
| `toSignal()` | Convertit un Observable RxJS en Signal Angular. Utilisé pour les paramètres de route (`route.paramMap`) afin que le composant réagisse quand l'URL change sans être détruit/recréé. |
| `effect()` | Fonction qui s'exécute automatiquement quand un signal qu'elle lit change. Utilisée pour les effets de bord réactifs (ex: `setCurrentProject()` quand l'ID de route change). Préférée à `ngOnInit()` quand l'effet dépend de valeurs réactives. |
| `BEM` | Convention de nommage CSS : Block Element Modifier (`.block`, `.block__element`, `.block--modifier`). En SCSS, le `&` référence le sélecteur parent : `&--modifier` génère `.block--modifier`. Sans `&`, on crée un sélecteur descendant qui ne matchera pas. |
| `Breakpoint CSS` | Point de rupture qui active des styles différents selon la largeur de l'écran. Tailwind utilise `lg:` pour ≥1024px. Un switch de layout purement CSS ne nécessite aucun JavaScript. |
| `BEM (Block Element Modifier)` | Convention de nommage CSS : `.block`, `.block__element`, `.block--modifier`. En SCSS, on utilise `&--modifier` pour générer `.block--modifier`. Sans `&`, SCSS crée un sélecteur descendant `.block .block--modifier` qui ne fonctionne pas. |
| `Breakpoint CSS` | Seuil de largeur d'écran qui déclenche un changement de layout. Dans Tailwind, `lg:` correspond à ≥ 1024px. Utilisé pour basculer entre le layout mobile (vertical) et desktop (sidebar horizontale) sans JavaScript. |
| `BFF (Backend For Frontend)` | Pattern architectural où le backend est dédié à servir un frontend spécifique. Il ne fait que relayer et transformer les données (RSS → JSON, articles → prompt IA → contenu). |
| `Strategy Pattern` | Pattern de conception (GoF) qui définit une famille d'algorithmes interchangeables derrière une interface commune. Utilisé pour les providers IA (Claude, Ollama, Mock). Le code appelant ne sait pas quel provider est utilisé. |
| `CORS (Cross-Origin Resource Sharing)` | Mécanisme de sécurité du navigateur qui bloque les requêtes HTTP vers un domaine différent de celui de la page. Les flux RSS ne supportent pas CORS → nécessité d'un backend. |
| `Monorepo` | Un seul repository Git contenant plusieurs projets/packages. Permet de partager du code (types TypeScript) et de maintenir la cohérence. Outils : npm workspaces, Nx, Turborepo. |
| `YAGNI (You Ain't Gonna Need It)` | Principe de développement : ne pas implémenter une fonctionnalité tant qu'elle n'est pas nécessaire. Exemple : ne pas séparer en microservices tant qu'un monolithe modulaire suffit. |
| `Monolithe modulaire` | Architecture où l'application est un seul serveur avec des modules bien séparés (routes RSS, routes IA). Ce n'est PAS des microservices — c'est un seul process, un seul port. C'est le choix recommandé pour 95% des projets. |
| `Ollama` | Serveur LLM local open source. S'installe une fois sur la machine, expose une API REST sur `localhost:11434`. Tous les projets peuvent l'utiliser, comme un serveur de base de données. Utilise le GPU NVIDIA via CUDA si disponible. |
| `VRAM` | Video RAM — mémoire dédiée de la carte graphique. Ollama charge le modèle LLM dans la VRAM (pas dans la RAM système). 6 Go de VRAM suffisent pour un modèle 7B. |
| `CUDA` | Technologie NVIDIA pour exécuter des calculs sur le GPU. Ollama l'utilise automatiquement si une carte NVIDIA est détectée. Accélère considérablement l'inférence LLM (2-5 sec au lieu de 15-30 sec en CPU). |
| `Provider` | Dans le contexte du Strategy Pattern : une implémentation concrète d'une interface. `ClaudeProvider` et `OllamaProvider` sont deux providers de l'interface `AiProvider`. |
| `Rate limiting` | Technique de sécurité qui limite le nombre de requêtes qu'un client peut faire par unité de temps. Empêche les abus (DDoS, spam d'API coûteuses). |
| `zod` | Librairie TypeScript de validation de schémas. Définit un schéma une fois → validation runtime + types TypeScript générés. Remplace la validation manuelle `if (!url) throw...`. |
| `dotenv` | Librairie qui charge les variables d'environnement depuis un fichier `.env`. Sépare la configuration (clés API, URLs) du code. Le fichier `.env` est dans `.gitignore`, le template `.env.example` est commité. |