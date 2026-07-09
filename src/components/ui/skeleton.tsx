import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

function Skeleton({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      className={cn('animate-pulse rounded-md bg-zinc-200/90 dark:bg-zinc-800/90', className)}
      {...props}
    />
  );
}

export { Skeleton };
