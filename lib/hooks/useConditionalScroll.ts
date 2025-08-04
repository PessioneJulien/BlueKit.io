'use client';

import { useEffect, useRef, useState } from 'react';

export const useConditionalScroll = (isOpen: boolean) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [isModalFocused, setIsModalFocused] = useState(false);
  const originalBodyScroll = useRef<string>('');

  useEffect(() => {
    if (!isOpen) return;

    // Sauvegarder le style de scroll original
    originalBodyScroll.current = document.body.style.overflowY || 'auto';

    // Désactiver le scroll par défaut quand le modal s'ouvre
    document.body.style.overflowY = 'hidden';

    const handleMouseEnter = () => {
      setIsModalFocused(true);
    };

    const handleMouseLeave = (e: MouseEvent) => {
      // Vérifier si on sort vraiment du modal (pas juste vers un enfant)
      const relatedTarget = e.relatedTarget as Element;
      const modalElement = modalRef.current;
      
      if (modalElement && !modalElement.contains(relatedTarget)) {
        setIsModalFocused(false);
      }
    };

    const handleClick = (e: MouseEvent) => {
      e.stopPropagation();
      setIsModalFocused(true);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsModalFocused(false);
      }
    };

    // Gérer le scroll de la roue de la souris
    const handleWheel = (e: WheelEvent) => {
      const modalElement = modalRef.current;
      if (!modalElement) return;

      const scrollableContent = modalElement.querySelector('[data-scrollable]') as HTMLElement;
      if (!scrollableContent) return;

      // Si la souris est sur le modal, permettre le scroll du contenu
      if (isModalFocused) {
        const { scrollTop, scrollHeight, clientHeight } = scrollableContent;
        const isScrollingDown = e.deltaY > 0;
        const isScrollingUp = e.deltaY < 0;

        // Empêcher le scroll si on est aux limites
        if ((isScrollingDown && scrollTop + clientHeight >= scrollHeight) || 
            (isScrollingUp && scrollTop <= 0)) {
          e.preventDefault();
        }
      } else {
        // Si pas focusé, empêcher complètement le scroll
        e.preventDefault();
      }
    };

    const modalElement = modalRef.current;
    if (modalElement) {
      modalElement.addEventListener('mouseenter', handleMouseEnter);
      modalElement.addEventListener('mouseleave', handleMouseLeave);
      modalElement.addEventListener('click', handleClick);
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('wheel', handleWheel, { passive: false });
    }

    return () => {
      if (modalElement) {
        modalElement.removeEventListener('mouseenter', handleMouseEnter);
        modalElement.removeEventListener('mouseleave', handleMouseLeave);
        modalElement.removeEventListener('click', handleClick);
      }
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('wheel', handleWheel);
      
      // Restaurer le scroll quand le modal se ferme
      document.body.style.overflowY = originalBodyScroll.current;
    };
  }, [isOpen, isModalFocused]);

  // Restaurer le scroll quand le modal se ferme
  useEffect(() => {
    if (!isOpen) {
      document.body.style.overflow = originalBodyScroll.current;
      setIsModalFocused(false);
    }
  }, [isOpen]);

  return { modalRef, isModalFocused };
};