'use client';

import { useAuth } from '@/lib/hooks/use-auth';
import { useMatches, useUnmatch } from '@/lib/hooks/use-matches';
import { MatchCard } from './match-card';
import { Button } from '@/components/ui/button';
import { Loader2, MessageSquare, Heart, X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export function MatchList() {
  const { data: matches = [], isLoading, refetch } = useMatches();
  const unmatchMutation = useUnmatch();
  const { user } = useAuth();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground">Chargement de vos matchs...</p>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-6 text-center px-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          <Heart className="h-10 w-10 text-muted-foreground/50" />
        </div>
        <h3 className="text-xl font-semibold">Aucun match pour le moment</h3>
        <p className="text-muted-foreground max-w-xs">
          Commencez àswiper pour trouver des personnes qui vous correspondent.
          Quand l'intérêt est mutuel, vous pourrez discuter ici !
        </p>
        <Button variant="outline" asChild>
          <a href="/discover">Aller découvrir</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4" role="list" aria-label="Vos matchs">
      {matches.map((match) => (
        <MatchCard
          key={match.id}
          match={match}
          onUnmatch={async () => {
            if (confirm('Êtes-vous sûr de vouloir supprimer ce match ? Cette action est irréversible.')) {
              await unmatchMutation.mutateAsync(match.id);
              refetch();
            }
          }}
          onMessage={() => {
            // Navigation handled by MatchCard
          }}
        />
      ))}
    </div>
  );
}