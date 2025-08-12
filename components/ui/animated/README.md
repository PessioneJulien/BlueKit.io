# Système d'Animations BlueKit.io

## Vue d'ensemble

Le système d'animations de BlueKit.io offre une expérience utilisateur moderne et délicieuse avec des animations fluides, performantes et accessibles. Le système est conçu pour respecter les préférences utilisateur (`prefers-reduced-motion`) et s'adapte automatiquement aux performances du dispositif.

## Architecture

```
lib/
├── animations/
│   ├── animationSystem.ts     # Système d'animation centralisé
│   └── variants.ts           # Variants d'animation de base
├── hooks/
│   ├── useNodeAnimations.ts        # Animations spécifiques aux nodes
│   ├── useConnectionAnimations.ts  # Animations des connexions
│   └── useAnimationPerformance.ts  # Monitoring des performances
components/ui/animated/
├── AnimatedNode.tsx          # Wrapper d'animation pour nodes
├── AnimatedConnection.tsx    # Connexions animées
├── AnimatedBadge.tsx        # Badges avec micro-animations
└── index.ts                 # Exports centralisés
```

## Fonctionnalités Principales

### 🎯 Animations de Node
- **Apparition** : Animation spring avec rotation 3D
- **Disparition** : Dissolve avec effet de blur
- **Hover** : Scale + glow + élévation
- **Sélection** : Ring animé + shadow colorée
- **Drag & Drop** : Ghost avec rotation et transparence
- **Mode Transition** : Morphing fluide compact ↔ extended

### 🔗 Animations de Connexion
- **Dessin progressif** : pathLength animé de 0 à 1
- **Flux de données** : Particules animées le long du path
- **Validation** : Couleurs et patterns selon compatibilité
- **Hover** : Épaississement avec glow effect

### 🏷️ Micro-animations
- **Badges** : Apparition avec spring bounce
- **Buttons** : Scale sur hover/tap
- **Drop zones** : Pulse et couleurs dynamiques

### ⚡ Performance & Accessibilité
- **Auto-adaptation** : Qualité ajustée selon le FPS
- **Reduced Motion** : Respect des préférences système
- **GPU Acceleration** : transform/opacity priority
- **Memory Management** : Cleanup automatique

## Utilisation

### AnimatedNode (Basic)

```tsx
import { AnimatedNode } from '@/components/ui/animated';

<AnimatedNode
  nodeId="tech-react"
  isSelected={selected}
  isCompact={false}
  enableCelebration={true}
>
  <div>Contenu du node</div>
</AnimatedNode>
```

### AnimatedNode (Advanced)

```tsx
const nodeRef = useRef<AnimatedNodeRef>(null);

// Contrôle programmatique
const handleSuccess = () => {
  nodeRef.current?.playSuccessAnimation();
};

<AnimatedNode
  ref={nodeRef}
  nodeId="advanced-node"
  customTransitions={{
    appear: { duration: 1.2 },
    hover: { stiffness: 600 }
  }}
  onDropSuccess={handleSuccess}
>
  <TechNodeContent />
</AnimatedNode>
```

### AnimatedConnection

```tsx
import { AnimatedConnection } from '@/components/ui/animated';

<AnimatedConnection
  connectionId="conn-1"
  sourcePosition={{ x: 100, y: 200 }}
  targetPosition={{ x: 300, y: 400 }}
  showDataFlow={true}
  isValid={true}
  onDrawComplete={() => console.log('Connexion établie')}
/>
```

### AnimatedBadge

```tsx
import { AnimatedBadge, AnimatedBadgeGroup } from '@/components/ui/animated';

<AnimatedBadgeGroup staggerDelay={0.1}>
  <AnimatedBadge delay={0} enablePulse={true} customAnimation="glow">
    Free
  </AnimatedBadge>
  <AnimatedBadge delay={0.1} enableSpring={true}>
    Beginner
  </AnimatedBadge>
</AnimatedBadgeGroup>
```

## Hooks Disponibles

### useNodeAnimations

```tsx
const {
  controls,
  handleAppear,
  handleHover,
  handleSelect,
  handleModeTransition
} = useNodeAnimations(nodeId, {
  enableCelebration: true
});
```

### useAnimationPerformance

```tsx
const {
  metrics,
  performanceMode,
  setPerformanceMode,
  optimizeForPerformance
} = useAnimationPerformance();

console.log(metrics.fps); // FPS en temps réel
console.log(metrics.performanceScore); // 'excellent' | 'good' | 'fair' | 'poor'
```

### useConnectionAnimations

```tsx
const {
  handleConnectionDraw,
  startDataFlowAnimation,
  playValidationAnimation
} = useConnectionAnimations(connectionId);
```

## Configuration du Système

### Performance Mode

```tsx
import { animationSystem } from '@/lib/animations/animationSystem';

// Modes disponibles
animationSystem.setPerformanceMode('quality');    // Max qualité
animationSystem.setPerformanceMode('performance'); // Max performance
animationSystem.setPerformanceMode('auto');       // Auto-ajustement
```

### Custom Animation Types

```tsx
const customConfig = animationSystem.createAnimation('nodeAppear', {
  transition: {
    type: "spring",
    stiffness: 600,
    damping: 20
  }
});
```

## Métriques & Debug

### Performance Monitoring

```tsx
const { metrics, optimizeForPerformance } = useAnimationPerformance();

if (metrics.performanceScore === 'poor') {
  optimizeForPerformance(); // Auto-optimisation
}
```

### Debug Information

```tsx
console.log('FPS:', metrics.fps);
console.log('Frame Drops:', metrics.frameDrops);
console.log('Memory Usage:', metrics.memoryUsage, 'MB');
console.log('Active Animations:', metrics.animationCount);
```

## Best Practices

### 🎨 Animation Design
- **Consistent Timing** : Utiliser les timings standards (0.2s, 0.3s, 0.5s)
- **Purposeful Motion** : Chaque animation guide l'utilisateur
- **Respectful** : Éviter les animations excessives
- **Delightful** : Micro-surprises qui enchantent

### ⚡ Performance
- **Transform over Layout** : Utiliser scale/translate au lieu de width/height
- **Batch Animations** : Grouper les animations simultanées
- **Cleanup** : Nettoyer les animations non utilisées
- **Progressive Enhancement** : Graceful degradation sur anciens devices

### 🎯 Accessibility
- **prefers-reduced-motion** : Toujours respecté
- **Focus Management** : Maintenir l'accessibilité keyboard
- **Screen Reader Friendly** : Pas d'impact sur l'annonce
- **High Contrast** : Animations visibles en mode contraste élevé

## Troubleshooting

### Animations ne s'affichent pas
1. Vérifier `animationSystem.areAnimationsEnabled()`
2. Vérifier les préférences `prefers-reduced-motion`
3. Contrôler le mode performance

### Performance dégradée
1. Utiliser `useAnimationPerformance()` pour les métriques
2. Appeler `optimizeForPerformance()` si nécessaire
3. Réduire le nombre d'animations simultanées

### Animations saccadées
1. Vérifier l'utilisation des propriétés GPU-accelerated
2. Éviter les animations de layout (width, height, top, left)
3. Utiliser `will-change: transform` si nécessaire

## Exemples Complets

Voir `/components/ui/VisualBuilder/TechNode.tsx` pour un exemple d'intégration complète avec ReactFlow et toutes les animations.

---

*Système d'animations conçu pour BlueKit.io - Créé avec Framer Motion et optimisé pour les performances 2025*