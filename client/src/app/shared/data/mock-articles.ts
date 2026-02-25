/**
 * Mock article templates organized by source category.
 * Used by ArticleService to generate realistic test data.
 * Will be removed when real RSS fetching is implemented (step 4.8).
 */
export interface ArticleTemplate {
  title: string;
  summary: string;
}

export const MOCK_ARTICLE_TEMPLATES: Record<string, ArticleTemplate[]> = {
  cybersecurity: [
    {
      title: 'Ransomware RaaS : nouvelle vague ciblant les PME européennes',
      summary:
        "Les groupes de ransomware-as-a-service intensifient leurs attaques contre les PME en Europe, exploitant des vulnérabilités dans les VPN d'entreprise.",
    },
    {
      title: 'Faille zero-day dans OpenSSL 3.5 : correctif urgent',
      summary:
        "Une vulnérabilité critique (CVE-2026-0142) permet l'exécution de code à distance. Correctif disponible.",
    },
    {
      title: 'ANSSI : rapport annuel sur les menaces cyber en France',
      summary:
        "L'ANSSI révèle une augmentation de 37% des incidents cyber signalés avec une sophistication croissante.",
    },
    {
      title: 'Phishing IA : les deepfakes vocaux, nouvelle arme',
      summary:
        "Des campagnes de phishing utilisant des clones vocaux IA ciblent les dirigeants. Le FBI alerte sur cette menace.",
    },
    {
      title: 'Supply chain attack : un package npm malveillant affecte 15 000 projets',
      summary:
        "Le package 'event-utils-pro' contenait un backdoor exfiltrant les variables d'environnement.",
    },
    {
      title: 'Microsoft corrige 4 failles critiques dans Exchange Server',
      summary:
        "Le Patch Tuesday de février inclut des correctifs pour des vulnérabilités permettant l'élévation de privilèges sur Exchange.",
    },
    {
      title: 'Le groupe APT29 cible les ministères européens',
      summary:
        "Le groupe lié aux services de renseignement russes mène une campagne de spear-phishing contre les institutions de l'UE.",
    },
    {
      title: 'NIS2 : les entreprises françaises en retard sur la conformité',
      summary:
        "Seulement 30% des entreprises concernées par la directive NIS2 sont conformes à trois mois de la date limite.",
    },
  ],
  ai: [
    {
      title: 'GPT-5 : OpenAI annonce une architecture hybride',
      summary:
        "Le nouveau modèle combine transformeur dense et mixture-of-experts, avec un coût d'inférence réduit de 60%.",
    },
    {
      title: 'Claude Code : Anthropic transforme le développement assisté par IA',
      summary:
        "Le nouvel outil permet de coder depuis le terminal avec compréhension contextuelle. 92% de réussite sur SWE-bench.",
    },
    {
      title: "L'UE finalise l'AI Act : ce qui change pour les développeurs",
      summary:
        "Classification des risques, documentation obligatoire, sanctions jusqu'à 35 millions d'euros.",
    },
    {
      title: 'Mistral Large 3 : le modèle européen qui rivalise avec GPT-5',
      summary:
        "Mistral AI dévoile son modèle phare, entraîné sur des données multilingues avec une force particulière en français.",
    },
    {
      title: 'RAG vs Fine-tuning : le guide définitif 2026',
      summary:
        "Stanford montre que le RAG surpasse le fine-tuning pour 78% des cas d'usage en entreprise.",
    },
    {
      title: 'Gemini 2.5 : Google mise sur le raisonnement multi-étapes',
      summary:
        "Le nouveau modèle de Google excelle en mathématiques et en programmation grâce à une chaîne de pensée améliorée.",
    },
    {
      title: 'LLaMA 4 : Meta ouvre les modèles multimodaux',
      summary:
        "Meta publie LLaMA 4 en open source, capable de traiter texte, image et audio dans un seul modèle.",
    },
    {
      title: 'Les agents IA autonomes : promesse ou danger ?',
      summary:
        "Le débat s'intensifie autour des agents capables d'exécuter des tâches sans supervision humaine.",
    },
    {
      title: "Hugging Face lève 500M$ pour l'IA open source",
      summary:
        'La plateforme de référence pour les modèles open source accélère son développement avec une levée de fonds record.',
    },
    {
      title: "IA et droit d'auteur : premières décisions en Europe",
      summary:
        "Les tribunaux européens commencent à trancher sur l'utilisation de données protégées pour l'entraînement de modèles.",
    },
  ],
  frontend: [
    {
      title: 'Angular 21 : Signals everywhere et la fin des NgModules',
      summary:
        'Angular généralise les Signals et supprime définitivement le support des NgModules legacy.',
    },
    {
      title: 'Tailwind CSS 4 : réécriture complète avec le moteur Oxide',
      summary:
        'Nouveau moteur en Rust pour un build 10x plus rapide. Container queries natives et palette OKLCH.',
    },
    {
      title: 'Web Components 2026 : enfin prêts pour la production ?',
      summary:
        'Declarative Shadow DOM et Scoped Custom Element Registries rendent les Web Components viables.',
    },
    {
      title: 'React 20 : le compilateur qui élimine les re-renders',
      summary:
        'React Compiler, longtemps en beta, est maintenant stable. Il mémorise automatiquement les composants.',
    },
    {
      title: 'Astro 5 : le framework qui réconcilie SSR et performance',
      summary:
        'Astro 5 introduit les Server Islands et un nouveau système de cache qui réduit le TTFB de 40%.',
    },
    {
      title: 'CSS :has() transforme le développement front-end',
      summary:
        'Le sélecteur parent tant attendu est désormais supporté partout. Les hacks JavaScript pour le styling parent-enfant disparaissent.',
    },
    {
      title: 'Vite 7 : le bundler qui redéfinit la rapidité',
      summary:
        'Vite 7 utilise Rolldown (en Rust) en remplacement de Rollup. Le cold start passe sous la barre des 100ms.',
    },
    {
      title: 'TypeScript 5.9 : les décorateurs natifs changent la donne',
      summary:
        'Les décorateurs TC39 stage 3 sont enfin stables. Angular, NestJS et MobX migrent leurs APIs.',
    },
  ],
  backend: [
    {
      title: '.NET 10 Preview : performances record',
      summary:
        'Les benchmarks TechEmpower montrent .NET 10 au sommet avec des améliorations majeures du JIT.',
    },
    {
      title: "Node.js 24 LTS : ce qu'il faut savoir pour migrer",
      summary:
        'Support natif TypeScript (expérimental), nouveau module de permissions, performances V8 +15%.',
    },
    {
      title: 'PostgreSQL 17 : les nouveautés qui changent tout',
      summary:
        'JSON path amélioré, partitionnement automatique, réplication logique simplifiée.',
    },
    {
      title: 'Spring Boot 4 : Java modernise son framework phare',
      summary:
        'Virtual threads par défaut, support natif de GraalVM, et un nouveau système de configuration simplifié.',
    },
    {
      title: 'Redis 8 : du cache au moteur de données temps réel',
      summary:
        'Redis 8 ajoute les triggers, les fonctions stockées et un moteur de recherche vectorielle intégré.',
    },
    {
      title: 'GraphQL vs REST en 2026 : le verdict des grandes entreprises',
      summary:
        'Netflix, Shopify et GitHub partagent leurs retours : GraphQL pour les apps mobiles, REST pour les APIs publiques.',
    },
    {
      title: 'Deno 3.0 : le runtime qui veut remplacer Node.js',
      summary:
        'Deno 3.0 atteint la compatibilité npm complète et lance un service de déploiement edge intégré.',
    },
    {
      title: 'Entity Framework 10 : le mapping objet-relationnel repensé',
      summary:
        'Bulk operations natives, compiled queries automatiques, et support des bases de données document.',
    },
  ],
  devops: [
    {
      title: 'GitHub Actions : runners ARM64 divisent les coûts par 3',
      summary:
        'Runners ARM64 managés avec un ratio performance/coût 3x meilleur que x64.',
    },
    {
      title: 'Docker Desktop 5.0 : multi-arch builds natifs',
      summary:
        "Création simplifiée d'images multi-architecture avec workflow unique AMD64/ARM64.",
    },
    {
      title: "Terraform 2.0 : HashiCorp réinvente l'Infrastructure as Code",
      summary:
        'Nouveau langage de configuration, state management distribué et support natif des policies.',
    },
    {
      title: 'GitLab 18 : la plateforme DevSecOps tout-en-un se renforce',
      summary:
        'Scan de vulnérabilités IA, pipelines prédictives et intégration native de Kubernetes.',
    },
    {
      title: 'Kubernetes 1.33 : la simplification tant attendue',
      summary:
        "Auto-scaling prédictif, gateway API stable et suppression de 40% des options de configuration legacy.",
    },
    {
      title: 'Les plateformes internes : la tendance DevOps de 2026',
      summary:
        'Spotify Backstage, Port et Humanitec dominent le marché des Internal Developer Platforms.',
    },
  ],
  cloud: [
    {
      title: 'Azure Container Apps remplace Kubernetes pour 80% des cas',
      summary:
        'Microsoft simplifie le serverless avec auto-scaling, Dapr intégré et tarification à la seconde.',
    },
    {
      title: 'AWS annonce des réductions de 25% sur Graviton4',
      summary:
        "Amazon réduit les prix de ses instances ARM Graviton4, renforçant l'avantage économique de l'architecture ARM.",
    },
    {
      title: 'Google Cloud Run gen2 : le serverless sans cold start',
      summary:
        'La deuxième génération de Cloud Run élimine les cold starts grâce au pré-chargement prédictif des instances.',
    },
    {
      title: 'Multi-cloud 2026 : les entreprises adoptent la portabilité',
      summary:
        "65% des grandes entreprises utilisent au moins 2 cloud providers. Les outils d'abstraction se multiplient.",
    },
    {
      title: 'OVHcloud lance son offre IA souveraine',
      summary:
        "L'hébergeur français propose des GPU H100 avec garantie de localisation des données en Europe.",
    },
    {
      title: 'Le FinOps devient obligatoire : optimiser ses coûts cloud',
      summary:
        'Les dépenses cloud non optimisées représentent 30% du budget moyen. Les outils FinOps se démocratisent.',
    },
  ],
  general: [
    {
      title: 'Stack Overflow Survey 2026 : TypeScript dépasse JavaScript',
      summary:
        'Pour la première fois, TypeScript est le langage le plus utilisé en développement web.',
    },
    {
      title: "Développeurs 2026 : l'hybride plébiscité",
      summary:
        '72% des développeurs préfèrent le mode hybride selon JetBrains. Le full remote recule.',
    },
    {
      title: 'Les salaires tech en France : la stagnation après la hausse',
      summary:
        'Après deux ans de forte hausse, les salaires développeurs se stabilisent en Île-de-France mais progressent en régions.',
    },
    {
      title: "Green IT : les développeurs face à l'empreinte carbone du code",
      summary:
        "De nouveaux outils mesurent l'impact environnemental du code. Les entreprises intègrent des KPIs de sobriété numérique.",
    },
    {
      title: 'La certification devient un atout : AWS, Azure, GCP',
      summary:
        'Les certifications cloud augmentent le salaire moyen de 15%. Les entreprises financent de plus en plus les formations.',
    },
    {
      title: 'Low-code / No-code : compléments ou concurrents des développeurs ?',
      summary:
        'Le marché du low-code atteint 30 milliards. Les développeurs les utilisent pour le prototypage, pas pour la production.',
    },
  ],
};