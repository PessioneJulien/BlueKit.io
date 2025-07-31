#!/bin/bash

# 🚀 Script de Configuration Supabase - BlueKit Stack Builder
# Ce script automatise certaines étapes de la configuration Supabase

set -e  # Arrêter en cas d'erreur

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction d'affichage
print_step() {
    echo -e "${BLUE}🔧 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Vérifier si on est dans le bon dossier
if [ ! -f "package.json" ] || ! grep -q "bluekit" package.json; then
    print_error "Ce script doit être exécuté depuis le dossier racine du projet BlueKit"
    exit 1
fi

echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║             🚀 SETUP SUPABASE - BLUEKIT                   ║"
echo "║                                                            ║"
echo "║  Ce script automatise la configuration de Supabase        ║"
echo "║  Suivez les instructions pour configurer votre projet     ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}\n"

# Étape 1 : Vérifier les prérequis
print_step "Vérification des prérequis..."

# Vérifier si Node.js est installé
if ! command -v node &> /dev/null; then
    print_error "Node.js n'est pas installé. Installez-le depuis https://nodejs.org"
    exit 1
fi

# Vérifier si npm est installé
if ! command -v npm &> /dev/null; then
    print_error "npm n'est pas installé"
    exit 1
fi

print_success "Node.js et npm sont installés"

# Étape 2 : Installer le CLI Supabase
print_step "Installation du CLI Supabase..."

if command -v supabase &> /dev/null; then
    print_success "CLI Supabase déjà installé"
else
    print_warning "Installation du CLI Supabase..."
    
    # Détecter l'OS et installer Supabase CLI
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command -v brew &> /dev/null; then
            brew install supabase/tap/supabase
        else
            print_error "Homebrew n'est pas installé. Installez-le ou utilisez npm install -g supabase"
            npm install -g supabase
        fi
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        npm install -g supabase
    else
        # Windows ou autre
        npm install -g supabase
    fi
    
    print_success "CLI Supabase installé"
fi

# Étape 3 : Configuration des variables d'environnement
print_step "Configuration des variables d'environnement..."

if [ ! -f ".env.local" ]; then
    print_warning "Création du fichier .env.local..."
    cp .env.local.example .env.local
    print_success "Fichier .env.local créé depuis le template"
else
    print_success "Fichier .env.local existe déjà"
fi

# Demander les informations Supabase
echo ""
echo -e "${YELLOW}📝 Veuillez fournir les informations de votre projet Supabase :${NC}"
echo -e "${YELLOW}   (Vous pouvez les trouver dans Settings > API de votre projet Supabase)${NC}"
echo ""

read -p "🌐 Project URL (ex: https://abc123.supabase.co): " SUPABASE_URL
read -p "🔑 Anon Key (eyJ...): " SUPABASE_ANON_KEY
read -p "🔐 Service Role Key (eyJ...): " SUPABASE_SERVICE_KEY

# Générer un secret NextAuth
print_step "Génération du secret NextAuth..."
NEXTAUTH_SECRET=$(openssl rand -base64 32 2>/dev/null || node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")

# Mettre à jour le fichier .env.local
print_step "Mise à jour du fichier .env.local..."

# Utiliser sed pour remplacer les valeurs (compatible macOS et Linux)
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s|NEXT_PUBLIC_SUPABASE_URL=.*|NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL|" .env.local
    sed -i '' "s|NEXT_PUBLIC_SUPABASE_ANON_KEY=.*|NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY|" .env.local
    sed -i '' "s|SUPABASE_SERVICE_ROLE_KEY=.*|SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_KEY|" .env.local
    sed -i '' "s|NEXTAUTH_SECRET=.*|NEXTAUTH_SECRET=$NEXTAUTH_SECRET|" .env.local
else
    # Linux
    sed -i "s|NEXT_PUBLIC_SUPABASE_URL=.*|NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL|" .env.local
    sed -i "s|NEXT_PUBLIC_SUPABASE_ANON_KEY=.*|NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY|" .env.local
    sed -i "s|SUPABASE_SERVICE_ROLE_KEY=.*|SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_KEY|" .env.local
    sed -i "s|NEXTAUTH_SECRET=.*|NEXTAUTH_SECRET=$NEXTAUTH_SECRET|" .env.local
fi

print_success "Variables d'environnement configurées"

# Étape 4 : Se connecter à Supabase
print_step "Connexion à Supabase..."

echo ""
echo -e "${YELLOW}🔐 Connexion à votre compte Supabase...${NC}"
echo -e "${YELLOW}   Cela va ouvrir votre navigateur pour l'authentification${NC}"
echo ""

supabase login

# Extraire le project-ref de l'URL
PROJECT_REF=$(echo $SUPABASE_URL | sed 's|https://||' | sed 's|.supabase.co||')

print_step "Liaison avec le projet Supabase..."
supabase link --project-ref $PROJECT_REF

print_success "Projet lié avec succès"

# Étape 5 : Migrations de la base de données
print_step "Application des migrations de base de données..."

echo ""
echo -e "${YELLOW}📊 Application du schéma de base de données...${NC}"
echo -e "${YELLOW}   Cela peut prendre quelques secondes${NC}"
echo ""

# Essayer d'appliquer les migrations
if supabase db push; then
    print_success "Migrations appliquées avec succès"
else
    print_warning "Échec des migrations automatiques"
    print_warning "Vous devrez appliquer manuellement le schéma :"
    print_warning "1. Aller dans l'éditeur SQL de Supabase"
    print_warning "2. Copier le contenu de supabase/migrations/01_initial_schema.sql"
    print_warning "3. Exécuter le script"
fi

# Étape 6 : Données de base
print_step "Insertion des données de base..."

echo ""
echo -e "${YELLOW}🌱 Insertion des technologies de base...${NC}"
echo -e "${YELLOW}   Vous devrez faire cela manuellement :${NC}"
echo -e "${YELLOW}   1. Aller dans l'éditeur SQL de Supabase${NC}"
echo -e "${YELLOW}   2. Copier le contenu de supabase/seed.sql${NC}"
echo -e "${YELLOW}   3. Exécuter le script${NC}"
echo ""

# Étape 7 : Installation des dépendances
print_step "Installation des dépendances du projet..."

npm install

print_success "Dépendances installées"

# Étape 8 : Test de l'application
print_step "Test de l'application..."

echo ""
echo -e "${YELLOW}🧪 Démarrage de l'application pour test...${NC}"
echo -e "${YELLOW}   L'application va se lancer sur http://localhost:3000${NC}"
echo -e "${YELLOW}   Appuyez sur Ctrl+C pour arrêter le serveur de test${NC}"
echo ""

# Demander si l'utilisateur veut tester maintenant
read -p "🚀 Voulez-vous démarrer l'application maintenant pour tester ? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${GREEN}🎉 Démarrage de l'application...${NC}"
    echo -e "${GREEN}   Ouvrez votre navigateur sur http://localhost:3000${NC}"
    echo -e "${GREEN}   Testez l'inscription et la connexion${NC}"
    echo ""
    npm run dev
else
    echo -e "${BLUE}ℹ️  Vous pouvez démarrer l'application plus tard avec : npm run dev${NC}"
fi

# Récapitulatif final
echo ""
echo -e "${GREEN}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                    🎉 CONFIGURATION TERMINÉE !             ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

echo -e "${GREEN}✅ Configuration Supabase terminée avec succès !${NC}"
echo ""
echo -e "${BLUE}📋 Prochaines étapes :${NC}"
echo "1. 🧪 Tester l'authentification sur http://localhost:3000"
echo "2. 📧 Configurer les templates d'emails dans Supabase"
echo "3. 🔧 Configurer OAuth (GitHub, Google) dans Supabase"
echo "4. 🗄️ Insérer les données de base avec supabase/seed.sql"
echo "5. 📖 Consulter docs/SUPABASE_CHECKLIST.md pour la validation complète"
echo ""
echo -e "${YELLOW}📚 Documentation disponible :${NC}"
echo "- docs/SUPABASE_SETUP.md - Guide complet"
echo "- docs/SUPABASE_CHECKLIST.md - Checklist de validation"
echo "- docs/AUTHENTICATION.md - Guide d'authentification"
echo ""
echo -e "${GREEN}🚀 Votre projet BlueKit est maintenant prêt avec Supabase !${NC}"