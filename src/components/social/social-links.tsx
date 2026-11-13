'use client';

import { cn } from '@/lib/utils/cn';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { CheckCircle2, X, Share2, Link as LinkIcon, ExternalLink } from 'lucide-react';
import { SocialAccount, SocialShare } from '@/lib/hooks/use-social';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { PLATFORM_CONFIG } from '@/components/social/social-icons';

interface SocialLinksProps {
  accounts: SocialAccount[];
  shares?: SocialShare[];
  matchId?: string;
  isOwnProfile?: boolean;
  onToggleShare?: (accountId: string, isShared: boolean) => void;
}

export function SocialLinks({ accounts, shares, matchId, isOwnProfile, onToggleShare }: SocialLinksProps) {
  const shareMap = new Map(shares?.map(s => [s.social_account_id, s.is_shared]) ?? []);

  const displayedAccounts = isOwnProfile
    ? accounts
    : accounts.filter(acc => shareMap.get(acc.id));

  if (displayedAccounts.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {isOwnProfile ? (
          <p>Aucun réseau social ajouté. <Button variant="ghost" size="sm" asChild><a href="/settings/social">Ajouter</a></Button></p>
        ) : (
          <p>Cette personne n'a pas partagé ses réseaux sociaux.</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {displayedAccounts.map((account) => {
        const config = PLATFORM_CONFIG[account.platform];
        const isShared = shareMap.get(account.id) ?? false;
        const Icon = config?.icon || PLATFORM_CONFIG.other.icon;

        return (
          <div
            key={account.id}
            className={cn(
              'flex items-center gap-3 p-3 rounded-xl bg-card border transition-colors',
              isOwnProfile ? 'hover:bg-accent/50' : ''
            )}
          >
            <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', config?.color)}>
              <Icon className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{config?.label || account.platform}</p>
              <p className="text-sm text-muted-foreground truncate">
                {account.display_name || account.username || account.url}
              </p>
            </div>
            {isOwnProfile && matchId && (
              <Button
                variant={isShared ? 'default' : 'outline'}
                size="sm"
                onClick={() => onToggleShare?.(account.id, !isShared)}
                className="gap-1.5"
              >
                {isShared ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Partagé
                  </>
                ) : (
                  <>
                    <Share2 className="h-4 w-4" />
                    Partager
                  </>
                )}
              </Button>
            )}
            {!isOwnProfile && account.url && (
              <a
                href={account.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label={`Ouvrir ${config?.label}`}
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>
        );
      })}
    </div>
  );
}