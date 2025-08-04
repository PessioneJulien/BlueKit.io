# Guide de Test - Conteneurs Docker/Kubernetes

## 🚀 Comment tester les fonctionnalités de conteneurs

### 1. Charger le template de test
1. Ouvrez l'application Stack Builder
2. Cliquez sur le bouton **🧪 Test Template** dans la toolbar
3. Le template charge automatiquement : Docker + React + Node.js + PostgreSQL

### 2. Tester le drag & drop dans les conteneurs

#### Test 1 : Glisser des composants existants
1. **Glissez React Frontend** directement dans le conteneur Docker (zone pointillée)
2. **Glissez Node.js Backend** dans le conteneur Docker
3. **Observez** : Les composants disparaissent du canvas et apparaissent dans le conteneur

#### Test 2 : Drag & drop depuis la palette
1. Ouvrez la sidebar des composants (à gauche)
2. Glissez un nouveau composant (ex: MongoDB) directement dans le conteneur Docker
3. **Observez** : Le composant est automatiquement ajouté au conteneur

### 3. Tester les vues de conteneurs

#### Vue Imbriquée (par défaut)
1. Dans la sidebar, vérifiez que "Vue Imbriquée" est sélectionnée
2. Les composants apparaissent **à l'intérieur** du conteneur comme des cartes empilées

#### Vue Connectée
1. Changez pour "Vue Connectée" dans la sidebar
2. Les composants apparaissent comme des **services connectés** avec des ports

### 4. Tester la configuration des conteneurs

#### Ouvrir la configuration
1. **Clic droit** sur le conteneur Docker
2. Sélectionnez **"Paramètres"** dans le menu contextuel
3. Un modal de configuration s'ouvre

#### Modifier les ressources
1. Dans l'onglet "Ressources Système" :
   - Changez CPU : `4 cores`
   - Changez Mémoire : `4GB`
   - Changez Stockage : `20GB`
   - Changez Réseau : `1Gbps`

#### Modifier les variables d'environnement
1. Dans l'onglet "Variables d'Environnement" :
   - Ajoutez `DATABASE_URL` = `postgresql://localhost/myapp`
   - Ajoutez `REDIS_URL` = `redis://localhost:6379`

#### Sauvegarder
1. Cliquez sur **"Sauvegarder"**
2. **Observez** : Les nouvelles ressources sont appliquées automatiquement

### 5. Vérifier le calcul automatique des ressources

#### Avant ajout de composants
1. Conteneur Docker seul : `0.5 cores, 256MB`

#### Après ajout de composants  
1. Ajoutez React (1 core, 512MB) + Node.js (2 cores, 1GB)
2. **Ressources calculées automatiquement** :
   - CPU : `3.6 cores` (3 + 20% overhead)
   - Mémoire : `1.8GB` (1.5GB + 20% overhead)

### 6. Tester la suppression de liaisons
1. Créez une connexion entre deux composants
2. **Clic droit** sur la connexion
3. Sélectionnez **"Supprimer la liaison"**

## ✅ Points de validation

### Drag & Drop
- [ ] Glisser composants existants → conteneur ✓
- [ ] Glisser depuis palette → conteneur ✓  
- [ ] Vue imbriquée affiche composants internes ✓
- [ ] Vue connectée affiche services + ports ✓

### Configuration
- [ ] Clic droit → Paramètres ouvre le modal ✓
- [ ] Modification ressources → sauvegarde ✓
- [ ] Ajout variables d'environnement ✓
- [ ] Calcul automatique ressources ✓

### Interface
- [ ] Indicateurs visuels pendant drag ✓
- [ ] Menu contextuel sur connexions ✓
- [ ] Switch vue imbriquée/connectée ✓

## 🐛 Problèmes possibles

### "Les composants ne s'ajoutent pas au conteneur"
- **Solution** : Assurez-vous de glisser dans la **zone pointillée** du conteneur
- **Solution** : Utilisez le template de test (🧪 Test Template) qui a un vrai conteneur

### "Le modal de configuration ne s'ouvre pas"
- **Solution** : Vérifiez que vous faites clic droit sur le **conteneur Docker**, pas sur un composant normal
- **Solution** : Le conteneur doit avoir `isContainer: true`

### "Les ressources ne se calculent pas"
- **Solution** : Les composants doivent avoir des propriétés `resources` définies
- **Solution** : Utilisez le template de test qui a des ressources pré-configurées

## 🔧 Dépannage avancé

### Vérifier qu'un composant est un conteneur
```javascript
// Dans la console du navigateur
console.log(nodes.find(n => n.id === 'docker'));
// Doit avoir: isContainer: true, containerType: 'docker'
```

### Vérifier les ressources agrégées
```javascript
// Les ressources doivent être mises à jour automatiquement
console.log(dockerContainer.resources);
// Doit refléter la somme des composants + overhead
```