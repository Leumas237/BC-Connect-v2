'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/use-auth';
import { useProfile, useUpdateProfile } from '@/lib/hooks/use-profile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Bell, Shield, User, Palette, Moon, Sun, Monitor, Mail, Lock, Trash2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const THEME_OPTIONS = [
  { value: 'light', label: 'Clair', icon: Sun },
  { value: 'dark', label: 'Sombre', icon: Moon },
  { value: 'system', label: 'Système', icon: Monitor },
] as const;

const LANGUAGE_OPTIONS = [
  { value: 'fr', label: 'Français' },
  { value: 'en', label: 'English' },
] as const;

export default function SettingsPage() {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const { data: profileData, refetch } = useProfile();
  const updateProfileMutation = useUpdateProfile();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<string>('account');
  const [isLoading, setIsLoading] = useState(false);

  const [accountData, setAccountData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    bio: '',
    city: '',
  });

  const [notificationSettings, setNotificationSettings] = useState({
    push_enabled: true,
    email_enabled: true,
    match_notifications: true,
    message_notifications: true,
    like_notifications: true,
    super_like_notifications: true,
    verification_notifications: true,
    marketing_emails: false,
  });

  const [privacySettings, setPrivacySettings] = useState({
    profile_visibility: 'verified_only' as 'everyone' | 'verified_only' | 'matches_only',
    show_age: true,
    show_location: true,
    show_online_status: true,
    show_distance: true,
    allow_super_likes: true,
  });

  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: 'system' as 'light' | 'dark' | 'system',
    language: 'fr',
    reduced_motion: false,
    high_contrast: false,
  });

  // Initialize data when profile loads
  useEffect(() => {
    if (profile) {
      setAccountData({
        first_name: profile.first_name,
        last_name: profile.last_name,
        email: user?.email || '',
        bio: profile.bio || '',
        city: profile.city || '',
      });
    }
  }, [profile, user]);

  const handleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await updateProfileMutation.mutateAsync({
        first_name: accountData.first_name,
        last_name: accountData.last_name,
        bio: accountData.bio,
        city: accountData.city,
      });
      toast.success('Profil mis à jour');
      refetch();
      refreshProfile();
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = () => {
    signOut();
    router.push('/login');
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible. Toutes vos données, matchs, messages et photos seront définitivement supprimées.'
    );

    if (confirmed) {
      const doubleConfirmed = window.confirm(
        'Confirmez-vous la suppression définitive de votre compte ?'
      );

      if (doubleConfirmed) {
        setIsLoading(true);
        try {
          // Call delete account API
          const response = await fetch('/api/auth/delete-account', { method: 'DELETE' });
          if (response.ok) {
            toast.success('Compte supprimé');
            signOut();
            router.push('/');
          } else {
            throw new Error('Erreur lors de la suppression');
          }
        } catch (error) {
          toast.error('Erreur lors de la suppression');
        } finally {
          setIsLoading(false);
        }
      }
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="font-display text-2xl font-bold">Paramètres</h1>
        <p className="text-muted-foreground">Gérez votre compte, vos notifications et votre confidentialité</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="account">
            <User className="h-4 w-4 mr-2" />
            Compte
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="privacy">
            <Shield className="h-4 w-4 mr-2" />
            Confidentialité
          </TabsTrigger>
          <TabsTrigger value="appearance">
            <Palette className="h-4 w-4 mr-2" />
            Apparence
          </TabsTrigger>
          <TabsTrigger value="danger">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Danger
          </TabsTrigger>
        </TabsList>

        {/* Account Tab */}
        <TabsContent value="account" className="space-y-6">
          <form onSubmit={handleAccountSubmit} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informations personnelles</CardTitle>
                <CardDescription>Ces informations sont visibles sur votre profil selon vos paramètres de confidentialité</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">Prénom *</Label>
                    <Input
                      id="first_name"
                      value={accountData.first_name}
                      onChange={e => setAccountData(prev => ({ ...prev, first_name: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">Nom *</Label>
                    <Input
                      id="last_name"
                      value={accountData.last_name}
                      onChange={e => setAccountData(prev => ({ ...prev, last_name: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={accountData.email}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-sm text-muted-foreground">L'email ne peut pas être modifié ici. Contactez le support pour le changer.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Biographie</Label>
                  <textarea
                    id="bio"
                    value={accountData.bio}
                    onChange={e => setAccountData(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Parlez de vous..."
                    className="min-h-[100px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    maxLength={500}
                  />
                  <p className="text-sm text-muted-foreground text-right">{accountData.bio.length}/500</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">Ville</Label>
                  <Input
                    id="city"
                    value={accountData.city}
                    onChange={e => setAccountData(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="Votre ville"
                  />
                </div>
              </CardContent>
            </Card>

            <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Sauvegarde...
                </>
              ) : (
                'Sauvegarder les modifications'
              )}
            </Button>
          </form>

          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="text-destructive flex items-center gap-2">
                <Trash2 className="h-5 w-5" />
                Supprimer mon compte
              </CardTitle>
              <CardDescription>
                Action irréversible. Toutes vos données seront perdues définitivement.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="destructive" onClick={handleDeleteAccount} disabled={isLoading} className="w-full">
                {isLoading ? 'Suppression...' : 'Supprimer mon compte'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notifications Push</CardTitle>
              <CardDescription>Recevez des notifications en temps réel dans l'application</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Activer les notifications push</p>
                  <p className="text-sm text-muted-foreground">Recevez des alertes même quand l'app est fermée</p>
                </div>
                <Switch
                  checked={notificationSettings.push_enabled}
                  onCheckedChange={checked => setNotificationSettings(prev => ({ ...prev, push_enabled: checked }))}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Notifications par email</p>
                  <p className="text-sm text-muted-foreground">Recevez un récapitulatif par email</p>
                </div>
                <Switch
                  checked={notificationSettings.email_enabled}
                  onCheckedChange={checked => setNotificationSettings(prev => ({ ...prev, email_enabled: checked }))}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Types de notifications</CardTitle>
              <CardDescription>Choisissez ce pour quoi vous voulez être notifié</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: 'match_notifications', label: 'Nouveaux matchs', desc: 'Quand vous avez un match mutuel' },
                { key: 'message_notifications', label: 'Nouveaux messages', desc: 'Quand vous recevez un message' },
                { key: 'like_notifications', label: 'Likes reçus', desc: 'Quand quelqu\'un vous like' },
                { key: 'super_like_notifications', label: 'Super Likes', desc: 'Quand vous recevez un Super Like' },
                { key: 'verification_notifications', label: 'Vérification', desc: 'Résultat de votre vérification étudiante' },
                { key: 'marketing_emails', label: 'Emails marketing', desc: 'Actualités et offres de BC Connect' },
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{label}</p>
                    <p className="text-sm text-muted-foreground">{desc}</p>
                  </div>
                  <Switch
                    checked={notificationSettings[key as keyof typeof notificationSettings] as boolean}
                    onCheckedChange={checked => setNotificationSettings(prev => ({ ...prev, [key]: checked }))}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy Tab */}
        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Visibilité du profil</CardTitle>
              <CardDescription>Qui peut voir votre profil dans la découverte</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select
                value={privacySettings.profile_visibility}
                onValueChange={value => setPrivacySettings(prev => ({ ...prev, profile_visibility: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="verified_only">Étudiants vérifiés seulement (recommandé)</SelectItem>
                  <SelectItem value="everyone">Tous les étudiants</SelectItem>
                  <SelectItem value="matches_only">Mes matchs uniquement</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Informations affichées</CardTitle>
              <CardDescription>Choisissez ce qui est visible sur votre profil public</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: 'show_age', label: 'Mon âge', desc: 'Afficher mon âge calculé depuis ma date de naissance' },
                { key: 'show_location', label: 'Ma ville', desc: 'Afficher ma ville de résidence' },
                { key: 'show_online_status', label: 'Statut en ligne', desc: 'Laisser les autres voir si je suis en ligne' },
                { key: 'show_distance', label: 'Distance', desc: 'Afficher la distance approximative aux autres profils' },
                { key: 'allow_super_likes', label: 'Accepter les Super Likes', desc: 'Autoriser les autres à m\'envoyer des Super Likes' },
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{label}</p>
                    <p className="text-sm text-muted-foreground">{desc}</p>
                  </div>
                  <Switch
                    checked={privacySettings[key as keyof typeof privacySettings] as boolean}
                    onCheckedChange={checked => setPrivacySettings(prev => ({ ...prev, [key]: checked }))}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-primary/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                Avantages du profil vérifié
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="text-muted-foreground">
                Les profils vérifiés bénéficient d'une visibilité prioritaire dans la découverte,
                d'un badge visible par tous, et de plus de confiance de la part des autres étudiants.
              </p>
              <Link href="/verification" className="text-primary hover:underline inline-flex items-center gap-1">
                Vérifier mon profil <CheckCircle2 className="h-4 w-4" />
              </Link>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Thème</CardTitle>
              <CardDescription>Choisissez l'apparence de l'application</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-3">
                {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => setAppearanceSettings(prev => ({ ...prev, theme: value }))}
                    className={cn(
                      'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all',
                      appearanceSettings.theme === value
                        ? 'border-primary bg-primary/5'
                        : 'border-muted hover:border-primary/50'
                    )}
                  >
                    <Icon className="h-6 w-6" />
                    <span className="font-medium">{label}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Langue</CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={appearanceSettings.language}
                onValueChange={value => setAppearanceSettings(prev => ({ ...prev, language: value }))}
              >
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Choisir" />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGE_OPTIONS.map(l => (
                    <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Accessibilité</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Réduire les animations</p>
                  <p className="text-sm text-muted-foreground">Désactive les transitions et effets visuels</p>
                </div>
                <Switch
                  checked={appearanceSettings.reduced_motion}
                  onCheckedChange={checked => setAppearanceSettings(prev => ({ ...prev, reduced_motion: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Contraste élevé</p>
                  <p className="text-sm text-muted-foreground">Améliore la lisibilité pour les malvoyants</p>
                </div>
                <Switch
                  checked={appearanceSettings.high_contrast}
                  onCheckedChange={checked => setAppearanceSettings(prev => ({ ...prev, high_contrast: checked }))}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Danger Tab */}
        <TabsContent value="danger" className="space-y-6">
          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="text-destructive flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Zone de danger
              </CardTitle>
              <CardDescription>
                Ces actions sont irréversibles. Utilisez-les avec précaution.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 rounded-lg bg-destructive/5 border border-destructive/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-destructive">Supprimer mon compte</p>
                    <p className="text-sm text-muted-foreground">
                      Supprime définitivement votre profil, vos photos, vos matchs, vos messages et toutes vos données.
                      Cette action ne peut pas être annulée.
                    </p>
                  </div>
                  <Button variant="destructive" onClick={handleDeleteAccount} disabled={isLoading}>
                    {isLoading ? 'Suppression...' : 'Supprimer mon compte'}
                  </Button>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-3">Autres actions</h4>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Mail className="h-4 w-4" />
                    Demander mes données (RGPD)
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Lock className="h-4 w-4" />
                    Changer mon mot de passe
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Trash2 className="h-4 w-4" />
                    Supprimer toutes mes photos
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Trash2 className="h-4 w-4" />
                    Supprimer tous mes matchs et messages
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Déconnexion</CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="outline" onClick={handleSignOut} className="w-full">
                Se déconnecter de tous les appareils
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}