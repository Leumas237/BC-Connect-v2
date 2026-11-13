# BC Connect

> **Connect beyond classrooms** — La plateforme de rencontres et de networking pour les étudiants de l'IUT Fotso Victor de Bandjoun.

## 🎯 Vision

BC Connect est une application universitaire gratuite permettant aux étudiants de :
- 💕 **Dating** : Trouver l'amour ou une relation sérieuse
- 🤝 **Amitié** : Rencontrer des personnes partageant les mêmes centres d'intérêt
- 💼 **Networking** : Développer son réseau professionnel étudiant

## ✨ Fonctionnalités principales

### Pour les étudiants
- **Inscription sécurisée** avec vérification étudiante (carte d'étudiant, certificat de scolarité)
- **Profils riches** : photos, bio, filière, niveau, centres d'intérêt (80+ disponibles), intentions
- **Découverte type Tinder** : swipe gauche/droite, Super Like, filtres avancés
- **Matching mutuel** : conversation débloquée uniquement si intérêt réciproque
- **Messagerie temps réel** : Supabase Realtime, indicateurs de frappe, accusés de lecture
- **Partage réseaux sociaux** : Instagram, Snapchat, TikTok, etc. (volontaire, après match)
- **PWA installable** : fonctionne comme une app native, offline-first

### Pour les administrateurs
- **Tableau de bord** : stats utilisateurs, matchs, vérifications, revenus publicitaires
- **Gestion utilisateurs** : recherche, filtres, ban/unban, suppression RGPD
- **File de vérification** : approbation/rejet documents avec raisons
- **Publicité** : campagnes bannières (création, planning, analytics, paiements)
- **Rôles** : Super Admin, Admin établissement, Modérateur, Gestionnaire pub

## 🛠 Stack technique

| Composant | Technologie |
|-----------|-------------|
| Framework | **Next.js 14** (App Router) |
| Langage | **TypeScript** (strict) |
| UI | **Tailwind CSS** + **shadcn/ui** (Radix UI) |
| Backend | **Supabase** (PostgreSQL, Auth, Storage, Realtime) |
| État | **TanStack Query** (React Query) |
| Formulaires | **React Hook Form** + **Zod** |
| Notifications | **Sonner** |
| Tests | **Jest** + **React Testing Library** + **Playwright** |
| Déploiement | **Vercel** |

## 📁 Structure du projet

```
bc-connect/
├── public/                 # Assets statiques, PWA
│   ├── icons/             # Icônes PWA (72x72 à 512x512)
│   ├── manifest.json      # Web App Manifest
│   └── sw.js              # Service Worker
├── src/
│   ├── app/               # Pages Next.js (App Router)
│   │   ├── (auth)/        # Login, Register, Verification
│   │   ├── (dashboard)/   # Pages protégées (Discover, Matches, Messages, Profile, Settings)
│   │   ├── admin/         # Interface d'administration
│   │   └── api/           # API Routes
│   ├── components/
│   │   ├── ui/            # Composants shadcn/ui (Button, Card, Input, etc.)
│   │   ├── layout/        # Header, Sidebar, MobileNav, Footer
│   │   ├── profile/       # ProfileCard, ProfileForm, PhotoUploader
│   │   ├── discovery/     # SwipeStack, FilterPanel, ActionButtons
│   │   ├── matches/       # MatchList, MatchCard
│   │   ├── messaging/     # ConversationList, MessageList, MessageBubble
│   │   ├── social/        # SocialLinks, SocialManagement
│   │   ├── advertising/   # BannerSlot, BannerCard
│   │   └── admin/         # UserTable, VerificationQueue, CampaignManager
│   ├── lib/
│   │   ├── supabase/      # Clients Supabase (browser, server, middleware)
│   │   ├── hooks/         # Custom hooks (useAuth, useProfile, useDiscovery, etc.)
│   │   ├── services/      # Business logic services
│   │   ├── utils/         # Helpers (cn, date, validation, format)
│   │   ├── types/         # Types TypeScript (Database, Profile, etc.)
│   │   ├── config/        # Configuration centralisée
│   │   └── validations/   # Schémas Zod
│   └── styles/            # CSS global, variables, animations
├── supabase/
│   ├── migrations/        # Migrations SQL versionnées (001-006)
│   └── seed/              # Données de référence (institutions, intérêts, niveaux)
├── tests/                 # Tests unitaires, intégration, E2E
├── .env.example           # Variables d'environnement exemple
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
└── README.md
```

## 🚀 Démarrage rapide

### Prérequis
- Node.js 20+
- pnpm 9+
- Compte Supabase
- Compte Vercel (pour déploiement)

### Installation

```bash
# Cloner le repo
git clone <repo-url>
cd bc-connect

# Installer les dépendances
pnpm install

# Configurer les variables d'environnement
cp .env.example .env.local
# Éditer .env.local avec vos clés Supabase

# Lancer en développement
pnpm dev
```

### Variables d'environnement requises

```env
# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME="BC Connect"

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Auth
NEXTAUTH_SECRET=generate_with_openssl_rand_base64_32
NEXTAUTH_URL=http://localhost:3000

# Feature flags
NEXT_PUBLIC_ENABLE_PWA=true
NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true
```

### Base de données

```bash
# Pousser les migrations vers Supabase local
pnpm db:push

# Ou réinitialiser complètement
pnpm db:reset

# Générer les types TypeScript
pnpm db:types
```

## 📱 PWA

L'application est installable sur mobile :
- `pnpm build && pnpm start` pour tester en production
- Icônes dans `public/icons/`
- Service Worker dans `public/sw.js`
- Manifest dans `public/manifest.json`

## 🧪 Tests

```bash
# Tests unitaires
pnpm test

# Tests en mode watch
pnpm test:watch

# Couverture de code
pnpm test:coverage

# Tests E2E (Playwright)
pnpm test:e2e
```

## 🔒 Sécurité

- **RLS (Row Level Security)** sur toutes les tables PostgreSQL
- **Clé Service Role** uniquement côté serveur (API Routes)
- **Validation Zod** sur toutes les entrées API
- **Rate limiting** sur endpoints sensibles (auth, swipe, messages)
- **CSP Headers** stricts via `next.config.js`
- **HTTPS only** en production (Vercel)
- **Cookies sécurisés** : HttpOnly, Secure, SameSite

## 🗄 Base de données - Tables principales

- `institutions` - Établissements (IUT Fotso Victor + futurs)
- `profiles` - Profils étudiants (étend `auth.users`)
- `profile_photos` - Photos avec modération
- `interests` / `profile_interests` - Centres d'intérêt (80+)
- `user_intentions` - Dating / Amitié / Networking
- `swipes` - Like, Pass, Super Like
- `matches` - Matchs mutuels
- `conversations` / `messages` - Messagerie temps réel
- `social_accounts` / `social_shares` - Réseaux sociaux (partage volontaire)
- `verification_documents` - Documents étudiants (stockage privé)
- `ad_campaigns` / `ad_slots` - Publicité bannières
- `admin_roles` - RBAC (Super Admin, Admin, Modérateur, Pub)
- `audit_logs` - Traçabilité actions admin
- `blocks` / `reports` / `notifications` - Sécurité

## 🚀 Déploiement

### Vercel (recommandé)

1. Connecter le repo GitHub à Vercel
2. Configurer les variables d'environnement
3. Déployer

### Supabase Production

1. Créer projet Supabase production
2. Exécuter migrations : `supabase db push --project-ref <ref>`
3. Configurer Auth providers (Email)
4. Créer buckets Storage avec politiques RLS
5. Activer Realtime sur tables nécessaires

## 📋 Roadmap

- [x] Architecture & Schema DB
- [x] Auth & Vérification étudiante
- [x] Profils & Photos
- [x] Discovery & Swipe
- [x] Matching & Messagerie
- [x] Partage réseaux sociaux
- [x] Admin Dashboard & Publicité
- [x] PWA & Service Worker
- [ ] Tests E2E complets
- [ ] Optimisation performances
- [ ] Accessibilité WCAG 2.1 AA
- [ ] Monitoring & Alerting
- [ ] Documentation API

## 🤝 Contribuer

1. Fork le projet
2. Créer une branche (`git checkout -b feature/amazing-feature`)
3. Commit (`git commit -m 'Add amazing feature'`)
4. Push (`git push origin feature/amazing-feature`)
5. Ouvrir une Pull Request

## 📄 Licence

Propriétaire - BC Connect Team. Tous droits réservés.

## 📞 Contact

- Email : contact@bc-connect.app
- IUT Fotso Victor, Bandjoun, Cameroun

---

**BC Connect** — *Connect beyond classrooms* 🎓💕🤝💼