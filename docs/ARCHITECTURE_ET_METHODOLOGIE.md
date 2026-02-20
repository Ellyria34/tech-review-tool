# 🏗️ TechReviewTool — Document d'Architecture et de Méthodologie

> **Nom du projet** : TechReviewTool — Agrégateur intelligent de veille technologique
> **Date de création** : 14 février 2026
> **Auteur** : Ellyria34 - Sarah LLEON
> **Statut** : Étape 5 terminée — Actions IA (synthèse, revue de presse, LinkedIn)

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
/projects/:id/history                  → Historique des générations (à venir)
```

Ce routing utilise le **lazy loading** (`loadComponent`) pour charger chaque composant à la demande. L'ordre des routes est important : les routes spécifiques (`/new`) doivent précéder les routes paramétrées (`/:id`).

### 3.3 Composants Angular

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
| Liste d'articles + filtres | ArticleList | features/articles/components/ | ✅ |
| Carte d'article (checkbox, lien) | ArticleCard | features/articles/components/ | ✅ |
| Barre de filtres (recherche, période, source) | ArticleFilters | features/articles/components/ | ✅ |
| Panneau Action IA (bottom sheet) | AiActionPanelComponent | features/ai-actions/components/ | ✅ |
| Contenu généré (copier/exporter) | GeneratedContentComponent | features/ai-actions/components/ | ✅ |

**Composants à venir** :

| Wireframe | Composant Angular | Dossier | Étape |
|---|---|---|---|
| Barre contexte projet | ProjectContextBarComponent | core/ | 7 |
| Sélecteur rapide | ProjectSwitcherComponent | core/ | 7 |
| Historique générations | HistoryListComponent | features/history/ | 6 |

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

Un `computed()` doit être **pur** — il calcule et retourne une valeur, rien d'autre. Les effets de bord (appels service, navigation, modification d'état) vont dans `ngOnInit()` ou dans les méthodes déclenchées par l'utilisateur :

```typescript
// ❌ MAUVAIS — effet de bord dans un computed
readonly sources = computed(() => {
  this.articleService.setCurrentProject(this.projectId); // SIDE EFFECT!
  return this.sourceService.getByProject(this.projectId)();
});

// ✅ BON — effet de bord dans ngOnInit, computed reste pur
ngOnInit(): void {
  this.articleService.setCurrentProject(this.projectId);
}
readonly sources = computed(() => {
  const projectId = this.articleService.currentProjectId();
  return this.sourceService.getByProject(projectId)();
});
```

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
│   │   │   ├── bottom-nav/    # Navigation mobile (toujours visible en bas)
│   │   │   └── header/        # Header de l'app (toujours visible en haut)
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
│   │   └── history/           # Historique des générations (à venir — étape 6)
│   ├── shared/                # Composants réutilisables, pipes, directives
│   │   ├── components/
│   │   ├── data/              # Données centralisées (catégories, mock articles)
│   │   ├── models/            # Interfaces TypeScript (ReviewProject, Source, Article, GeneratedContent...)
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

| Type | Outil | Quoi tester |
|---|---|---|
| **Unitaire** | Vitest (intégré Angular 21) | Services, pipes, logique métier |
| **Composant** | Vitest + Angular Testing Library | Rendu, interactions utilisateur |
| **E2E** | Playwright | Parcours utilisateur complets |

---

## 11. Plan d'exécution par étapes

| Étape | Contenu | Statut |
|---|---|---|
| **0** | Conception, wireframes, document d'architecture | ✅ Terminé |
| **0.5** | Setup : Node.js 22, Angular CLI 21, Git, GitHub | ✅ Terminé |
| **1** | Structure projet, linting, Tailwind CSS, App Shell | ✅ Terminé |
| **2** | Feature multi-projets (CRUD projets) | ✅ Terminé |
| **3** | Gestion des sources RSS par projet (catalogue Many-to-Many) | ✅ Terminé |
| **4** | Liste d'articles avec filtres, sélection, intégration workspace | ✅ Terminé |
| **5** | Actions IA (synthèse, revue de presse, LinkedIn) | ✅ Terminé |
| **6** | Historique des générations par projet | ⬜ À faire |
| **7** | Layout desktop (sidebar + onglets projets) | ⬜ À faire |
| **8** | Tests, audit accessibilité, build production | ⬜ À faire |

---

## 12. TODOs — Améliorations reportées

### TODO 3.5 — UI réutilisation du catalogue de sources

**Problème** : Créer plusieurs projets sur le même thème oblige à recréer les mêmes sources à chaque fois.

**Architecture** : Le Many-to-Many supporte déjà ce cas. `SourceService.getAvailableForProject()` retourne les sources du catalogue non encore liées au projet.

**Ce qu'il manque** : Un bouton "📂 Depuis le catalogue" dans la page sources, qui affiche les sources disponibles et permet de les lier en un clic.

**Quand** : Intégrer à l'étape 7 (desktop layout) ou comme sous-étape autonome.

### TODO 4.8 — Récupération RSS réelle

**Situation actuelle** : Les articles sont générés par des données mock (`MOCK_ARTICLE_TEMPLATES` dans `shared/data/mock-articles.ts`). Suffisant pour tester les étapes 5-6.

**Ce qu'il faudra** : Un `RssService` avec CORS proxy + `DOMParser` pour parser les vrais flux RSS.

**Quand** : Après l'étape 6 (Historique). Les données mock sont suffisantes pour les étapes 5-6.

### TODO 5.7 — Audit `theme()` dans les SCSS de composants

**Situation** : Découvert à l'étape 5 que la fonction Tailwind `theme()` ne fonctionne pas dans les fichiers SCSS de composants Angular (compilation isolée). Corrigé dans `ai-action-panel.scss` et `generated-content.scss` en utilisant les valeurs hex.

**Ce qu'il faudra** : Auditer tous les SCSS de composants existants pour remplacer d'éventuels `theme()` restants par les valeurs hex.

**Quand** : Étape 7 (polish global).

---

## 13. Glossaire Angular / TypeScript

| Terme | Définition |
|---|---|
| `Component` | Brique d'interface : un template HTML + une classe TypeScript + des styles. Gère l'affichage et les interactions utilisateur. |
| `Service` | Classe injectable qui contient la logique métier et la gestion des données. Singleton par défaut (`providedIn: 'root'`). |
| `Signal` | Valeur réactive qui notifie automatiquement les composants quand elle change. Remplace RxJS pour les cas simples. |
| `Computed` | Signal dérivé qui se recalcule automatiquement quand ses dépendances changent. Doit rester pur (pas d'effets de bord). |
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