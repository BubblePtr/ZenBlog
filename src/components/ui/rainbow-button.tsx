import type { AnchorHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

type RainbowButtonProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: ReactNode;
  className?: string;
  href: string;
};

const baseClassName = cn(
  'relative inline-flex items-center justify-center gap-2 overflow-visible',
  'h-10 px-4 text-sm whitespace-nowrap no-underline',
  'rounded-md',
  'font-normal text-white',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400/60 dark:focus-visible:ring-zinc-500/70',
  'animate-[rainbow_4.8s_linear_infinite]',
  'bg-[linear-gradient(#121213,#121213),linear-gradient(#121213_50%,rgba(18,18,19,0.65)_82%,rgba(18,18,19,0)),linear-gradient(90deg,var(--rainbow-color-1),var(--rainbow-color-5),var(--rainbow-color-3),var(--rainbow-color-4),var(--rainbow-color-2))]',
  'bg-[length:200%] [background-clip:padding-box,border-box,border-box] [background-origin:border-box] [border:2px_solid_transparent]',
  'before:pointer-events-none before:absolute before:bottom-[-18%] before:left-1/2 before:-z-10 before:h-1/4 before:w-3/5 before:-translate-x-1/2 before:animate-[rainbow_4.8s_linear_infinite]',
  'before:bg-[linear-gradient(90deg,var(--rainbow-color-1),var(--rainbow-color-5),var(--rainbow-color-3),var(--rainbow-color-4),var(--rainbow-color-2))] before:[filter:blur(0.8rem)] before:opacity-55',
  'dark:bg-[linear-gradient(#fff,#fff),linear-gradient(#fff_50%,rgba(255,255,255,0.6)_82%,rgba(255,255,255,0)),linear-gradient(90deg,var(--rainbow-color-1),var(--rainbow-color-5),var(--rainbow-color-3),var(--rainbow-color-4),var(--rainbow-color-2))]',
  'dark:text-zinc-950',
);

export function RainbowButton(props: RainbowButtonProps) {
  const { children, className, href, ...rest } = props;

  return (
    <a href={href} className={cn(baseClassName, className)} {...rest}>
      <span className="relative z-10 inline-flex items-center gap-2 whitespace-nowrap">
        {children}
      </span>
    </a>
  );
}
