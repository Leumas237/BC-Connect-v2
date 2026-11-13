'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Shield, Megaphone, Building2, BarChart3, TrendingUp, Clock, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const stats = [
  {
    title: 'Total utilisateurs',
    value: '1 247',
    change: '+12%',
    icon: Users,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
  },
  {
    title: 'Vérifications en attente',
    value: '23',
    change: '5 aujourd\'hui',
    icon: Shield,
    color: 'text-yellow-500',
    bg: 'bg-yellow-500/10',
  },
  {
    title: 'Matchs actifs',
    value: '567',
    change: '+8%',
    icon: CheckCircle2,
    color: 'text-green-500',
    bg: 'bg-green-500/10',
  },
  {
    title: 'Campagnes publicitaires',
    value: '12',
    change: '3 actives',
    icon: Megaphone,
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
  },
];

const recentActivity = [
  { type: 'user_registered', title: 'Nouvel utilisateur inscrit', detail: 'Marie K. - Informatique L3', time: 'Il y a 5 min', icon: Users, color: 'text-blue-500' },
  { type: 'verification_submitted', title: 'Document de vérification soumis', detail: 'Jean M. - Carte étudiante', time: 'Il y a 12 min', icon: Shield, color: 'text-yellow-500' },
  { type: 'verification_approved', title: 'Vérification approuvée', detail: 'Sophie L. - Certificat scolarité', time: 'Il y a 1h', icon: CheckCircle2, color: 'text-green-500' },
  { type: 'match_created', title: 'Nouveau match', detail: 'Pierre D. ↔ Amina B.', time: 'Il y a 2h', icon: CheckCircle2, color: 'text-green-500' },
  { type: 'report_created', title: 'Signalement reçu', detail: 'Profil suspect - Contenu inapproprié', time: 'Il y a 3h', icon: XCircle, color: 'text-red-500' },
  { type: 'campaign_created', title: 'Nouvelle campagne publicitaire', detail: 'Restaurant Le Gourmet - Bandjoun', time: 'Il y a 4h', icon: Megaphone, color: 'text-purple-500' },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Tableau de bord admin</h1>
          <p className="text-muted-foreground">Vue d'ensemble de la plateforme BC Connect</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <TrendingUp className="h-4 w-4 mr-2" />
            Exporter rapport
          </Button>
          <Button size="sm">
            Actualiser
            <Loader2 className="h-4 w-4 ml-2 animate-spin" />
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', stat.bg)}>
                <stat.icon className={cn('h-5 w-5', stat.color)} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quick Actions */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Actions rapides</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Shield className="h-4 w-4" />
                Vérifications en attente (23)
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2">
                <Users className="h-4 w-4" />
                Gérer les utilisateurs
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2">
                <Megaphone className="h-4 w-4" />
                Créer une campagne pub
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2">
                <Building2 className="h-4 w-4" />
                Gérer les établissements
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2">
                <BarChart3 className="h-4 w-4" />
                Voir les analytics
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2">
                <Settings className="h-4 w-4" />
                Paramètres système
              </Button>
            </CardContent>
          </Card>

          {/* System Health */}
          <Card>
            <CardHeader>
              <CardTitle>Santé du système</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">API Supabase</span>
                <Badge variant="success" className="gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Opérationnel
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Realtime</span>
                <Badge variant="success" className="gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Connecté
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Stockage</span>
                <span className="text-sm">2.3 GB / 10 GB</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Base de données</span>
                <span className="text-sm">1 247 utilisateurs</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Activité récente</CardTitle>
              <Button variant="ghost" size="sm">Voir tout</Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div
                    key={index}
                    className={cn(
                      'flex items-start gap-4 p-3 rounded-lg transition-colors hover:bg-muted/50',
                      index === recentActivity.length - 1 ? 'border-b-0' : 'border-b'
                    )}
                  >
                    <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', activity.color + '/10')}>
                      <activity.icon className={cn('h-5 w-5', activity.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{activity.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{activity.detail}</p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{activity.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Need to import Settings icon
import { Settings } from 'lucide-react';