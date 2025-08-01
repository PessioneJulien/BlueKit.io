import { Variants } from 'framer-motion';

// Animations pour les modals
export const modalVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
    y: 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      damping: 25,
      stiffness: 300,
      duration: 0.3,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    y: 20,
    transition: {
      duration: 0.2,
    },
  },
};

// Animations pour les backdrop
export const backdropVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.2,
    },
  },
};

// Animations pour les cartes/composants
export const cardVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      damping: 20,
      stiffness: 300,
    },
  },
  hover: {
    y: -2,
    scale: 1.02,
    transition: {
      type: 'spring',
      damping: 15,
      stiffness: 300,
    },
  },
  tap: {
    scale: 0.98,
  },
  exit: {
    opacity: 0,
    y: 20,
    scale: 0.95,
    transition: {
      duration: 0.2,
    },
  },
};

// Animations pour les boutons
export const buttonVariants: Variants = {
  hover: {
    scale: 1.05,
    transition: {
      type: 'spring',
      damping: 15,
      stiffness: 400,
    },
  },
  tap: {
    scale: 0.95,
  },
};

// Animations pour les badges/tags
export const badgeVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      damping: 20,
      stiffness: 400,
    },
  },
  hover: {
    scale: 1.1,
    transition: {
      type: 'spring',
      damping: 10,
      stiffness: 400,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    transition: {
      duration: 0.15,
    },
  },
};

// Animations pour le drag & drop
export const dragVariants: Variants = {
  hover: {
    scale: 1.05,
    rotate: 2,
    transition: {
      type: 'spring',
      damping: 15,
      stiffness: 300,
    },
  },
  drag: {
    scale: 1.1,
    rotate: 5,
    zIndex: 1000,
    transition: {
      type: 'spring',
      damping: 10,
      stiffness: 200,
    },
  },
  drop: {
    scale: 1,
    rotate: 0,
    transition: {
      type: 'spring',
      damping: 20,
      stiffness: 300,
    },
  },
};

// Animations pour les nodes du canvas
export const nodeVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.3,
    rotate: -10,
  },
  visible: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: {
      type: 'spring',
      damping: 20,
      stiffness: 300,
      delay: 0.1,
    },
  },
  compact: {
    scale: 0.9,
    transition: {
      type: 'spring',
      damping: 25,
      stiffness: 400,
      duration: 0.3,
    },
  },
  expanded: {
    scale: 1,
    transition: {
      type: 'spring',
      damping: 25,
      stiffness: 400,
      duration: 0.3,
    },
  },
  hover: {
    scale: 1.05,
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
    transition: {
      type: 'spring',
      damping: 15,
      stiffness: 300,
    },
  },
  selected: {
    scale: 1.02,
    boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.5)',
    transition: {
      type: 'spring',
      damping: 20,
      stiffness: 400,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.3,
    rotate: 10,
    transition: {
      duration: 0.2,
    },
  },
};

// Animations pour les connexions
export const connectionVariants: Variants = {
  hidden: {
    pathLength: 0,
    opacity: 0,
  },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: {
        type: 'spring',
        damping: 25,
        stiffness: 200,
        duration: 0.8,
      },
      opacity: {
        duration: 0.3,
      },
    },
  },
  hover: {
    strokeWidth: 4,
    transition: {
      duration: 0.2,
    },
  },
  exit: {
    pathLength: 0,
    opacity: 0,
    transition: {
      duration: 0.3,
    },
  },
};

// Animations pour les listes/containers
export const containerVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
};

// Animations pour les éléments de liste
export const listItemVariants: Variants = {
  hidden: {
    opacity: 0,
    x: -20,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: 'spring',
      damping: 20,
      stiffness: 300,
    },
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: {
      duration: 0.15,
    },
  },
};

// Animations pour les zones de drop
export const dropZoneVariants: Variants = {
  inactive: {
    scale: 1,
    backgroundColor: 'rgba(100, 116, 139, 0.1)',
    borderColor: 'rgba(100, 116, 139, 0.3)',
  },
  active: {
    scale: 1.02,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderColor: 'rgba(59, 130, 246, 0.5)',
    transition: {
      type: 'spring',
      damping: 20,
      stiffness: 400,
    },
  },
  hover: {
    scale: 1.05,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderColor: 'rgba(59, 130, 246, 0.7)',
    transition: {
      type: 'spring',
      damping: 15,
      stiffness: 400,
    },
  },
};

// Animations pour les notifications/toasts
export const toastVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 50,
    scale: 0.3,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      damping: 20,
      stiffness: 400,
    },
  },
  exit: {
    opacity: 0,
    y: 50,
    scale: 0.3,
    transition: {
      duration: 0.2,
    },
  },
};

// Animations pour les slides/pages
export const slideVariants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 1000 : -1000,
    opacity: 0,
  }),
};

// Transitions par défaut
export const defaultTransition = {
  type: 'spring',
  damping: 25,
  stiffness: 300,
};

export const fastTransition = {
  type: 'spring',
  damping: 30,
  stiffness: 400,
  duration: 0.2,
};

export const slowTransition = {
  type: 'spring',
  damping: 20,
  stiffness: 200,
  duration: 0.5,
};