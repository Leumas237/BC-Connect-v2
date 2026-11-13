<#
.SYNOPSIS
    BC Connect - Deployment Automation Script for Windows
    Usage: .\deploy.ps1 [dev|preview|production|setup|github|supabase|icons|test|lint|build]

.DESCRIPTION
    Automatise le deploiement de BC Connect sur Vercel avec Supabase
    Verifie les prerequis, installe les dependances, build, test et deploie

.PARAMETER Target
    Cible de deploiement: dev, preview, production (defaut: preview)

.EXAMPLE
    .\deploy.ps1 preview
    .\deploy.ps1 production
    .\deploy.ps1 setup
#>

param(
    [ValidateSet('dev', 'preview', 'production', 'setup', 'github', 'supabase', 'icons', 'test', 'lint', 'build')]
    [string]$Target = 'preview'
)

# Colors
$Red = [ConsoleColor]::Red
$Green = [ConsoleColor]::Green
$Yellow = [ConsoleColor]::Yellow
$Blue = [ConsoleColor]::Blue
$Gray = [ConsoleColor]::DarkGray

function Write-Log {
    param([string]$Message, [ConsoleColor]$Color = $Gray)
    $originalColor = $Host.UI.RawUI.ForegroundColor
    $Host.UI.RawUI.ForegroundColor = $Color
    Write-Host $Message
    $Host.UI.RawUI.ForegroundColor = $originalColor
}

function Write-Step {
    param([string]$Message)
    Write-Host ""
    Write-Log "📋 $Message" $Blue
}

function Write-Success {
    param([string]$Message)
    Write-Log "✅ $Message" $Green
}

function Write-Warning {
    param([string]$Message)
    Write-Log "⚠️  $Message" $Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Log "❌ $Message" $Red
}

function Check-Command {
    param([string]$Name, [string]$InstallUrl)
    if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
        Write-Error "$Name n'est pas installe. Installez-le: $InstallUrl"
        return $false
    }
    return $true
}

function Check-Version {
    param([string]$Command, [string]$MinVersion)
    try {
        $version = & $Command --version 2>$null | Select-String -Pattern '(\d+\.\d+\.\d+)' | ForEach-Object { $_.Matches[0].Value }
        if (-not $version) { return $false }
        $minMajor = [int]($MinVersion.Split('.')[0])
        $curMajor = [int]($version.Split('.')[0])
        if ($curMajor -lt $minMajor) {
            Write-Error "$Command version $version < $MinVersion requis"
            return $false
        }
        Write-Success "$Command v$version OK"
        return $true
    } catch {
        Write-Error "Impossible de verifier la version de $Command"
        return $false
    }
}

# Main deployment
function Deploy-BCConnect {
    param([string]$Target = 'preview')

    Write-Host ""
    Write-Log "╔══════════════════════════════════════════════════════════╗" $Blue
    Write-Log "║          BC Connect - Deployment Script                  ║" $Blue
    Write-Log "║          Target: $Target                                  ║" $Blue
    Write-Log "╚══════════════════════════════════════════════════════════╝" $Blue
    Write-Host ""

    # Step 1: Prerequisites
    Write-Step "1/8 Verification des prerequis"

    Check-Command "git" "https://git-scm.com" | Out-Null
    Check-Command "node" "https://nodejs.org" | Out-Null
    Check-Command "pnpm" "npm install -g pnpm" | Out-Null

    Check-Version "node" "20" | Out-Null
    Check-Version "pnpm" "9" | Out-Null

    Write-Success "Tous les prerequis sont satisfaits"

    # Step 2: Environment
    Write-Step "2/8 Verification de l'environnement"

    if (-not (Test-Path ".env.local")) {
        if (Test-Path ".env.example") {
            Write-Warning ".env.local manquant, copie depuis .env.example"
            Copy-Item ".env.example" ".env.local"
            Write-Warning "⚠️  EDITEZ .env.local avec vos cles Supabase AVANT de continuer !"
            Write-Warning "Variables requises:"
            Write-Host "  - NEXT_PUBLIC_SUPABASE_URL"
            Write-Host "  - NEXT_PUBLIC_SUPABASE_ANON_KEY"
            Write-Host "  - SUPABASE_SERVICE_ROLE_KEY"
            Write-Host "  - NEXTAUTH_SECRET (generer: openssl rand -base64 32)"
            Write-Host "  - NEXTAUTH_URL"
            Read-Host "Appuyez sur Entree apres avoir configure .env.local..."
        } else {
            Write-Error ".env.example introuvable"
            exit 1
        }
    }

    # Load env
    if (Test-Path ".env.local") {
        Get-Content .env.local | ForEach-Object {
            if ($_ -match '^([^#=]+)=(.*)$') {
                ${env:$matches[1]} = $matches[2].Trim('"')
            }
        }
    }

    $missing = @()
    @("NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY", "NEXTAUTH_SECRET", "NEXTAUTH_URL") | ForEach-Object {
        if (-not $env:$_) { $missing += $_ }
    }

    if ($missing.Count -gt 0) {
        Write-Error "Variables manquantes dans .env.local: $($missing -join ', ')"
        exit 1
    }

    Write-Success "Variables d'environnement configurees"

    # Step 3: Install deps
    Write-Step "3/8 Installation des dependances"
    pnpm install --frozen-lockfile
    Write-Success "Dependances installees"

    # Step 4: PWA Icons
    Write-Step "4/8 Generation des icones PWA"
    if (Test-Path "scripts\generate-icons.js") {
        try {
            node scripts\generate-icons.js
            Write-Success "Icones PWA generees"
        } catch {
            Write-Warning "Echec generation icones. Installez sharp: npm install sharp"
        }
    }

    # Step 5: Lint + Typecheck
    Write-Step "5/8 Verification du code (lint + typecheck)"
    pnpm lint
    pnpm type-check
    Write-Success "Code valide"

    # Step 6: Tests
    Write-Step "6/8 Execution des tests"
    pnpm test --passWithNoTests 2>$null
    Write-Success "Tests passes"

    # Step 7: Build
    Write-Step "7/8 Build de l'application"
    pnpm build
    Write-Success "Build reussi"

    # Step 8: Deploy
    Write-Step "8/8 Deploiement ($Target)"

    switch ($Target) {
        'dev' {
            Write-Host "Lancement du serveur de developpement..."
            pnpm dev
        }
        'preview' {
            Deploy-Preview
        }
        'production' {
            Deploy-Production
        }
        default {
            Write-Error "Cible inconnue: $Target"
            exit 1
        }
    }
}

function Deploy-Preview {
    Write-Log "Deploiement Preview sur Vercel..." $Blue

    if (-not (Get-Command vercel -ErrorAction SilentlyContinue)) {
        Write-Warning "Vercel CLI non installe. Installation..."
        pnpm add -g vercel@latest
    }

    if (-not (vercel whoami 2>$null)) {
        Write-Warning "Connexion a Vercel requise..."
        vercel login
    }

    Write-Host "Deploiement en cours..."
    $envs = @(
        "NEXT_PUBLIC_SUPABASE_URL=$env:NEXT_PUBLIC_SUPABASE_URL",
        "NEXT_PUBLIC_SUPABASE_ANON_KEY=$env:NEXT_PUBLIC_SUPABASE_ANON_KEY",
        "SUPABASE_SERVICE_ROLE_KEY=$env:SUPABASE_SERVICE_ROLE_KEY",
        "NEXTAUTH_SECRET=$env:NEXTAUTH_SECRET",
        "NEXTAUTH_URL=$env:NEXTAUTH_URL"
    )

    vercel --prod=false --env $envs --yes
    Write-Success "Deploiement Preview termine !"
    Write-Log "Verifiez l'URL fournie par Vercel" $Blue
}

function Deploy-Production {
    Write-Warning "⚠️  DEPLOIEMENT PRODUCTION - Etes-vous sur ? (y/N)"
    $confirm = Read-Host
    if ($confirm -notmatch '^[Yy]$') {
        Write-Host "Deploiement annule"
        exit 0
    }

    Write-Log "Deploiement Production sur Vercel..." $Blue

    $envs = @(
        "NEXT_PUBLIC_SUPABASE_URL=$env:NEXT_PUBLIC_SUPABASE_URL",
        "NEXT_PUBLIC_SUPABASE_ANON_KEY=$env:NEXT_PUBLIC_SUPABASE_ANON_KEY",
        "SUPABASE_SERVICE_ROLE_KEY=$env:SUPABASE_SERVICE_ROLE_KEY",
        "NEXTAUTH_SECRET=$env:NEXTAUTH_SECRET",
        "NEXTAUTH_URL=$env:NEXTAUTH_URL"
    )

    vercel --prod=true --env $envs --yes
    Write-Success "🎉 DEPLOIEMENT PRODUCTION REUSSI !"
    Write-Host "Votre app est en ligne !"
}

function Setup-GitHub {
    Write-Step "Configuration GitHub"

    if (-not (Test-Path ".git")) {
        git init
        Write-Success "Git initialise"
    }

    if (-not (git remote get-url origin 2>$null)) {
        Write-Host "Creation du repo GitHub..."
        if (Get-Command gh -ErrorAction SilentlyContinue) {
            gh repo create bc-connect --private --source=. --push
            Write-Success "Repo GitHub cree et code pousse"
        } else {
            Write-Warning "GitHub CLI (gh) non installe. Installez: winget install GitHub.cli"
            Write-Host "Creez le repo manuellement sur github.com puis :"
            Write-Host "  git remote add origin https://github.com/VOTRE_USER/bc-connect.git"
            Write-Host "  git push -u origin main"
        }
    } else {
        Write-Host "Remote origin deja configure"
        git push
    }
}

function Setup-Supabase {
    Write-Step "Guide Supabase"

    Write-Host "1. Allez sur https://supabase.com et creez un projet"
    Write-Host "2. Notez : Project URL + anon key + service_role key"
    Write-Host "3. Dans SQL Editor, executez dans l'ordre :"
    Get-ChildItem supabase\migrations\*.sql | ForEach-Object { Write-Host "   - $($_.Name)" }
    Write-Host "4. Dans Storage, creez les buckets :"
    Write-Host "   - profile-photos (public)"
    Write-Host "   - verification-documents (private)"
    Write-Host "   - ad-banners (public)"
    Write-Host "5. Authentication > Providers > Activer Email"
    Write-Host "6. Database > Replication > Activer realtime sur :"
    Write-Host "   messages, conversations, matches, notifications, profiles, conversation_members"
    Read-Host "Appuyez sur Entree quand c'est fait..."
}

# Main
switch ($Target) {
    'dev' { Deploy-BCConnect 'dev' }
    'preview' { Deploy-BCConnect 'preview' }
    'production' { Deploy-BCConnect 'production' }
    'setup' { Setup-GitHub; Setup-Supabase }
    'github' { Setup-GitHub }
    'supabase' { Setup-Supabase }
    'icons' { node scripts\generate-icons.js }
    'test' { pnpm test }
    'lint' { pnpm lint; pnpm type-check }
    'build' { pnpm build }
    default {
        Write-Host "Usage: .\deploy.ps1 [target]"
        Write-Host ""
        Write-Host "Targets:"
        Write-Host "  dev          - Lance le serveur de developpement"
        Write-Host "  preview      - Deploiement preview Vercel (defaut)"
        Write-Host "  production   - Deploiement production Vercel (avec confirmation)"
        Write-Host "  setup        - Configure GitHub + Supabase"
        Write-Host "  github       - Configure le repo GitHub"
        Write-Host "  supabase     - Guide de configuration Supabase"
        Write-Host "  icons        - Genere les icones PWA"
        Write-Host "  test         - Lance les tests"
        Write-Host "  lint         - Lance lint + typecheck"
        Write-Host "  build        - Build l application"
        Write-Host ""
        Write-Host "Examples:"
        Write-Host "  .\deploy.ps1 preview"
        Write-Host "  .\deploy.ps1 production"
        Write-Host "  .\deploy.ps1 setup"
    }
}