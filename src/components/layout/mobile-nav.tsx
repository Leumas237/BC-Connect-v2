'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/use-auth';
import { cn } from '@/lib/utils/cn';
import { Heart, MessageSquare, Users, User, Bell, Settings } from 'lucide-react';

const navigation = [
  { name: 'Découvrir', href: '/discover', icon: Heart, label: 'Découvrir' },
  { name: 'Likes', href: '/likes', icon: Heart, label: 'Likes reçus', badge: 3 },
  { name: 'Matchs', href: '/matches', icon: Users, label: 'Mes matchs' },
  { name: 'Messages', href: '/messages', icon: MessageSquare, label: 'Messages', badge: 2 },
  { name: 'Profil', href: '/profile', icon: User, label: 'Profil' },
];

export function MobileNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  if (!user) return null;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden safe-bottom"
      aria-label="Navigation mobile"
    >
      <div className="grid grid-cols-5">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/discover' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'relative flex flex-col items-center gap-1 px-2 py-2.5 text-xs font-medium transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
              aria-current={isActive ? 'page' : undefined}
              aria-label={item.label}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              <span className="line-clamp-1">{item.name}</span>
              {item.badge && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                  {item.badge > 9 ? '9+' : item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}