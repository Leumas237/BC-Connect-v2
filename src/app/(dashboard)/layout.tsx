'use client';

import { useAuth } from '@/lib/hooks/use-auth';
import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';
import { MobileNav } from '@/components/layout/mobile-nav';
import { cn } from '@/lib/utils/cn';
import { ReactNode } from 'react';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) {
    return null; // Middleware will redirect
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex">
        <Sidebar />
        <main
          className={cn(
            'flex-1 lg:ml-64 pb-20 lg:pb-0',
            'transition-all duration-300'
          )}
        >
          <div className="w-full max-w-4xl mx-auto px-4 py-6">
            {children}
          </div>
        </main>
      </div>
      <MobileNav />
    </div>
  );
}