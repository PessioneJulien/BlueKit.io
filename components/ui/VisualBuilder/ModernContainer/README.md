# 📦 ModernContainer System

## 🎯 **Objectif**

Système de containers complètement **redesigné** pour résoudre tous les problèmes identifiés :

- ✅ **Mode manuel/auto fonctionnel** 
- ✅ **Redimensionnement facile**
- ✅ **Pas de débordement visuel**
- ✅ **Design moderne 2025**
- ✅ **Toutes les fonctionnalités préservées**

## 🚀 **Nouvelles Fonctionnalités**

### **1. Gestion des ressources intelligente**

#### **Mode Automatique (par défaut)**
```typescript
// Calcule automatiquement les ressources des services contenus
const autoResources = {
  cpu: "2.5 CPUs",    // Somme des CPUs des services
  memory: "4.2 GB",   // Somme de la RAM des services  
  cpuUnits: 2.5,      // Pour les calculs
  memoryMB: 4300      // Pour les calculs
}
```

#### **Mode Manuel**
```typescript
// L'utilisateur définit des limites custom
const manualLimits = {
  cpu: "4 CPUs",      // Limite CPU définie manuellement
  memory: "8 GB"      // Limite RAM définie manuellement
}

// Le système détecte les violations automatiquement
if (autoResources.cpuUnits > manualLimits.cpuUnits) {
  showWarning("CPU dépasse la limite manuelle");
}
```

### **2. Interface redesignée**

```tsx
// Header moderne avec statut en temps réel
<Header>
  <Icon />                    // Docker/Kubernetes icon
  <Title />                   // Nom éditable
  <StatusBadge />            // Running/Stopped avec animation
  <ResourceMode />           // AUTO/MANUAL badge
  <Actions />                // Toggle, menu, etc.
</Header>

// Barre de ressources claire
<ResourceBar>
  <CPUInfo />               // 📊 2.5 CPUs
  <MemoryInfo />            // 💾 4.2 GB  
  <PortsInfo />             // 🌐 3 ports
  <ModeToggle />            // AUTO ⇄ MANUAL
</ResourceBar>

// Zone services optimisée
<ServicesArea>
  <ServiceCard />           // Chaque service avec ses tools
  <ToolsPreview />          // 🎨 Tailwind, 🧪 Jest, etc.
  <ServiceActions />        // Configure, Remove
</ServicesArea>
```

### **3. Redimensionnement amélioré**

```tsx
// Handle de resize visible et fonctionnel
<ResizeHandle 
  size={8}                  // Plus gros (8x8 au lieu de 6x6)
  visible={true}            // Toujours visible quand sélectionné
  tooltip="Drag to resize"  // Tooltip informatif
  minSize={{ width: 320, height: 200 }}
  maxSize={{ width: 1200, height: 800 }}
  onResize={(w, h) => {
    // Mise à jour immédiate avec debounce
    updateContainer(id, { width: w, height: h });
  }}
/>
```

## 🏗 **Architecture Technique**

### **Fichiers créés :**

```
ModernContainer/
├── ModernContainer.tsx           # 🎨 Composant principal redesigné
├── ModernContainerAdapter.tsx    # 🔄 Adaptateur ReactFlow  
├── useContainerData.ts          # 📊 Hook de gestion des données
├── types/ContainerTypes.ts      # 📋 Interfaces TypeScript
└── README.md                    # 📚 Cette documentation
```

### **Intégration ReactFlow :**

```typescript
// Types de nodes étendus
const nodeTypes: NodeTypes = {
  techNode: TechNode,
  containerNode: ContainerNode,          // Ancien système
  modernContainer: ModernContainerAdapter // Nouveau système ✨
};

// Sélection automatique du bon renderer
const nodeType = isContainer ? 'modernContainer' : 'techNode';
```

### **Hook useContainerData :**

```typescript
const {
  containerNodes,           // Containers convertis au format moderne
  convertToModernContainer, // Fonction de conversion
  calculateAutoResources,   // Calcul des ressources auto
  updateContainer,          // Mise à jour d'un container
  addToContainer,          // Ajouter un service
  createModernContainer    // Créer un nouveau container
} = useContainerData(nodes, setNodes);
```

## 🎨 **Design System**

### **Couleurs et styling :**

```css
/* Container principal */
.modern-container {
  background: rgba(30, 41, 59, 0.95);     /* Slate-800/95 */
  border: 2px solid rgba(100, 116, 139, 0.5); /* Slate-600/50 */
  border-radius: 12px;
  backdrop-filter: blur(12px);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

/* Mode automatique */
.resource-auto {
  background: rgba(59, 130, 246, 0.2);    /* Blue-500/20 */
  border: rgba(59, 130, 246, 0.3);        /* Blue-500/30 */
  color: rgba(147, 197, 253, 1);          /* Blue-300 */
}

/* Mode manuel */
.resource-manual {
  background: rgba(249, 115, 22, 0.2);    /* Orange-500/20 */
  border: rgba(249, 115, 22, 0.3);        /* Orange-500/30 */
  color: rgba(253, 186, 116, 1);          /* Orange-300 */
}

/* Warning violations */
.resource-violation {
  border: rgba(239, 68, 68, 0.6);         /* Red-500/60 */
  box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.1);
}
```

### **Animations :**

```tsx
// Container hover
const containerVariants = {
  hover: { scale: 1.01, transition: { duration: 0.2 } },
  drag: { scale: 1.05, rotate: 1, transition: { duration: 0.2 } }
};

// Services expand/collapse
const servicesVariants = {
  hidden: { opacity: 0, height: 0 },
  visible: { opacity: 1, height: 'auto' },
  transition: { duration: 0.3, ease: 'easeInOut' }
};

// Resource mode switch
const badgeVariants = {
  auto: { backgroundColor: 'rgba(59, 130, 246, 0.2)' },
  manual: { backgroundColor: 'rgba(249, 115, 22, 0.2)' },
  transition: { duration: 0.3 }
};
```

## 🔧 **API et Utilisation**

### **Créer un container moderne :**

```typescript
const newContainer = createModernContainer(
  'My Docker Stack',        // Nom
  'docker',                // Type: 'docker' | 'kubernetes'
  { x: 100, y: 100 }       // Position
);

// Le container est automatiquement ajouté aux nodes
```

### **Convertir un container existant :**

```typescript
// Conversion automatique depuis l'ancien format
const modernData = convertToModernContainer(oldContainerNode);

// Toutes les données sont préservées :
// - Services contenus avec leurs tools
// - Configuration des ports/volumes  
// - Variables d'environnement
// - Paramètres de ressources
```

### **Changer le mode de ressources :**

```typescript
// Via l'interface (bouton dans le menu)
onResourceModeChange('container-id', 'manual', {
  cpu: '4 CPUs',
  memory: '8 GB'
});

// Le changement est immédiat et persisté
```

### **Redimensionner un container :**

```typescript
// Via le handle de resize (drag)
onResize('container-id', 500, 400);

// Via l'API programmatique
updateContainer('container-id', { 
  width: 500, 
  height: 400 
});
```

## 🐛 **Problèmes Résolus**

### **Avant (ancien système) ❌**

```typescript
// Mode manuel/auto ne marchait pas
resourceMode: 'manual'  // → Restait en 'auto'

// Pas de redimensionnement
onResize: undefined     // → Handle invisible

// Débordement visuel
height: 'h-full'        // → Contenu dépasse

// Tools invisibles dans containers
showSubTechnologies: false // → Tools perdus
```

### **Après (nouveau système) ✅**

```typescript
// Mode manuel/auto fonctionnel
resourceMode: 'manual'  // → Fonctionne parfaitement
manualLimits: { cpu: '4 CPUs', memory: '8 GB' }

// Redimensionnement fluide
onResize: (id, w, h) => updateContainer(id, { width: w, height: h })
resizeHandle: visible && functional

// Contenu toujours contenu
height: calculated      // → Pas de débordement
overflow: 'hidden'

// Tools toujours visibles
toolsPreview: always    // → 🎨 Tailwind, 🧪 Jest, etc.
```

## 🎯 **Cas d'usage**

### **1. Container Docker simple**
```typescript
const dockerContainer = {
  name: 'Frontend Stack',
  containerType: 'docker',
  resourceMode: 'auto',        // Calcule automatiquement
  containedNodes: [
    { name: 'React', subTechnologies: [tailwind, jest] },
    { name: 'Node.js', subTechnologies: [express] }
  ]
};
```

### **2. Cluster Kubernetes**
```typescript
const k8sContainer = {
  name: 'Microservices Cluster', 
  containerType: 'kubernetes',
  resourceMode: 'manual',      // Limites définies manuellement
  manualLimits: { cpu: '16 CPUs', memory: '32 GB' },
  replicas: 3,
  containedNodes: [/* Multiple services */]
};
```

### **3. Container avec limites**
```typescript
const limitedContainer = {
  resourceMode: 'manual',
  manualLimits: { cpu: '2 CPUs', memory: '4 GB' },
  // Si les services dépassent → Warning automatique ⚠️
};
```

## 🚀 **Performance**

- **React.memo** : Évite les re-renders inutiles
- **useCallback** : Callbacks optimisés
- **Debounced resize** : Pas de lag pendant le redimensionnement
- **Lazy calculation** : Ressources calculées uniquement si nécessaire
- **Efficient updates** : Seulement les containers modifiés sont re-rendus

## 🔮 **Évolutions futures**

### **V2.0 - Monitoring**
- Graphiques de ressources en temps réel
- Alertes sur dépassement de limites
- Historique des performances

### **V2.1 - Templates**
- Templates prédéfinis (MEAN, LAMP, JAMstack)
- Import/Export de configurations
- Partage de containers entre équipes

### **V2.2 - Intelligence**
- Auto-suggestions de ressources
- Détection d'incompatibilités
- Optimisations automatiques

---

**Le nouveau système ModernContainer résout tous les problèmes identifiés tout en apportant un design moderne et des fonctionnalités avancées !** ✨