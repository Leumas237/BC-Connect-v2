'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/use-auth';
import { useDiscovery, useSwipe, useSuperLike } from '@/lib/hooks/use-discovery';
import { ProfileCard } from '@/components/profile/profile-card';
import { Button } from '@/components/ui/button';
import { Heart, X, Star, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { DiscoveryProfile } from '@/lib/hooks/use-discovery';

const MAX_VISIBLE_CARDS = 3;
const SWIPE_THRESHOLD = 100;

interface SwipeStackProps {
  onMatch?: (profile: DiscoveryProfile) => void;
}

export function SwipeStack({ onMatch }: SwipeStackProps) {
  const { profile: currentUser } = useAuth();
  const { data: profiles = [], isLoading, refetch } = useDiscovery();
  const swipeMutation = useSwipe();
  const superLikeMutation = useSuperLike();
  const [cardStack, setCardStack] = useState<DiscoveryProfile[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [dragRotation, setDragRotation] = useState(0);
  const [showIndicators, setShowIndicators] = useState({ left: false, right: false });
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Initialize card stack
  useEffect(() => {
    if (profiles.length > 0) {
      setCardStack(profiles.slice(0, MAX_VISIBLE_CARDS));
      setActiveIndex(0);
    }
  }, [profiles]);

  // Refetch when stack is low
  useEffect(() => {
    if (cardStack.length <= 1 && !isLoading) {
      refetch();
    }
  }, [cardStack.length, isLoading, refetch]);

  const handleDragStart = useCallback((e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (isLoading || swipeMutation.isPending) return;

    const isTouch = 'touches' in e;
    const clientX = isTouch ? e.touches[0]?.clientX : e.clientX;
    const clientY = isTouch ? e.touches[0]?.clientY : e.clientY;

    if (clientX === undefined || clientY === undefined) return;

    const startX = clientX;
    const startY = clientY;

    const handleMove = (moveEvent: MouseEvent | TouchEvent) => {
      const isTouchMove = 'touches' in moveEvent;
      const currentX = isTouchMove ? moveEvent.touches[0]?.clientX : moveEvent.clientX;
      const currentY = isTouchMove ? moveEvent.touches[0]?.clientY : moveEvent.clientY;

      if (currentX === undefined || currentY === undefined) return;

      const deltaX = currentX - startX;
      const deltaY = currentY - startY;

      setDragOffset({ x: deltaX, y: deltaY });
      setDragRotation(deltaX * 0.1);

      // Show indicators
      if (deltaX > 30) setShowIndicators({ left: true, right: false });
      else if (deltaX < -30) setShowIndicators({ left: false, right: true });
      else setShowIndicators({ left: false, right: false });
    };

    const handleEnd = () => {
      const { x } = dragOffset;

      if (Math.abs(x) > SWIPE_THRESHOLD) {
        // Swipe!
        const direction = x > 0 ? 'like' : 'pass';
        const currentProfile = cardStack[activeIndex];
        if (!currentProfile) return;

        if (direction === 'like') {
          swipeMutation.mutate({ targetId: currentProfile.id, swipeType: 'like' });
        } else {
          swipeMutation.mutate({ targetId: currentProfile.id, swipeType: 'pass' });
        }

        // Animate out
        setDragOffset({ x: x > 0 ? 500 : -500, y: dragOffset.y });
        setDragRotation(x > 0 ? 30 : -30);

        setTimeout(() => {
          nextCard();
        }, 300);
      } else {
        // Snap back
        setDragOffset({ x: 0, y: 0 });
        setDragRotation(0);
        setShowIndicators({ left: false, right: false });
      }

      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleMove);
      document.removeEventListener('touchend', handleEnd);
    };

    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchmove', handleMove, { passive: true });
    document.addEventListener('touchend', handleEnd);
  }, [dragOffset, activeIndex, cardStack, swipeMutation, isLoading]);

  const nextCard = useCallback(() => {
    setDragOffset({ x: 0, y: 0 });
    setDragRotation(0);
    setShowIndicators({ left: false, right: false });
    setActiveIndex((prev) => prev + 1);
  }, []);

  const handleLike = useCallback(() => {
    const currentProfile = cardStack[activeIndex];
    if (!currentProfile || swipeMutation.isPending) return;

    swipeMutation.mutate({ targetId: currentProfile.id, swipeType: 'like' });
    // Trigger swipe animation
    setDragOffset({ x: 500, y: 0 });
    setDragRotation(30);
    setTimeout(nextCard, 300);
  }, [activeIndex, cardStack, swipeMutation, nextCard]);

  const handlePass = useCallback(() => {
    const currentProfile = cardStack[activeIndex];
    if (!currentProfile || swipeMutation.isPending) return;

    swipeMutation.mutate({ targetId: currentProfile.id, swipeType: 'pass' });
    setDragOffset({ x: -500, y: 0 });
    setDragRotation(-30);
    setTimeout(nextCard, 300);
  }, [activeIndex, cardStack, swipeMutation, nextCard]);

  const handleSuperLike = useCallback(() => {
    const currentProfile = cardStack[activeIndex];
    if (!currentProfile || superLikeMutation.isPending) return;

    superLikeMutation.mutate(currentProfile.id);
    setDragOffset({ x: 0, y: -500 });
    setDragRotation(0);
    setTimeout(nextCard, 300);
  }, [activeIndex, cardStack, superLikeMutation, nextCard]);

  const currentProfile = cardStack[activeIndex];
  const nextProfile = cardStack[activeIndex + 1];
  const thirdProfile = cardStack[activeIndex + 2];

  const isLastCard = activeIndex >= cardStack.length - 1;
  const isSwiping = swipeMutation.isPending || superLikeMutation.isPending;

  if (isLoading && cardStack.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground">Chargement des profils...</p>
      </div>
    );
  }

  if (cardStack.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-6 text-center px-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          <Heart className="h-10 w-10 text-muted-foreground/50" />
        </div>
        <h3 className="text-xl font-semibold">Aucun profil à découvrir</h3>
        <p className="text-muted-foreground max-w-xs">
          Vous avez vu tous les profils disponibles pour le moment.
          Revenez plus tard ou élargissez vos filtres.
        </p>
        <Button variant="outline" onClick={() => refetch()}>
          Actualiser
        </Button>
      </div>
    );
  }

  return (
    <div className="relative" role="region" aria-label="Cartes de découverte">
      {/* Background cards */}
      {thirdProfile && (
        <ProfileCard
          key={`bg-${thirdProfile.id}`}
          profile={thirdProfile}
          onLike={() => {}}
          onPass={() => {}}
          onSuperLike={() => {}}
          onViewProfile={() => {}}
          className="absolute inset-0 -z-20 scale-[0.94] opacity-40 pointer-events-none"
        />
      )}

      {nextProfile && (
        <ProfileCard
          key={`next-${nextProfile.id}`}
          profile={nextProfile}
          onLike={() => {}}
          onPass={() => {}}
          onSuperLike={() => {}}
          onViewProfile={() => {}}
          className="absolute inset-0 -z-10 scale-[0.97] opacity-60 pointer-events-none"
        />
      )}

      {/* Current card */}
      {currentProfile && (
        <div
          ref={(el) => { cardRefs.current[0] = el; }}
          className="relative z-10"
          style={{
            transform: `translateX(${dragOffset.x}px) translateY(${dragOffset.y}px) rotate(${dragRotation}deg)`,
            transition: isSwiping ? 'none' : 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            opacity: isSwiping && Math.abs(dragOffset.x) > SWIPE_THRESHOLD ? 0 : 1,
          }}
          onMouseDown={handleDragStart}
          onTouchStart={handleDragStart}
        >
          <ProfileCard
            profile={currentProfile}
            onLike={handleLike}
            onPass={handlePass}
            onSuperLike={handleSuperLike}
            onViewProfile={() => {}}
            isLoading={isSwiping}
          />
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center justify-center gap-4 mt-6 md:mt-8">
        <Button
          variant="swipe"
          className="btn-pass"
          onClick={handlePass}
          disabled={isSwiping || isLastCard}
          aria-label="Passer"
        >
          <X className="h-7 w-7" aria-hidden="true" />
        </Button>

        <Button
          variant="swipe"
          className="bg-gradient-to-br from-accent to-accent-light text-accent-foreground shadow-xl"
          onClick={handleSuperLike}
          disabled={isSwiping || isLastCard}
          aria-label="Super Like"
        >
          <Star className="h-7 w-7 fill-current" aria-hidden="true" />
        </Button>

        <Button
          variant="swipe"
          className="btn-like"
          onClick={handleLike}
          disabled={isSwiping || isLastCard}
          aria-label="Liker"
        >
          <Heart className="h-7 w-7 fill-current" aria-hidden="true" />
        </Button>
      </div>

      {/* Keyboard shortcuts hint */}
      <div className="flex items-center justify-center gap-6 mt-4 text-xs text-muted-foreground hidden md:flex">
        <kbd className="flex items-center gap-1 px-2 py-1 rounded bg-muted border">
          <X className="h-3 w-3" /> ← Passer
        </kbd>
        <kbd className="flex items-center gap-1 px-2 py-1 rounded bg-muted border">
          <Star className="h-3 w-3" /> ↑ Super Like
        </kbd>
        <kbd className="flex items-center gap-1 px-2 py-1 rounded bg-muted border">
          <Heart className="h-3 w-3" /> → Liker
        </kbd>
      </div>
    </div>
  );
}