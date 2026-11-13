'use client';

import { useState } from 'react';
import { SwipeStack } from '@/components/discovery/swipe-stack';
import { FilterPanel, FilterButton } from '@/components/discovery/filter-panel';
import { ActionButtons } from '@/components/discovery/action-buttons';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Loader2, Filter, X } from 'lucide-react';
import { useAuth } from '@/lib/hooks/use-auth';
import { useDiscovery } from '@/lib/hooks/use-discovery';
import { DiscoveryFilters } from '@/lib/hooks/use-discovery';
import { cn } from '@/lib/utils/cn';

export default function DiscoverPage() {
  const { profile } = useAuth();
  const { data: profiles = [], isLoading, refetch } = useDiscovery();
  const [filters, setFilters] = useState<DiscoveryFilters>({
    minAge: 18,
    maxAge: 30,
    genders: ['male', 'female', 'non_binary'],
    maxDistanceKm: 50,
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const hasActiveFilters =
    filters.minAge !== 18 ||
    filters.maxAge !== 30 ||
    (filters.genders?.length ?? 3) !== 3 ||
    filters.maxDistanceKm !== 50;

  // Check mobile on mount
  // useEffect(() => {
  //   setIsMobile(window.innerWidth < 768);
  //   window.addEventListener('resize', () => setIsMobile(window.innerWidth < 768));
  //   return () => window.removeEventListener('resize', () => setIsMobile(window.innerWidth < 768));
  // }, []);

  if (!profile) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Découvrir</h1>
          <p className="text-muted-foreground text-sm">
            {profiles.length} profils disponibles
            {hasActiveFilters && ' (filtrés)'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <SheetTrigger asChild>
              <FilterButton
                onClick={() => setIsFilterOpen(true)}
                hasActiveFilters={hasActiveFilters}
              />
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-md">
              <SheetHeader>
                <SheetTitle>Filtres de découverte</SheetTitle>
              </SheetHeader>
              <FilterPanel
                filters={filters}
                onFiltersChange={setFilters}
                onClose={() => setIsFilterOpen(false)}
              />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Filter summary (mobile) */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Filtres actifs</span>
          <Button variant="ghost" size="sm" onClick={() => setFilters({
            minAge: 18,
            maxAge: 30,
            genders: ['male', 'female', 'non_binary'],
            maxDistanceKm: 50,
          })}>
            <X className="h-3 w-3 mr-1" />
            Réinitialiser
          </Button>
        </div>
      )}

      {/* Swipe Stack */}
      <div className={cn('min-h-[500px]', isLoading && 'opacity-50')}>
        <SwipeStack />
      </div>

      {/* Action buttons (shown on mobile or as backup) */}
      <div className="md:hidden">
        <ActionButtons
          onLike={() => {}}
          onPass={() => {}}
          onSuperLike={() => {}}
          disabled={isLoading}
          isLoading={isLoading}
        />
      </div>

      {/* Empty state is handled by SwipeStack component */}
    </div>
  );
}