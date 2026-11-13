'use client';

import { useAuth } from '@/lib/hooks/use-auth';
import { AdminSidebar } from '@/components/layout/admin-sidebar';
import { cn } from '@/lib/utils/cn';
import { ReactNode } from 'react';
import { redirect } from 'next/navigation';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    );
  }

  // Check admin permissions (will be verified server-side too)
  const isAdmin = profile?.verification_status === 'verified' && user?.user_metadata?.['is_admin'];

  if (!user || !isAdmin) {
    // In a real app, this would redirect server-side
    return null;
  }

  return (
    <div className="min-h-screen flex bg-muted/30">
      <AdminSidebar />
      <main className="flex-1 lg:ml-64 p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}