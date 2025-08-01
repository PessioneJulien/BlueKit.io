import { motion } from 'framer-motion';
import { cardVariants } from '@/lib/animations/variants';
import { ReactNode, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  whileHover?: boolean;
  whileTap?: boolean;
  animate?: boolean;
  delay?: number;
}

export const AnimatedCard = forwardRef<HTMLDivElement, AnimatedCardProps>(
  ({ children, className, onClick, whileHover = true, whileTap = true, animate = true, delay = 0 }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={cn('cursor-pointer', className)}
        variants={cardVariants}
        initial={animate ? "hidden" : false}
        animate={animate ? "visible" : false}
        exit="exit"
        whileHover={whileHover ? "hover" : undefined}
        whileTap={whileTap ? "tap" : undefined}
        onClick={onClick}
        transition={{
          delay,
        }}
      >
        {children}
      </motion.div>
    );
  }
);

AnimatedCard.displayName = 'AnimatedCard';