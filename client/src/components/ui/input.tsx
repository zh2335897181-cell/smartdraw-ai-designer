import React from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => (
    <input
      className={cn(
        'flex h-9 w-full rounded-md border border-editor-border bg-editor-bg px-3 py-1 text-sm text-editor-text placeholder:text-editor-textMuted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-editor-accent',
        className
      )}
      ref={ref}
      {...props}
    />
  )
);
Input.displayName = 'Input';
