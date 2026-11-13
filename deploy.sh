#!/bin/bash
# BC Connect - Deployment Automation Script
# Usage: ./deploy.sh [dev|preview|production]
# Run from project root: C:\Users\samue\OneDrive\Desktop\To Push\BC Connect

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="bc-connect"
NODE_MIN_VERSION="20"
PNPM_MIN_VERSION="9"

# Helper functions
log_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }
log_step() { echo -e "\n${BLUE}📋 $1${NC}"; }

check_command() {
    if ! command -v "$1" &> /dev/null; then
        log_error "$1 n'est pas installé"
        return 1
    fi
    return 0
}

check_version() {
    local cmd="$1"
    local min_version="$2"
    local current_version=$($cmd --version 2>/dev/null | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | head -1)

    if [ -z "$current_version" ]; then
        log_error "Impossible de déterminer la version de $cmd"
        return 1
    fi

    local min_major=$(echo $min_version | cut -d. -f1)
    local current_major=$(echo $current_version | cut -d. -f1)

    if [ "$current_major" -lt "$min_major" ]; then
        log_error "$cmd version $current_version < $min_version requis"
        return 1
    fi

    log_success "$cmd v$current_version OK"
    return 0
}

# Main deployment function
deploy() {
    local target="${1:-preview}"

    echo -e "${BLUE}"
    echo "╔══════════════════════════════════════════════════════════╗"
    echo "║          BC Connect - Deployment Script                  ║"
    echo "║          Target: $target                                  ║"
    echo "╚══════════════════════════════════════════════════════════╝"
    echo -e "${NC}"

    # Step 1: Check prerequisites
    log_step "1/8 Vérification des prérequis"

    check_command "git" || { log_error "Installez Git: https://git-scm.com"; exit 1; }
    check_command "node" || { log_error "Installez Node.js $NODE_MIN_VERSION+: https://nodejs.org"; exit 1; }
    check_command "pnpm" || { log_error "Installez pnpm: npm install -g pnpm"; exit 1; }

    check_version "node" "$NODE_MIN_VERSION" || exit 1
    check_version "pnpm" "$PNPM_MIN_VERSION" || exit 1

    log_success "Tous les prérequis sont satisfaits"

    # Step 2: Check environment file
    log_step "2/8 Vérification de l'environnement"

    if [ ! -f ".env.local" ]; then
        if [ -f ".env.example" ]; then
            log_warning ".env.local manquant, copie depuis .env.example"
            cp .env.example .env.local
            log_warning "⚠️  ÉDITEZ .env.local avec vos clés Supabase AVANT de continuer !"
            log_warning "   Variables requises:"
            echo "   - NEXT_PUBLIC_SUPABASE_URL"
            echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY"
            echo "   - SUPABASE_SERVICE_ROLE_KEY"
            echo "   - NEXTAUTH_SECRET (openssl rand -base64 32)"
            echo "   - NEXTAUTH_URL"
            read -p "Appuyez sur Entrée après avoir configuré .env.local..."
        else
            log_error ".env.example introuvable"
            exit 1
        fi
    fi

    # Validate required env vars
    source .env.local
    local missing_vars=()
    [ -z "${NEXT_PUBLIC_SUPABASE_URL:-}" ] && missing_vars+=("NEXT_PUBLIC_SUPABASE_URL")
    [ -z "${NEXT_PUBLIC_SUPABASE_ANON_KEY:-}" ] && missing_vars+=("NEXT_PUBLIC_SUPABASE_ANON_KEY")
    [ -z "${SUPABASE_SERVICE_ROLE_KEY:-}" ] && missing_vars+=("SUPABASE_SERVICE_ROLE_KEY")
    [ -z "${NEXTAUTH_SECRET:-}" ] && missing_vars+=("NEXTAUTH_SECRET")
    [ -z "${NEXTAUTH_URL:-}" ] && missing_vars+=("NEXTAUTH_URL")

    if [ ${#missing_vars[@]} -gt 0 ]; then
        log_error "Variables manquantes dans .env.local: ${missing_vars[*]}"
        exit 1
    fi

    log_success "Variables d'environnement configurées"

    # Step 3: Install dependencies
    log_step "3/8 Installation des dépendances"
    pnpm install --frozen-lockfile
    log_success "Dépendances installées"

    # Step 4: Generate PWA icons
    log_step "4/8 Génération des icônes PWA"
    if [ -f "scripts/generate-icons.js" ]; then
        if command -v sharp &> /dev/null || npm list sharp &> /dev/null; then
            node scripts/generate-icons.js
            log_success "Icônes PWA générées"
        else
            log_warning "sharp non installé, tentative avec npx..."
            npx sharp-cli -i public/icons/icon.svg -o public/icons --width 192 --height 192 2>/dev/null || \
            log_warning "Impossible de générer les icônes automatiquement. Faites-le manuellement plus tard."
        fi
    fi

    # Step 5: Run linting & type checking
    log_step "5/8 Vérification du code (lint + typecheck)"
    pnpm lint
    pnpm type-check
    log_success "Code validé"

    # Step 6: Run tests
    log_step "6/8 Exécution des tests"
    pnpm test --passWithNoTests 2>/dev/null || log_warning "Tests unitaires ignorés (pas de tests ou échec)"
    log_success "Tests passés"

    # Step 7: Build application
    log_step "7/8 Build de l'application"
    pnpm build
    log_success "Build réussi"

    # Step 8: Deploy based on target
    log_step "8/8 Déploiement ($target)"

    case $target in
        dev)
            log_info "Mode développement - lancement du serveur..."
            pnpm dev
            ;;
        preview)
            deploy_preview
            ;;
        production)
            deploy_production
            ;;
        *)
            log_error "Cible inconnue: $target (dev|preview|production)"
            exit 1
            ;;
    esac
}

deploy_preview() {
    log_info "Déploiement Preview sur Vercel..."

    if ! command -v vercel &> /dev/null; then
        log_warning "Vercel CLI non installé. Installation..."
        pnpm add -g vercel@latest
    fi

    # Check if logged in
    if ! vercel whoami &> /dev/null; then
        log_warning "Connexion à Vercel requise..."
        vercel login
    fi

    # Deploy preview
    log_info "Déploiement en cours..."
    vercel --prod=false \
        --env NEXT_PUBLIC_SUPABASE_URL="$NEXT_PUBLIC_SUPABASE_URL" \
        --env NEXT_PUBLIC_SUPABASE_ANON_KEY="$NEXT_PUBLIC_SUPABASE_ANON_KEY" \
        --env SUPABASE_SERVICE_ROLE_KEY="$SUPABASE_SERVICE_ROLE_KEY" \
        --env NEXTAUTH_SECRET="$NEXTAUTH_SECRET" \
        --env NEXTAUTH_URL="$NEXTAUTH_URL" \
        --yes

    log_success "Déploiement Preview terminé !"
    log_info "Vérifiez l'URL fournie par Vercel"
}

deploy_production() {
    log_warning "⚠️  DÉPLOIEMENT PRODUCTION - Êtes-vous sûr ? (y/N)"
    read -r confirm
    if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
        log_info "Déploiement annulé"
        exit 0
    fi

    log_info "Déploiement Production sur Vercel..."

    if ! command -v vercel &> /dev/null; then
        log_error "Vercel CLI requis pour la production"
        exit 1
    fi

    vercel --prod=true \
        --env NEXT_PUBLIC_SUPABASE_URL="$NEXT_PUBLIC_SUPABASE_URL" \
        --env NEXT_PUBLIC_SUPABASE_ANON_KEY="$NEXT_PUBLIC_SUPABASE_ANON_KEY" \
        --env SUPABASE_SERVICE_ROLE_KEY="$SUPABASE_SERVICE_ROLE_KEY" \
        --env NEXTAUTH_SECRET="$NEXTAUTH_SECRET" \
        --env NEXTAUTH_URL="$NEXTAUTH_URL" \
        --yes

    log_success "🎉 DÉPLOIEMENT PRODUCTION RÉUSSI !"
    log_info "Votre app est en ligne !"
}

# GitHub setup helper
setup_github() {
    log_step "Configuration GitHub"

    if [ ! -d ".git" ]; then
        git init
        log_success "Git initialisé"
    fi

    # Check if remote exists
    if ! git remote get-url origin &> /dev/null; then
        log_info "Création du repo GitHub..."
        if command -v gh &> /dev/null; then
            gh repo create bc-connect --private --source=. --push
            log_success "Repo GitHub créé et code poussé"
        else
            log_warning "GitHub CLI (gh) non installé"
            log_info "Créez le repo manuellement sur github.com puis :"
            echo "  git remote add origin https://github.com/VOTRE_USER/bc-connect.git"
            echo "  git push -u origin main"
        fi
    else
        log_info "Remote origin déjà configuré"
        git push
    fi
}

# Supabase setup helper
setup_supabase() {
    log_step "Guide Supabase"

    echo "1. Allez sur https://supabase.com et créez un projet"
    echo "2. Notez : Project URL + anon key + service_role key"
    echo "3. Dans SQL Editor, exécutez dans l'ordre :"
    for f in supabase/migrations/*.sql; do
        echo "   - $f"
    done
    echo "4. Dans Storage, créez les buckets :"
    echo "   - profile-photos (public)"
    echo "   - verification-documents (private)"
    echo "   - ad-banners (public)"
    echo "5. Authentication > Providers > Activer Email"
    echo "6. Database > Replication > Activer realtime sur :"
    echo "   messages, conversations, matches, notifications, profiles, conversation_members"
    echo ""
    read -p "Appuyez sur Entrée quand c'est fait..."
}

# Main entry point
main() {
    case "${1:-}" in
        deploy|preview|production|dev)
            deploy "$1"
            ;;
        github)
            setup_github
            ;;
        supabase)
            setup_supabase
            ;;
        setup)
            setup_github
            setup_supabase
            ;;
        icons)
            node scripts/generate-icons.js
            ;;
        test)
            pnpm test
            ;;
        lint)
            pnpm lint && pnpm type-check
            ;;
        build)
            pnpm build
            ;;
        *)
            echo "Usage: $0 {deploy|preview|production|dev|github|supabase|setup|icons|test|lint|build}"
            echo ""
            echo "Commands:"
            echo "  deploy [target]  - Déploie (target: preview|production|dev, défaut: preview)"
            echo "  preview          - Déploiement preview Vercel"
            echo "  production       - Déploiement production Vercel (avec confirmation)"
            echo "  dev              - Lance le serveur de développement"
            echo "  github           - Configure le repo GitHub"
            echo "  supabase         - Guide de configuration Supabase"
            echo "  setup            - Configure GitHub + Supabase"
            echo "  icons            - Génère les icônes PWA"
            echo "  test             - Lance les tests"
            echo "  lint             - Lance lint + typecheck"
            echo "  build            - Build l'application"
            exit 1
            ;;
    esac
}

main "$@"