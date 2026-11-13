import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Heart, Users, MessageSquare, Shield, Sparkles, ArrowRight, CheckCircle2, Star, Globe, GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const features = [
  {
    icon: Heart,
    title: 'Découverte intuitive',
    description: 'Swipez pour découvrir des profils qui vous correspondent vraiment. Like, Pass, Super Like : à vous de choisir.',
  },
  {
    icon: Users,
    title: 'Trois intentions, une app',
    description: 'Dating, Amitié ou Networking : indiquez ce que vous cherchez et trouvez des personnes sur la même longueur d\'onde.',
  },
  {
    icon: MessageSquare,
    title: 'Messagerie en temps réel',
    description: 'Discutez instantanément avec vos matchs. Partagez vos réseaux sociaux quand vous le souhaitez.',
  },
  {
    icon: Shield,
    title: 'Étudiants vérifiés',
    description: 'Chaque profil est vérifié manuellement par notre équipe. Badge "Étudiant vérifié" pour une confiance totale.',
  },
  {
    icon: Sparkles,
    title: 'Centres d\'intérêt communs',
    description: 'Plus de 80 centres d\'intérêt disponibles. Voyez immédiatement ce que vous avez en commun.',
  },
  {
    icon: Globe,
    title: 'IUT Fotso Victor',
    description: 'Conçu pour les étudiants de Bandjoun. Votre communauté, vos règles, votre espace.',
  },
];

const stats = [
  { value: '500+', label: 'Étudiants inscrits' },
  { value: '50+', label: 'Matchs par jour' },
  { value: '95%', label: 'Taux de vérification' },
  { value: '24/7', label: 'Support disponible' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 lg:py-32">
          <div className="container-main">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary mb-6">
                <Sparkles className="h-4 w-4" />
                Nouveau : Partage de réseaux sociaux après match
              </div>
              <h1 className="font-display text-4xl lg:text-6xl font-bold tracking-tight text-foreground mb-6">
                Connect{' '}
                <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  beyond classrooms
                </span>
              </h1>
              <p className="text-lg lg:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                La plateforme de rencontres et de networking pour les étudiants de l\'IUT Fotso Victor.
                Trouvez des amis, l\'amour ou développez votre réseau professionnel.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
                <Link href="/register">
                  <Button size="xl" className="gap-2">
                    <Heart className="h-5 w-5" />
                    S'inscrire gratuitement
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="xl" variant="outline" className="gap-2">
                    Se connecter
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
              </div>
              <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  100% gratuit pour les étudiants
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  Vérification manuelle
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  Confidentialité respectée
                </span>
              </div>
            </div>

            {/* Floating cards preview */}
            <div className="mt-16 relative h-[400px] lg:h-[500px]">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="relative aspect-card w-72 lg:w-96">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 rounded-2xl" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <p className="text-2xl font-bold">Marie, 21 ans</p>
                    <p className="text-sm opacity-90">Informatique • L3</p>
                  </div>
                  <div className="absolute bottom-4 left-4 flex gap-2">
                    <span className="badge-dating text-xs">Dating</span>
                    <span className="badge-friendship text-xs">Amitié</span>
                  </div>
                </div>
              </div>
              <div className="absolute top-20 right-10 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />
              <div className="absolute bottom-20 left-10 w-64 h-64 bg-secondary/10 rounded-full blur-3xl" />
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-16 bg-muted/50 border-y">
          <div className="container-main">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="font-display text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-muted-foreground mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 lg:py-28">
          <div className="container-main">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="font-display text-3xl lg:text-4xl font-bold mb-4">
                Tout ce qu\'il vous faut pour connecter
              </h2>
              <p className="text-muted-foreground text-lg">
                Des fonctionnalités pensées pour les étudiants, par des étudiants.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature) => (
                <article
                  key={feature.title}
                  className="card-profile p-6 hover:shadow-xl transition-shadow"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-20 lg:py-28 bg-muted/50 border-y">
          <div className="container-main">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="font-display text-3xl lg:text-4xl font-bold mb-4">
                Comment ça marche ?
              </h2>
              <p className="text-muted-foreground text-lg">
                Simple, rapide et sécurisé. En 4 étapes, vous êtes prêt à connecter.
              </p>
            </div>
            <div className="grid md:grid-cols-4 gap-8">
              {[
                { step: '01', title: 'Inscription', desc: 'Créez votre compte avec votre email étudiant', icon: GraduationCap },
                { step: '02', title: 'Vérification', desc: 'Envoyez votre carte étudiante pour le badge vérifié', icon: Shield },
                { step: '03', title: 'Profil', desc: 'Ajoutez photos, bio, centres d\'intérêt et intentions', icon: Star },
                { step: '04', title: 'Connectez', desc: 'Swipez, matchez, discutez et partagez vos réseaux', icon: Heart },
              ].map((item) => (
                <div key={item.step} className="text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 mx-auto mb-4">
                    <item.icon className="h-8 w-8 text-primary" />
                  </div>
                  <div className="text-sm font-medium text-primary mb-2">{item.step}</div>
                  <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 lg:py-28">
          <div className="container-main">
            <div className="max-w-2xl mx-auto text-center rounded-3xl bg-gradient-to-br from-primary via-secondary to-accent p-12 lg:p-16">
              <h2 className="font-display text-3xl lg:text-4xl font-bold text-white mb-4">
                Prêt à connecter au-delà des salles de classe ?
              </h2>
              <p className="text-white/80 text-lg mb-8 max-w-lg mx-auto">
                Rejoignez des centaines d\'étudiants de l\'IUT Fotso Victor qui ont déjà trouvé des amis, des partenaires et des opportunités.
              </p>
              <Link href="/register">
                <Button size="xl" variant="secondary" className="gap-2 text-lg">
                  <Heart className="h-6 w-6" />
                  Rejoindre BC Connect
                  <ArrowRight className="h-6 w-6" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}