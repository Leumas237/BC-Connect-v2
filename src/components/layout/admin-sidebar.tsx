'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import { LayoutDashboard, Users, Shield, Megaphone, Building2, BarChart3, Settings, LogOut, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/lib/hooks/use-auth';
import { useState } from 'react';

const navigation = [
  { name: 'Tableau de bord', href: '/admin', icon: LayoutDashboard },
  { name: 'Utilisateurs', href: '/admin/users', icon: Users },
  { name: 'Vérifications', href: '/admin/verification', icon: Shield },
  { name: 'Publicité', href: '/admin/advertising', icon: Megaphone },
  { name: 'Établissements', href: '/admin/institutions', icon: Building2 },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { user, profile, signOut } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  if (!user) return null;

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 bottom-0 z-40 border-r bg-card transition-all duration-300 lg:translate-x-0',
        collapsed ? 'w-20' : 'w-64'
      )}
      aria-label="Navigation d'administration"
    >
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b">
          {!collapsed && (
            <Link href="/admin" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-primary">
                <LayoutDashboard className="h-5 w-5 text-white" />
              </div>
              <span className="font-display text-xl font-bold text-foreground">BC Connect Admin</span>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? 'Déplier le menu' : 'Replier le menu'}
            className="h-8 w-8"
          >
            <ChevronLeft
              className={cn(
                'h-4 w-4 transition-transform',
                collapsed ? 'rotate-180' : 'rotate-0'
              )}
              aria-hidden="true"
            />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1" aria-label="Administration">
          {!collapsed && (
            <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Administration
            </div>
          )}
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
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
                {!collapsed && <span className="truncate">{item.name}</span>}
              </Link>
            );
          })}

          {!collapsed && (
            <div className="pt-4 mt-4 border-t px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Système
            </div>
          )}

          <Link
            href="/admin/settings"
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              pathname === '/admin/settings'
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              collapsed && 'justify-center px-2'
            )}
          >
            <Settings className="h-5 w-5 flex-shrink-0" />
            {!collapsed && <span>Paramètres</span>}
          </Link>
        </nav>

        {/* User Profile */}
        <div className="border-t p-3">
          {!collapsed ? (
            <>
              <div className="flex items-center gap-3 mb-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={profile?.profile_photos?.[0]?.url} alt={profile?.first_name} />
                  <AvatarFallback className="text-sm font-medium">
                    {profile?.first_name?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="truncate font-medium">{profile?.first_name} {profile?.last_name}</p>
                  <p className="truncate text-xs text-muted-foreground">Administrateur</p>
                </div>
              </div>

              <Button
                variant="ghost"
                className="w-full justify-start gap-3 rounded-lg px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10"
                onClick={signOut}
              >
                <LogOut className="h-4 w-4 flex-shrink-0" />
                <span>Déconnexion</span>
              </Button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Avatar className="h-10 w-10">
                <AvatarImage src={profile?.profile_photos?.[0]?.url} alt={profile?.first_name} />
                <AvatarFallback className="text-sm font-medium">
                  {profile?.first_name?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Button
                variant="ghost"
                size="icon"
                onClick={signOut}
                className="text-destructive hover:text-destructive"
                aria-label="Déconnexion"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}