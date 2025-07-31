import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  position?: 'left' | 'right' | 'top' | 'bottom';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeButton?: boolean;
  closeOnOverlayClick?: boolean;
  className?: string;
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  children,
  position = 'right',
  size = 'md',
  closeButton = true,
  closeOnOverlayClick = true,
  className,
}) => {
  const sizes = {
    sm: position === 'left' || position === 'right' ? 'max-w-xs' : 'max-h-64',
    md: position === 'left' || position === 'right' ? 'max-w-md' : 'max-h-96',
    lg: position === 'left' || position === 'right' ? 'max-w-lg' : 'max-h-[32rem]',
    xl: position === 'left' || position === 'right' ? 'max-w-2xl' : 'max-h-[40rem]',
  };

  const positions = {
    left: 'fixed inset-y-0 left-0',
    right: 'fixed inset-y-0 right-0',
    top: 'fixed inset-x-0 top-0',
    bottom: 'fixed inset-x-0 bottom-0',
  };

  const transitions = {
    left: {
      enter: 'transform transition ease-in-out duration-300',
      enterFrom: '-translate-x-full',
      enterTo: 'translate-x-0',
      leave: 'transform transition ease-in-out duration-200',
      leaveFrom: 'translate-x-0',
      leaveTo: '-translate-x-full',
    },
    right: {
      enter: 'transform transition ease-in-out duration-300',
      enterFrom: 'translate-x-full',
      enterTo: 'translate-x-0',
      leave: 'transform transition ease-in-out duration-200',
      leaveFrom: 'translate-x-0',
      leaveTo: 'translate-x-full',
    },
    top: {
      enter: 'transform transition ease-in-out duration-300',
      enterFrom: '-translate-y-full',
      enterTo: 'translate-y-0',
      leave: 'transform transition ease-in-out duration-200',
      leaveFrom: 'translate-y-0',
      leaveTo: '-translate-y-full',
    },
    bottom: {
      enter: 'transform transition ease-in-out duration-300',
      enterFrom: 'translate-y-full',
      enterTo: 'translate-y-0',
      leave: 'transform transition ease-in-out duration-200',
      leaveFrom: 'translate-y-0',
      leaveTo: 'translate-y-full',
    },
  };

  const transitionProps = transitions[position];

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

        <div className={positions[position]}>
          <Transition.Child
            as={Fragment}
            enter={transitionProps.enter}
            enterFrom={transitionProps.enterFrom}
            enterTo={transitionProps.enterTo}
            leave={transitionProps.leave}
            leaveFrom={transitionProps.leaveFrom}
            leaveTo={transitionProps.leaveTo}
          >
            <Dialog.Panel
              className={cn(
                'h-full w-full bg-slate-800/95 backdrop-blur-md',
                'border-slate-700/50 shadow-2xl',
                position === 'left' && 'border-r',
                position === 'right' && 'border-l',
                position === 'top' && 'border-b',
                position === 'bottom' && 'border-t',
                sizes[size],
                className
              )}
            >
              {closeButton && (
                <button
                  onClick={onClose}
                  className={cn(
                    'absolute p-2 rounded-lg hover:bg-slate-700/50 transition-colors',
                    position === 'left' ? 'right-4 top-4' : 'left-4 top-4'
                  )}
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              )}
              <div className="h-full overflow-y-auto">
                {children}
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};

interface DrawerHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const DrawerHeader: React.FC<DrawerHeaderProps> = ({ children, className }) => (
  <div className={cn('px-6 pt-6 pb-4', className)}>
    {children}
  </div>
);

interface DrawerTitleProps {
  children: React.ReactNode;
  className?: string;
}

export const DrawerTitle: React.FC<DrawerTitleProps> = ({ children, className }) => (
  <Dialog.Title className={cn('text-xl font-semibold text-slate-100', className)}>
    {children}
  </Dialog.Title>
);

interface DrawerDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export const DrawerDescription: React.FC<DrawerDescriptionProps> = ({ children, className }) => (
  <Dialog.Description className={cn('mt-2 text-sm text-slate-400', className)}>
    {children}
  </Dialog.Description>
);

interface DrawerBodyProps {
  children: React.ReactNode;
  className?: string;
}

export const DrawerBody: React.FC<DrawerBodyProps> = ({ children, className }) => (
  <div className={cn('px-6 py-4', className)}>
    {children}
  </div>
);

interface DrawerFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const DrawerFooter: React.FC<DrawerFooterProps> = ({ children, className }) => (
  <div className={cn('px-6 py-4 border-t border-slate-700/50 flex items-center justify-end gap-3', className)}>
    {children}
  </div>
);