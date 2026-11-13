import Link from 'next/link';
import { Heart, MessageSquare, Users, Shield, BookOpen, Mail, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const footerLinks = {
  product: [
    { name: 'Découvrir', href: '/discover' },
    { name: 'Matchs', href: '/matches' },
    { name: 'Messages', href: '/messages' },
    { name: 'Likes', href: '/likes' },
  ],
  company: [
    { name: 'À propos', href: '/about' },
    { name: 'Blog', href: '/blog' },
    { name: 'Carrières', href: '/careers' },
    { name: 'Presse', href: '/press' },
  ],
  legal: [
    { name: 'Confidentialité', href: '/privacy' },
    { name: 'Conditions', href: '/terms' },
    { name: 'Cookies', href: '/cookies' },
    { name: 'Sécurité', href: '/safety' },
  ],
  support: [
    { name: 'Centre d\'aide', href: '/help' },
    { name: 'Contact', href: '/contact' },
    { name: 'Signaler', href: '/report' },
    { name: 'Guidelines', href: '/guidelines' },
  ],
};

const socialLinks = [
  { name: 'Instagram', href: 'https://instagram.com/bcconnect', icon: 'instagram' },
  { name: 'Twitter', href: 'https://twitter.com/bcconnect', icon: 'twitter' },
  { name: 'Facebook', href: 'https://facebook.com/bcconnect', icon: 'facebook' },
  { name: 'LinkedIn', href: 'https://linkedin.com/company/bcconnect', icon: 'linkedin' },
];

export function Footer() {
  return (
    <footer className="border-t bg-muted/30" role="contentinfo">
      <div className="container-main py-12 lg:py-16">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-6">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4" aria-label="BC Connect - Accueil">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <span className="font-display text-2xl font-bold text-foreground">BC Connect</span>
            </Link>
            <p className="text-muted-foreground text-sm max-w-xs mb-6">
              Connect beyond classrooms. La plateforme de rencontres et de networking
              pour les étudiants de l'IUT Fotso Victor.
            </p>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" aria-hidden="true" />
              <span>IUT Fotso Victor, Bandjoun, Cameroun</span>
            </div>
          </div>

          {/* Product */}
          <nav aria-label="Produit">
            <h3 className="font-semibold text-foreground mb-4">Produit</h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Company */}
          <nav aria-label="Entreprise">
            <h3 className="font-semibold text-foreground mb-4">Entreprise</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Legal */}
          <nav aria-label="Juridique">
            <h3 className="font-semibold text-foreground mb-4">Juridique</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Support */}
          <nav aria-label="Support">
            <h3 className="font-semibold text-foreground mb-4">Support</h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact & Social */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Contact & Réseaux</h3>
            <div className="space-y-3 mb-6">
              <a
                href="mailto:contact@bc-connect.app"
                className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <Mail className="h-4 w-4" aria-hidden="true" />
                contact@bc-connect.app
              </a>
            </div>
            <div className="flex gap-4" role="list" aria-label="Réseaux sociaux">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground transition-colors hover:text-primary"
                  aria-label={social.name}
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    {/* Generic social icon placeholder */}
                    <circle cx="12" cy="12" r="10" />
                  </svg>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground text-center md:text-left">
            © {new Date().getFullYear()} BC Connect. Tous droits réservés.
          </p>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="/privacy" className="transition-colors hover:text-foreground">Confidentialité</Link>
            <Link href="/terms" className="transition-colors hover:text-foreground">Conditions</Link>
            <Link href="/cookies" className="transition-colors hover:text-foreground">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}