import { Injectable, inject, signal, computed } from '@angular/core';
import { SourceService } from '../../sources/services/source.service';
import { Article, ArticleFilters, TimeWindow, DEFAULT_FILTERS } from '../../../shared/models';

const STORAGE_KEY = 'trt-articles';

@Injectable({
  providedIn: 'root',
})
export class ArticleService {
  private readonly sourceService = inject(SourceService);
  
  // State signals
  private readonly _articles = signal<Article[]>(this.loadFromStorage());
  private readonly _filters = signal<ArticleFilters>({ ...DEFAULT_FILTERS });
  private readonly _currentProjectId = signal<string | null>(null);
  private readonly _selectedIds = signal<Set<string>>(new Set());

  // Public read-only access
  readonly filters = this._filters.asReadonly();
  readonly currentProjectId = this._currentProjectId.asReadonly();
  readonly selectedIds = this._selectedIds.asReadonly();

  // Computed signals
  // All articles for the active project (before filtering)
  readonly projectArticles = computed(() => {
    const projectId = this._currentProjectId();
    if(!projectId) return [];
    return this._articles().filter(a => a.projectId === projectId);
  });

  // All articles for the active project (after filtering)
  readonly filteredArticles = computed( () => {
    const articles = this.projectArticles();
    const filters = this.filters();
    let result = [...articles];

    //Keyword search (AND logic — all terms must match)
    if(filters.keywords.trim()) {
      const terms = filters.keywords.toLowerCase().split(/\s+/).filter((t) => t.length > 0);
      result = result.filter((article) => {
        const searchable = `${article.title} ${article.summary}`.toLowerCase();
        return terms.every((term) => searchable.includes(term));
      });
    }

    // Time window filter
    if (filters.timeWindow !== 'all') {
      const cutoff = this.getTimeCutoff(filters.timeWindow);
      result = result.filter((a) => new Date(a.publishedAt) >= cutoff);
    }

    // Source filter
    if (filters.sourceId) {
      result = result.filter((a) => a.sourceId === filters.sourceId);
    }

    // Sort by date (newest first)
    result.sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );

    return result;
  });

  readonly filteredCount = computed(() => this.filteredArticles().length);
  readonly totalCount = computed(() => this.projectArticles().length);
  readonly selectedCount = computed(() => this.selectedIds().size);
  //Selected article objects (ready for AI actions)
  readonly selectedArticles = computed(() => {
    const ids = this._selectedIds();
    return this.filteredArticles().filter((a) => ids.has(a.id));
  });

  // Project context
  
  // Set the active project. Resets filters and selection on change.
  setCurrentProject(projectId: string): void {
    if (this._currentProjectId() !== projectId) {
      this._currentProjectId.set(projectId);
      this._filters.set({ ...DEFAULT_FILTERS });
      this.clearSelection();
    }
  }
  
  // Filters
  updateFilters(partial : Partial<ArticleFilters>): void {
    this._filters.update((current) => ({...current, ...partial}));
    this.clearSelection();
  }
  
  resetFilters(): void {
    this._filters.set({ ...DEFAULT_FILTERS});
    this.clearSelection();
  }
  
  // Selection
  toggleSelection(articleId: string): void {
    this._selectedIds.update((ids) => {
      const next = new Set(ids);
      if (next.has(articleId)){
        next.delete(articleId);
      } else {
        next.add(articleId);
      }
      return next;
    });
  }

  isSelected(articleId: string): boolean {
    return this._selectedIds().has(articleId);
  }

  selectAll(): void {
    const allIds = new Set(this.filteredArticles().map((a) => a.id));
    this._selectedIds.set(allIds);
  }

  clearSelection(): void {
    this._selectedIds.set(new Set());
  }
  
  // Article management
  addArticles(articles : Article[]): void {
    this._articles.update((current) => {
      const existingUrls = new Set(current.map((a) => `${a.projectId} : ${a.url}`));
      const newArticles = articles.filter((a) => !existingUrls.has(`${a.projectId} : ${a.url}`)
      );
    return [ ...current, ...newArticles];
    });
    this.saveToStorage();
  }

  removeByProject(projectId: string): void {
    this._articles.update((current) => current.filter((a) => a.projectId !== projectId));
    this.saveToStorage();
  }

  // Load mock articles for development (uses the project's active sources)
  loadMockArticles(projectId: string): void {
    const linkedSources = this.sourceService.getByProject(projectId)();
    const activeSources = linkedSources.filter((s) => s.isActive);

    if (activeSources.length === 0) return;

    const mockArticles = this.generateMockArticles(projectId, activeSources);
    this.addArticles(mockArticles);
  }

  // HELPERS
  private getTimeCutoff(window: TimeWindow): Date {
    const now = new Date();
    const hours: Record<TimeWindow, number> = {
      '12h': 12,
      '24h': 24,
      '48h': 48,
      '7d': 168,
      'all': 0,
    };
    return new Date(now.getTime() - hours[window] * 60 * 60 * 1000);
  }

  //Storage
  private loadFromStorage() : Article[]{
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      console.error('Failed to load articles from localStorage');
      return [];
    }
  }

private saveToStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this._articles()));
    } catch {
      console.error('Failed to save articles to localStorage');
    }
  }

  private generateMockArticles(
    projectId: string,
    sources: { id: string; name: string; category: string }[]
  ): Article[] {
    const templates: Record<string, { title: string; summary: string }[]> = {
      cybersecurity: [
        {
          title: 'Ransomware RaaS : nouvelle vague ciblant les PME européennes',
          summary: "Les groupes de ransomware-as-a-service intensifient leurs attaques contre les PME en Europe, exploitant des vulnérabilités dans les VPN d'entreprise.",
        },
        {
          title: 'Faille zero-day dans OpenSSL 3.5 : correctif urgent',
          summary: "Une vulnérabilité critique (CVE-2026-0142) permet l'exécution de code à distance. Correctif disponible.",
        },
        {
          title: 'ANSSI : rapport annuel sur les menaces cyber en France',
          summary: "L'ANSSI révèle une augmentation de 37% des incidents cyber signalés avec une sophistication croissante.",
        },
        {
          title: 'Phishing IA : les deepfakes vocaux, nouvelle arme',
          summary: "Des campagnes de phishing utilisant des clones vocaux IA ciblent les dirigeants. Le FBI alerte sur cette menace.",
        },
        {
          title: 'Supply chain attack : un package npm malveillant affecte 15 000 projets',
          summary: "Le package 'event-utils-pro' contenait un backdoor exfiltrant les variables d'environnement.",
        },
      ],
      ai: [
        {
          title: 'GPT-5 : OpenAI annonce une architecture hybride',
          summary: "Le nouveau modèle combine transformeur dense et mixture-of-experts, avec un coût d'inférence réduit de 60%.",
        },
        {
          title: 'Claude Code : Anthropic transforme le développement assisté par IA',
          summary: "Le nouvel outil permet de coder depuis le terminal avec compréhension contextuelle. 92% de réussite sur SWE-bench.",
        },
        {
          title: "L'UE finalise l'AI Act : ce qui change pour les développeurs",
          summary: "Classification des risques, documentation obligatoire, sanctions jusqu'à 35 millions d'euros.",
        },
        {
          title: 'Mistral Large 3 : le modèle européen qui rivalise avec GPT-5',
          summary: "Mistral AI dévoile son modèle phare, entraîné sur des données multilingues avec une force particulière en français.",
        },
        {
          title: 'RAG vs Fine-tuning : le guide définitif 2026',
          summary: "Stanford montre que le RAG surpasse le fine-tuning pour 78% des cas d'usage en entreprise.",
        },
      ],
      frontend: [
        {
          title: 'Angular 21 : Signals everywhere et la fin des NgModules',
          summary: "Angular généralise les Signals et supprime définitivement le support des NgModules legacy.",
        },
        {
          title: 'Tailwind CSS 4 : réécriture complète avec le moteur Oxide',
          summary: "Nouveau moteur en Rust pour un build 10x plus rapide. Container queries natives et palette OKLCH.",
        },
        {
          title: 'Web Components 2026 : enfin prêts pour la production ?',
          summary: "Declarative Shadow DOM et Scoped Custom Element Registries rendent les Web Components viables.",
        },
      ],
      backend: [
        {
          title: '.NET 10 Preview : performances record',
          summary: "Les benchmarks TechEmpower montrent .NET 10 au sommet avec des améliorations majeures du JIT.",
        },
        {
          title: 'Node.js 24 LTS : ce qu\'il faut savoir pour migrer',
          summary: "Support natif TypeScript (expérimental), nouveau module de permissions, performances V8 +15%.",
        },
        {
          title: 'PostgreSQL 17 : les nouveautés qui changent tout',
          summary: "JSON path amélioré, partitionnement automatique, réplication logique simplifiée.",
        },
      ],
      devops: [
        {
          title: 'GitHub Actions : runners ARM64 divisent les coûts par 3',
          summary: "Runners ARM64 managés avec un ratio performance/coût 3x meilleur que x64.",
        },
        {
          title: 'Docker Desktop 5.0 : multi-arch builds natifs',
          summary: "Création simplifiée d'images multi-architecture avec workflow unique AMD64/ARM64.",
        },
      ],
      cloud: [
        {
          title: 'Azure Container Apps remplace Kubernetes pour 80% des cas',
          summary: "Microsoft simplifie le serverless avec auto-scaling, Dapr intégré et tarification à la seconde.",
        },
      ],
      general: [
        {
          title: 'Stack Overflow Survey 2026 : TypeScript dépasse JavaScript',
          summary: "Pour la première fois, TypeScript est le langage le plus utilisé en développement web.",
        },
        {
          title: "Développeurs 2026 : l'hybride plébiscité",
          summary: "72% des développeurs préfèrent le mode hybride selon JetBrains. Le full remote recule.",
        },
      ],
    };

    const articles: Article[] = [];
    const now = Date.now();

    sources.forEach((source) => {
      const catTemplates = templates[source.category] || templates['general'];
      const count = 3 + Math.floor(Math.random() * 3); // 3 to 5 articles
      const shuffled = [...catTemplates].sort(() => Math.random() - 0.5);

      shuffled.slice(0, count).forEach((template, index) => {
        const hoursAgo = Math.floor(Math.random() * 168); // 0–7 jours
        articles.push({
          id: crypto.randomUUID(),
          projectId,
          sourceId: source.id,
          title: template.title,
          url: `https://example.com/article-${source.id}-${index}`,
          summary: template.summary,
          publishedAt: new Date(now - hoursAgo * 3600000).toISOString(),
          sourceName: source.name,
          sourceCategory: source.category as Article['sourceCategory'],
        });
      });
    });

    return articles;
  }
}
