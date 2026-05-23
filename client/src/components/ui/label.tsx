import React from 'react';
import { cn } from '@/lib/utils';

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => (
    <label
      className={cn('text-xs font-medium text-editor-textMuted uppercase tracking-wide', className)}
      ref={ref}
      {...props}
    />
  )
);
Label.displayName = 'Label';
