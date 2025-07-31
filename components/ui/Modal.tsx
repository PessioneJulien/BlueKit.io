import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeButton?: boolean;
  closeOnOverlayClick?: boolean;
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  size = 'md',
  closeButton = true,
  closeOnOverlayClick = true,
  className,
}) => {
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-7xl',
  };

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
        onClose={closeOnOverlayClick ? onClose : () => {}}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel
                className={cn(
                  'w-full transform overflow-hidden rounded-xl',
                  'bg-slate-800/90 backdrop-blur-md border border-slate-700/50',
                  'shadow-2xl transition-all',
                  sizes[size],
                  className
                )}
              >
                {closeButton && (
                  <button
                    onClick={onClose}
                    className="absolute right-4 top-4 p-2 rounded-lg hover:bg-slate-700/50 transition-colors"
                  >
                    <X className="w-5 h-5 text-slate-400" />
                  </button>
                )}
                {children}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

interface ModalHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const ModalHeader: React.FC<ModalHeaderProps> = ({ children, className }) => (
  <div className={cn('px-6 pt-6 pb-4', className)}>
    {children}
  </div>
);

interface ModalTitleProps {
  children: React.ReactNode;
  className?: string;
}

export const ModalTitle: React.FC<ModalTitleProps> = ({ children, className }) => (
  <Dialog.Title className={cn('text-xl font-semibold text-slate-100', className)}>
    {children}
  </Dialog.Title>
);

interface ModalDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export const ModalDescription: React.FC<ModalDescriptionProps> = ({ children, className }) => (
  <Dialog.Description className={cn('mt-2 text-sm text-slate-400', className)}>
    {children}
  </Dialog.Description>
);

interface ModalBodyProps {
  children: React.ReactNode;
  className?: string;
}

export const ModalBody: React.FC<ModalBodyProps> = ({ children, className }) => (
  <div className={cn('px-6 py-4', className)}>
    {children}
  </div>
);

interface ModalFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const ModalFooter: React.FC<ModalFooterProps> = ({ children, className }) => (
  <div className={cn('px-6 py-4 border-t border-slate-700/50 flex items-center justify-end gap-3', className)}>
    {children}
  </div>
);