import { useCallback, useState, type CSSProperties, type ImgHTMLAttributes } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

type ImageWithSkeletonProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'onLoad' | 'onError'> & {
  /** Extra classes for the outer frame (aspect ratio, overflow, etc.). */
  frameClassName?: string;
  /** Inline styles for the outer frame (e.g. dynamic aspect-ratio). */
  frameStyle?: CSSProperties;
  /** Extra classes for the pulsing skeleton layer. */
  skeletonClassName?: string;
  /** Notify parent when the image finishes loading or errors. */
  onStatusChange?: (status: 'loading' | 'loaded' | 'error') => void;
};

/**
 * Lazy image with a shadcn-style pulse skeleton until load/error.
 * Keep layout stable by sizing the frame (aspect-ratio / fixed size), not only the img.
 */
export default function ImageWithSkeleton({
  className = '',
  frameClassName = '',
  frameStyle,
  skeletonClassName = '',
  onStatusChange,
  alt,
  ...imgProps
}: ImageWithSkeletonProps) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  const showSkeleton = status === 'loading';

  const updateStatus = useCallback(
    (next: 'loading' | 'loaded' | 'error') => {
      setStatus(next);
      onStatusChange?.(next);
    },
    [onStatusChange],
  );

  // Cached images may skip onLoad; sync from the DOM node after mount/ref attach.
  const imgRef = useCallback(
    (node: HTMLImageElement | null) => {
      if (!node || status !== 'loading') return;
      if (node.complete && node.naturalWidth > 0) {
        updateStatus('loaded');
      }
    },
    [status, updateStatus],
  );

  return (
    <div className={cn('relative overflow-hidden', frameClassName)} style={frameStyle}>
      {showSkeleton && (
        <Skeleton
          data-skeleton
          aria-hidden="true"
          className={cn('absolute inset-0 rounded-none', skeletonClassName)}
        />
      )}
      <img
        {...imgProps}
        ref={imgRef}
        alt={alt}
        onLoad={() => updateStatus('loaded')}
        onError={() => updateStatus('error')}
        className={cn(
          'block h-full w-full transition-opacity duration-300',
          status === 'loading' ? 'opacity-0' : 'opacity-100',
          className,
        )}
      />
    </div>
  );
}
