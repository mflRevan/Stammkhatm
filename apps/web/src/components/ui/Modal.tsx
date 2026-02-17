import React, { Fragment, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

export function Modal({ open, onClose, children }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative z-[110] w-full max-w-md rounded-xl bg-card/95 p-6 shadow-2xl border border-white/40 backdrop-blur-xl animate-scale-in dark:border-white/10">
        {children}
      </div>
    </div>
  );
}

export function ModalTitle({ children, className }: { children: ReactNode; className?: string }) {
  return <h2 className={cn('text-lg font-semibold mb-2', className)}>{children}</h2>;
}

export function ModalDescription({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn('text-sm text-muted-foreground mb-4 leading-relaxed', className)}>{children}</p>;
}

export function ModalFooter({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('flex justify-end gap-2 mt-6 pt-4 border-t', className)}>{children}</div>;
}
