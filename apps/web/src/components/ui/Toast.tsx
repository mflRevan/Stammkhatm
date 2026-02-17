import * as React from 'react';
import * as ToastPrimitive from '@radix-ui/react-toast';
import { cn } from '@/lib/utils';

export const ToastProvider = ToastPrimitive.Provider;

export const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Viewport
    ref={ref}
    className={cn(
      'fixed top-4 right-4 z-[120] flex w-full max-w-sm flex-col gap-2 outline-none',
      className,
    )}
    {...props}
  />
));
ToastViewport.displayName = ToastPrimitive.Viewport.displayName;
