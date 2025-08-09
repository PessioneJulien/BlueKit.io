#!/bin/bash

# Script pour tester le drag & drop des composants communautaires
echo "🚀 Test du drag & drop des composants communautaires"
echo "=================================================="

# Vérifier si le serveur est démarré
if ! curl -s http://localhost:3000 > /dev/null; then
    echo "❌ Le serveur n'est pas démarré sur localhost:3000"
    echo "💡 Démarrez le serveur avec: npm run dev"
    exit 1
fi

echo "✅ Serveur détecté sur localhost:3000"

# Lancer les tests Cypress spécifiques
echo "🧪 Lancement des tests Cypress..."
echo ""

# Test des composants communautaires
echo "🔍 Test 1: Composants communautaires"
npx cypress run --spec "cypress/e2e/community-components.cy.ts" --browser chrome

# Si le test passe, montrer les instructions pour le test manuel
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Tests automatiques passés !"
    echo ""
    echo "📋 Instructions pour le test manuel du drag & drop:"
    echo "1. Ouvrir http://localhost:3000/components"
    echo "2. Vérifier que les composants ont une icône de drag (⋮⋮)"
    echo "3. Ouvrir http://localhost:3000/builder dans un nouvel onglet"
    echo "4. Glisser un composant depuis /components vers /builder"
    echo "5. Vérifier dans la console que les logs apparaissent:"
    echo "   - '🎯 Dropped data: {...}'"
    echo "   - '✅ Handling drop for type: community-component'"
    echo "6. Vérifier que le composant apparaît dans le canvas"
    echo ""
    echo "🔧 Si le drag & drop ne fonctionne pas:"
    echo "- Vérifier la console pour les erreurs"
    echo "- S'assurer que les data-testid sont présents"
    echo "- Vérifier que l'API /api/components retourne des données"
else
    echo "❌ Tests automatiques échoués"
    echo "🔧 Vérifiez les erreurs ci-dessus et corrigez les problèmes"
fi