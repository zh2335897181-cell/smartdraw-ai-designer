import React from 'react';
import { cn } from '@/lib/utils';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: { value: string; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, options, ...props }, ref) => (
    <select
      className={cn(
        'flex h-8 w-full rounded border border-editor-border bg-editor-bg px-2 py-1 text-xs text-editor-text focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-editor-accent',
        className
      )}
      ref={ref}
      {...props}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  )
);
Select.displayName = 'Select';
