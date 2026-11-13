'use client';

import * as React from 'react';
import { cn } from '@/lib/utils/cn';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'destructive' | 'success' | 'info';
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = 'default', ...props }, ref) => (
    <div
      ref={ref}
      role="alert"
      className={cn(
        'relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground',
        {
          'bg-card text-card-foreground': variant === 'default',
          'border-destructive/50 text-destructive dark:border-destructive': variant === 'destructive',
          'border-success/50 text-success dark:border-success': variant === 'success',
          'border-info/50 text-info dark:border-info': variant === 'info',
        },
        className
      )}
      {...props}
    />
  )
);
Alert.displayName = 'Alert';

const AlertTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h5 ref={ref} className={cn('mb-1 font-medium leading-none tracking-tight', className)} {...props} />
  )
);
AlertTitle.displayName = 'AlertTitle';

const AlertDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('text-sm [&_p]:leading-relaxed', className)} {...props} />
  )
);
AlertDescription.displayName = 'AlertDescription';

interface AlertIconProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'destructive' | 'success' | 'info';
}

const AlertIcon = React.forwardRef<HTMLDivElement, AlertIconProps>(
  ({ variant = 'default', className, ...props }, ref) => {
    const icons = {
      default: AlertCircle,
      destructive: AlertCircle,
      success: CheckCircle2,
      info: Info,
    };

    const Icon = icons[variant];

    return (
      <div ref={ref} className={cn('text-foreground', className)} {...props}>
        <Icon className="h-4 w-4" />
      </div>
    );
  }
);
AlertIcon.displayName = 'AlertIcon';

const AlertClose = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        className
      )}
      {...props}
    >
      <X className="h-4 w-4" />
      <span className="sr-only">Fermer</span>
    </button>
  )
);
AlertClose.displayName = 'AlertClose';

export { Alert, AlertTitle, AlertDescription, AlertIcon, AlertClose };