'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils/cn';
import { X, Filter, SlidersHorizontal } from 'lucide-react';
import { DiscoveryFilters } from '@/lib/hooks/use-discovery';

interface FilterPanelProps {
  filters: DiscoveryFilters;
  onFiltersChange: (filters: DiscoveryFilters) => void;
  onClose?: () => void;
}

const GENDER_OPTIONS = [
  { value: 'male', label: 'Homme' },
  { value: 'female', label: 'Femme' },
  { value: 'non_binary', label: 'Non-binaire' },
  { value: 'prefer_not_to_say', label: 'Préfère ne pas dire' },
] as const;

export function FilterPanel({ filters, onFiltersChange, onClose }: FilterPanelProps) {
  const { profile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const handleChange = (key: keyof DiscoveryFilters, value: unknown) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const resetFilters = () => {
    onFiltersChange({
      minAge: 18,
      maxAge: 30,
      genders: ['male', 'female', 'non_binary'],
      maxDistanceKm: 50,
    });
  };

  const hasActiveFilters =
    filters.minAge !== 18 ||
    filters.maxAge !== 30 ||
    (filters.genders?.length ?? 3) !== 3 ||
    filters.maxDistanceKm !== 50;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <SlidersHorizontal className="h-5 w-5" />
          Filtres
        </h3>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={resetFilters} className="gap-1">
            <X className="h-3 w-3" />
            Réinitialiser
          </Button>
        )}
      </div>

      {/* Age Range */}
      <div className="space-y-3">
        <Label className="flex items-center justify-between">
          <span>Âge</span>
          <span className="text-sm text-muted-foreground">
            {filters.minAge} - {filters.maxAge} ans
          </span>
        </Label>
        <Slider
          defaultValue={[filters.minAge ?? 18, filters.maxAge ?? 30]}
          max={60}
          min={18}
          step={1}
          onValueChange={(value) => handleChange('minAge', value[0])}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>18 ans</span>
          <span>60+ ans</span>
        </div>
      </div>

      <Separator />

      {/* Distance */}
      <div className="space-y-3">
        <Label className="flex items-center justify-between">
          <span>Distance maximale</span>
          <span className="text-sm text-muted-foreground">
            {filters.maxDistanceKm} km
          </span>
        </Label>
        <Slider
          defaultValue={[filters.maxDistanceKm ?? 50]}
          max={200}
          min={5}
          step={5}
          onValueChange={(value) => handleChange('maxDistanceKm', value[0])}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>5 km</span>
          <span>200+ km</span>
        </div>
      </div>

      <Separator />

      {/* Gender Preferences */}
      <div className="space-y-3">
        <Label>Genres recherchés</Label>
        <div className="grid grid-cols-2 gap-3">
          {GENDER_OPTIONS.map((gender) => (
            <label
              key={gender.value}
              className={cn(
                'flex items-center gap-2 rounded-lg border p-3 text-sm transition-colors cursor-pointer',
                filters.genders?.includes(gender.value)
                  ? 'border-primary/50 bg-primary/5 text-primary'
                  : 'border-border hover:bg-accent'
              )}
            >
              <Checkbox
                checked={filters.genders?.includes(gender.value) ?? false}
                onCheckedChange={(checked) => {
                  const newGenders = checked
                    ? [...(filters.genders ?? []), gender.value]
                    : (filters.genders ?? []).filter((g) => g !== gender.value);
                  handleChange('genders', newGenders);
                }}
              />
              <span>{gender.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Mobile: Show as sheet */}
      {typeof window !== 'undefined' && window.innerWidth < 768 && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsOpen(false)} />
          <div className="fixed bottom-0 left-0 right-0 bg-background rounded-t-2xl shadow-xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-background z-10">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <SlidersHorizontal className="h-5 w-5" />
                Filtres
              </h3>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="p-4 space-y-6 pb-20">
              {/* Same filter content but in sheet */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Mobile filter button
export function FilterButton({ onClick, hasActiveFilters }: { onClick: () => void; hasActiveFilters: boolean }) {
  return (
    <Button variant="outline" size="sm" onClick={onClick} className="gap-2">
      <Filter className="h-4 w-4" />
      Filtres
      {hasActiveFilters && (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-medium text-primary-foreground">
          *
        </span>
      )}
    </Button>
  );
}