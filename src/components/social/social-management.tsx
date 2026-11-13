'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/hooks/use-auth';
import { useMySocialAccounts, useAddSocialAccount, useUpdateSocialAccount, useDeleteSocialAccount, usePlatforms } from '@/lib/hooks/use-social';
import { SocialLinks } from './social-links';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { cn } from '@/lib/utils/cn';
import { Plus, X, Share2, CheckCircle2, ExternalLink } from 'lucide-react';

const PLATFORM_LABELS: Record<string, string> = {
  instagram: 'Instagram',
  snapchat: 'Snapchat',
  tiktok: 'TikTok',
  facebook: 'Facebook',
  whatsApp: 'WhatsApp',
  discord: 'Discord',
  x: 'X (Twitter)',
  other: 'Autre',
};

const PLATFORM_PLACEHOLDERS: Record<string, string> = {
  instagram: 'votre_pseudo',
  snapchat: 'votre_pseudo',
  tiktok: '@votre_pseudo',
  facebook: 'votre.nom',
  whatsapp: '336XXXXXXXX',
  discord: 'votre_pseudo#1234',
  x: 'votre_pseudo',
  other: 'Lien ou identifiant',
};

export function SocialManagement() {
  const { data: accounts = [], isLoading } = useMySocialAccounts();
  const addMutation = useAddSocialAccount();
  const updateMutation = useUpdateSocialAccount();
  const deleteMutation = useDeleteSocialAccount();
  const platforms = usePlatforms();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<typeof accounts[0] | null>(null);
  type SocialPlatform = 'instagram' | 'snapchat' | 'tiktok' | 'facebook' | 'whatsapp' | 'discord' | 'x' | 'other';

const [formData, setFormData] = useState<{
  platform: SocialPlatform;
  username: string;
  url: string;
  display_name: string;
  is_visible_by_default: boolean;
}>({
  platform: 'instagram',
  username: '',
  url: '',
  display_name: '',
  is_visible_by_default: false,
});

  const handleOpenDialog = (account?: typeof accounts[0]) => {
    if (account) {
      setEditingAccount(account);
      setFormData({
        platform: account.platform,
        username: account.username || '',
        url: account.url || '',
        display_name: account.display_name || '',
        is_visible_by_default: account.is_visible_by_default,
      });
    } else {
      setEditingAccount(null);
      setFormData({
        platform: 'instagram',
        username: '',
        url: '',
        display_name: '',
        is_visible_by_default: false,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...formData };

    // Auto-generate URL if not provided
    if (!payload.url && payload.username) {
      const urlPatterns: Record<string, string> = {
        instagram: `https://instagram.com/${payload.username}`,
        snapchat: `https://snapchat.com/add/${payload.username}`,
        tiktok: `https://tiktok.com/@${payload.username}`,
        facebook: `https://facebook.com/${payload.username}`,
        whatsapp: `https://wa.me/${payload.username}`,
        discord: `https://discord.com/users/${payload.username}`,
        x: `https://x.com/${payload.username}`,
      };
      payload.url = urlPatterns[payload.platform] || '';
    }

    if (editingAccount) {
      await updateMutation.mutateAsync({ id: editingAccount.id, ...payload });
    } else {
      await addMutation.mutateAsync(payload);
    }
    setIsDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce réseau social ?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Mes réseaux sociaux</h2>
          <p className="text-muted-foreground text-sm">
            Gérez vos comptes et choisissez ceux à partager après un match
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un réseau
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingAccount ? 'Modifier' : 'Ajouter'} un réseau social</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="platform">Plateforme</Label>
                  <Select value={formData.platform} onValueChange={(v: SocialPlatform) => setFormData(prev => ({ ...prev, platform: v }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir une plateforme" />
                    </SelectTrigger>
                    <SelectContent>
                      {platforms.map((p) => (
                        <SelectItem key={p.value} value={p.value}>
                          {p.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">Nom d'utilisateur / Identifiant</Label>
                  <Input
                    id="username"
                    placeholder={PLATFORM_PLACEHOLDERS[formData.platform] || 'Identifiant'}
                    value={formData.username}
                    onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="url">Lien complet (optionnel)</Label>
                  <Input
                    id="url"
                    placeholder="https://..."
                    value={formData.url}
                    onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="display_name">Nom d'affichage (optionnel)</Label>
                  <Input
                    id="display_name"
                    placeholder="Mon profil"
                    value={formData.display_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_visible_by_default"
                    checked={formData.is_visible_by_default}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_visible_by_default: e.target.checked }))}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <Label htmlFor="is_visible_by_default" className="cursor-pointer text-sm">
                    Visible par défaut sur mon profil
                  </Label>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit" disabled={addMutation.isPending || updateMutation.isPending}>
                  {editingAccount ? 'Sauvegarder' : 'Ajouter'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Accounts list */}
      {accounts.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-xl">
          <p className="text-muted-foreground mb-4">Aucun réseau social configuré</p>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter mon premier réseau
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {accounts.map((account) => {
            const platformLabel = PLATFORM_LABELS[account.platform] || account.platform;
            const Icon = ({ className }: { className?: string }) => (
              <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                {/* Simplified icon - in real app use proper icons */}
                <path d="M12 2C6.477 2 2 6.484 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z" />
              </svg>
            );

            return (
              <div key={account.id} className="flex items-center gap-3 p-3 rounded-xl bg-card border">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{platformLabel}</p>
                  <p className="text-sm text-muted-foreground truncate">
                    @{account.username || account.display_name || 'Sans identifiant'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {account.is_visible_by_default && (
                    <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                      <CheckCircle2 className="h-3 w-3" />
                      Public
                    </span>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleOpenDialog(account)}
                    aria-label={`Modifier ${platformLabel}`}
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(account.id)}
                    className="text-destructive hover:text-destructive"
                    aria-label={`Supprimer ${platformLabel}`}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Sharing info */}
      <div className="rounded-xl bg-muted/50 p-4 border">
        <h3 className="font-medium mb-2">Partage après un match</h3>
        <p className="text-sm text-muted-foreground mb-3">
          Vos réseaux sociaux ne sont visibles par personne tant qu'il n'y a pas de match.
          Après un match, vous pouvez choisir individuellement quels comptes partager.
        </p>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Share2 className="h-4 w-4" />
          <span>Gérez le partage depuis la page du match ou vos paramètres de confidentialité</span>
        </div>
      </div>
    </div>
  );
}