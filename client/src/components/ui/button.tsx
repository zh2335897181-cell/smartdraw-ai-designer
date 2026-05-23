import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'ghost' | 'outline' | 'primary';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => {
    const base = 'inline-flex items-center justify-center rounded font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-editor-accent disabled:pointer-events-none disabled:opacity-50';
    const variants: Record<string, string> = {
      default: 'bg-editor-surface hover:bg-editor-hover text-editor-text border border-editor-border',
      ghost: 'hover:bg-editor-hover text-editor-text',
      outline: 'border border-editor-border bg-transparent hover:bg-editor-hover text-editor-text',
      primary: 'bg-editor-accent hover:bg-blue-600 text-white',
    };
    const sizes: Record<string, string> = {
      sm: 'h-7 px-2 text-xs',
      md: 'h-8 px-3 text-sm',
      lg: 'h-10 px-4 text-sm',
      icon: 'h-8 w-8 p-0',
    };
    return (
      <button className={cn(base, variants[variant], sizes[size], className)} ref={ref} {...props} />
    );
  }
);
Button.displayName = 'Button';
