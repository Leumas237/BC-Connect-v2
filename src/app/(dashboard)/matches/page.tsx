'use client';

import { MatchList } from '@/components/matches/match-list';

export default function MatchesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Mes matchs</h1>
        <p className="text-muted-foreground text-sm">
          Vos connexions mutuelles. Commencez une conversation !
        </p>
      </div>
      <MatchList />
    </div>
  );
}