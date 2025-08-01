import { motion, AnimatePresence } from 'framer-motion';
import { modalVariants, backdropVariants } from '@/lib/animations/variants';
import { ReactNode } from 'react';

interface AnimatedModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}

export function AnimatedModal({ isOpen, onClose, children, className }: AnimatedModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
            variants={backdropVariants}
            onClick={onClose}
          />
          
          {/* Modal Content */}
          <motion.div
            className={className}
            variants={modalVariants}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}