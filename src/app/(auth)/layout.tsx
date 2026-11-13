import { ReactNode } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b px-4 py-4">
        <div className="container-main flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-primary">
              <Heart className="h-5 w-5 text-white" />
            </div>
            <span className="font-display text-xl font-bold text-foreground">BC Connect</span>
          </Link>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">{children}</div>
      </main>
      <footer className="border-t px-4 py-6 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} BC Connect. Tous droits réservés.</p>
        <div className="flex justify-center gap-4 mt-2">
          <Link href="/privacy" className="hover:text-foreground transition-colors">Confidentialité</Link>
          <Link href="/terms" className="hover:text-foreground transition-colors">Conditions</Link>
          <Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link>
        </div>
      </footer>
    </div>
  );
}