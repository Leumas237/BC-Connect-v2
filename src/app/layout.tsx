import type { Metadata, Viewport } from 'next';
import { Inter, Poppins } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Toaster } from 'sonner';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

// Dans la config des fonts
const poppins = Poppins({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  weight: ['400', '500', '600', '700'],  // ← AJOUTE ÇA
});
export const metadata: Metadata = {
  title: {
    default: 'BC Connect - Connect beyond classrooms',
    template: '%s | BC Connect',
  },
  description: 'La plateforme de rencontres et de networking pour les étudiants de l\'IUT Fotso Victor. Trouvez des amis, des partenaires ou développez votre réseau professionnel.',
  keywords: ['rencontres', 'étudiants', 'networking', 'IUT', 'Bandjoun', 'matching', 'social'],
  authors: [{ name: 'BC Connect Team' }],
  creator: 'BC Connect',
  publisher: 'BC Connect',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://bc-connect.app',
    siteName: 'BC Connect',
    title: 'BC Connect - Connect beyond classrooms',
    description: 'La plateforme de rencontres et de networking pour les étudiants.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'BC Connect',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BC Connect',
    description: 'La plateforme de rencontres et de networking pour les étudiants.',
    images: ['/og-image.png'],
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FAFAFA' },
    { media: '(prefers-color-scheme: dark)', color: '#1A1A2E' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${inter.variable} ${poppins.variable} antialiased`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#E91E63" />
      </head>
      <body className="min-h-screen bg-background font-sans">
        <Providers>{children}</Providers>
        <Toaster
          position="bottom-right"
          toastOptions={{
            classNames: {
              toast: 'bg-card text-foreground border',
              description: 'text-muted-foreground',
              actionButton: 'bg-primary text-primary-foreground',
              cancelButton: 'bg-muted text-foreground',
            },
          }}
        />
      </body>
    </html>
  );
}