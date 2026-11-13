'use client';

import { Button } from '@/components/ui/button';
import { Heart, X, Star, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface ActionButtonsProps {
  onLike: () => void;
  onPass: () => void;
  onSuperLike: () => void;
  disabled?: boolean;
  isLoading?: boolean;
}

export function ActionButtons({ onLike, onPass, onSuperLike, disabled, isLoading }: ActionButtonsProps) {
  return (
    <div className="flex items-center justify-center gap-4" role="group" aria-label="Actions de découverte">
      <Button
        variant="swipe"
        className="btn-pass"
        onClick={onPass}
        disabled={disabled || isLoading}
        aria-label="Passer"
        aria-pressed={false}
      >
        {isLoading ? (
          <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
        ) : (
          <X className="h-7 w-7" aria-hidden="true" />
        )}
        <span className="sr-only">Passer</span>
      </Button>

      <Button
        variant="swipe"
        className={cn(
          'bg-gradient-to-br from-accent to-accent-light text-accent-foreground shadow-xl',
          isLoading && 'opacity-50'
        )}
        onClick={onSuperLike}
        disabled={disabled || isLoading}
        aria-label="Super Like"
        aria-pressed={false}
      >
        {isLoading ? (
          <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
        ) : (
          <Star className="h-7 w-7 fill-current" aria-hidden="true" />
        )}
        <span className="sr-only">Super Like</span>
      </Button>

      <Button
        variant="swipe"
        className="btn-like"
        onClick={onLike}
        disabled={disabled || isLoading}
        aria-label="Liker"
        aria-pressed={false}
      >
        {isLoading ? (
          <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
        ) : (
          <Heart className="h-7 w-7 fill-current" aria-hidden="true" />
        )}
        <span className="sr-only">Liker</span>
      </Button>
    </div>
  );
}

// Compact version for mobile
export function CompactActionButtons({ onLike, onPass, onSuperLike, disabled, isLoading }: ActionButtonsProps) {
  return (
    <div className="flex items-center justify-center gap-2" role="group" aria-label="Actions de découverte">
      <Button
        variant="outline"
        size="sm"
        className="h-10 w-10 rounded-full"
        onClick={onPass}
        disabled={disabled || isLoading}
        aria-label="Passer"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <X className="h-5 w-5 text-red-500" aria-hidden="true" />
        )}
      </Button>

      <Button
        variant="default"
        size="sm"
        className="h-10 w-10 rounded-full bg-gradient-to-br from-accent to-accent-light text-accent-foreground"
        onClick={onSuperLike}
        disabled={disabled || isLoading}
        aria-label="Super Like"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <Star className="h-5 w-5 fill-current" aria-hidden="true" />
        )}
      </Button>

      <Button
        variant="default"
        size="sm"
        className="h-10 w-10 rounded-full bg-green-500 text-green-500-foreground"
        onClick={onLike}
        disabled={disabled || isLoading}
        aria-label="Liker"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <Heart className="h-5 w-5 fill-current text-white" aria-hidden="true" />
        )}
      </Button>
    </div>
  );
}