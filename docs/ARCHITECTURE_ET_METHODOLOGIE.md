## Mises à jour ARCHITECTURE_ET_METHODOLOGIE.md

### 1. Section 3.1 — Remplacer le modèle de données par :

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

C'est l'équivalent Angular d'une table de liaison Entity Framework :
```csharp
// C# — Entity Framework
public class ProjectSource {
    public string ProjectId { get; set; }
    public string SourceId { get; set; }
    public bool IsActive { get; set; }
}
```

### 2. Section 3.2 — Ajouter les routes sources :

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

### 3. Section 3.3 — Mettre à jour la liste des composants :

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

### 4. Section 10 — Mettre à jour le plan d'exécution :

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