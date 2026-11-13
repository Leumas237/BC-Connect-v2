'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/use-auth';
import { cn } from '@/lib/utils/cn';
import { Heart, MessageSquare, Users, User, Settings, Shield, Bell, LogOut, ChevronRight } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

const navigation = [
  { name: 'Découvrir', href: '/discover', icon: Heart, badge: null },
  { name: 'Likes reçus', href: '/likes', icon: Heart, badge: 3 },
  { name: 'Matchs', href: '/matches', icon: Users, badge: null },
  { name: 'Messages', href: '/messages', icon: MessageSquare, badge: 2 },
];

const settingsNavigation = [
  { name: 'Mon profil', href: '/profile', icon: User },
  { name: 'Paramètres', href: '/settings', icon: Settings },
  { name: 'Confidentialité', href: '/settings/privacy', icon: Shield },
  { name: 'Réseaux sociaux', href: '/settings/social', icon: Bell },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, profile, signOut } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  if (!user) return null;

  return (
    <aside
      className={cn(
        'fixed left-0 top-16 bottom-0 z-40 border-r bg-card transition-all duration-300 lg:translate-x-0',
        collapsed ? 'w-20' : 'w-64'
      )}
      aria-label="Navigation latérale"
    >
      <div className="flex h-full flex-col">
        {/* Logo & Collapse button */}
        <div className="flex h-14 items-center justify-between px-4 border-b">
          {!collapsed && (
            <Link href="/discover" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-primary">
                <Heart className="h-5 w-5 text-white" />
              </div>
              <span className="font-display text-xl font-bold text-foreground">BC Connect</span>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? 'Déplier le menu' : 'Replier le menu'}
            className="h-8 w-8"
          >
            <ChevronRight
              className={cn(
                'h-4 w-4 transition-transform',
                collapsed ? 'rotate-180' : 'rotate-0'
              )}
              aria-hidden="true"
            />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1" aria-label="Navigation principale">
          {!collapsed && (
            <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Principal
            </div>
          )}
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/discover' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                  collapsed && 'justify-center px-2'
                )}
                aria-current={isActive ? 'page' : undefined}
                title={collapsed ? item.name : undefined}
              >
                <Icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                {!collapsed && (
                  <>
                    <span className="truncate">{item.name}</span>
                    {item.badge && (
                      <Badge variant="default" className="ml-auto h-5 px-1.5 text-[10px]">
                        {item.badge}
                      </Badge>
                    )}
                  </>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Profile & Settings */}
        <div className="border-t p-3">
          {!collapsed ? (
            <>
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={profile?.profile_photos?.[0]?.url} alt={profile?.first_name} />
                  <AvatarFallback className="text-sm font-medium">
                    {profile?.first_name?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="truncate font-medium">{profile?.first_name} {profile?.last_name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {profile?.academic_programs?.name}
                  </p>
                </div>
                {profile?.verification_status === 'verified' && (
                  <Badge variant="verified" className="text-xs">
                    Vérifié
                  </Badge>
                )}
              </div>

              <div className="mt-4 space-y-1">
                {settingsNavigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                      )}
                    >
                      <Icon className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}

                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 rounded-lg px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10"
                  onClick={signOut}
                >
                  <LogOut className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                  <span>Déconnexion</span>
                </Button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Avatar className="h-10 w-10">
                <AvatarImage src={profile?.profile_photos?.[0]?.url} alt={profile?.first_name} />
                <AvatarFallback className="text-sm font-medium">
                  {profile?.first_name?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {profile?.verification_status === 'verified' && (
                <Badge variant="verified" className="text-[10px]">
                  Vérifié
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}