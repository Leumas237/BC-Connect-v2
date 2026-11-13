'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
type AdminTab = 'campaigns' | 'analytics' | 'slots';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Plus, Filter, Search, Eye, Edit, Trash2, Play, Pause, DollarSign, BarChart3, Upload, ExternalLink, Calendar, Clock, Loader2, MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useAdminCampaigns, useAdminCampaignActions, useAdminSlots, useAdminSlotActions, useAdminAnalytics } from '@/lib/hooks/use-admin';
import { toast } from 'sonner';

const STATUS_CONFIG = {
  draft: { label: 'Brouillon', variant: 'secondary' as const },
  pending_approval: { label: 'En attente', variant: 'warning' as const },
  scheduled: { label: 'Programmé', variant: 'default' as const },
  active: { label: 'Actif', variant: 'success' as const },
  expired: { label: 'Expiré', variant: 'destructive' as const },
  disabled: { label: 'Désactivé', variant: 'secondary' as const },
} as const;

const PAYMENT_STATUS = {
  unpaid: { label: 'Non payé', variant: 'destructive' as const },
  partial: { label: 'Partiel', variant: 'warning' as const },
  paid: { label: 'Payé', variant: 'success' as const },
  refunded: { label: 'Remboursé', variant: 'secondary' as const },
} as const;

const SLOT_LABELS = {
  discover_top: 'Découverte - Haut',
  discover_bottom: 'Découverte - Bas',
  matches_sidebar: 'Matchs - Sidebar',
  messages_banner: 'Messages - Bannière',
  profile_sidebar: 'Profil - Sidebar',
} as const;

export default function AdminAdvertisingPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('campaigns');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingCampaign, setEditingCampaign] = useState<{
    id: string;
    advertiser_name: string;
    title: string;
    description: string | null;
    image_url: string;
    destination_url: string | null;
    contact_info: string | null;
    start_date: string;
    end_date: string;
    status: string;
    negotiated_price: number | null;
    payment_status: string;
    payment_reference: string | null;
    slots: string[];
  } | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  type CampaignStatus = 'draft' | 'pending_approval' | 'scheduled' | 'active' | 'expired' | 'disabled';

const [formData, setFormData] = useState<{
    advertiser_name: string;
    title: string;
    description: string;
    image_url: string;
    destination_url: string;
    contact_info: string;
    start_date: string;
    end_date: string;
    status: CampaignStatus;
    negotiated_price: number;
    payment_status: string;
    payment_reference: string;
    slots: string[];
}>({
    advertiser_name: '',
    title: '',
    description: '',
    image_url: '',
    destination_url: '',
    contact_info: '',
    start_date: '',
    end_date: '',
    status: 'draft',
    negotiated_price: 0,
    payment_status: 'unpaid',
    payment_reference: '',
    slots: [] as string[],
  });

  const { data: campaigns = [], isLoading: campaignsLoading, error: campaignsError } = useAdminCampaigns({
    status: statusFilter !== 'all' ? statusFilter : undefined,
    search: search || undefined,
  });
  const { createCampaign, updateCampaign, deleteCampaign, recordPayment } = useAdminCampaignActions();
  const { data: slots = [], isLoading: slotsLoading } = useAdminSlots();
  const { updateSlot } = useAdminSlotActions();
  const { data: analytics } = useAdminAnalytics();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return 'Non défini';
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XAF', minimumFractionDigits: 0 }).format(amount);
  };

  const getCTR = (impressions: number, clicks: number) => {
    if (impressions === 0) return '0%';
    return `${((clicks / impressions) * 100).toFixed(2)}%`;
  };

  const openEditDialog = (campaign?: {
    id: string;
    advertiser_name: string;
    title: string;
    description: string | null;
    image_url: string;
    destination_url: string | null;
    contact_info: string | null;
    start_date: string;
    end_date: string;
    status: string;
    negotiated_price: number | null;
    payment_status: string;
    payment_reference: string | null;
    slots: string[];
  }) => {
    if (campaign) {
      setEditingCampaign(campaign);
      setFormData({
        advertiser_name: campaign.advertiser_name,
        title: campaign.title,
        description: campaign.description ?? '',
        image_url: campaign.image_url,
        destination_url: campaign.destination_url ?? '',
        contact_info: campaign.contact_info ?? '',
        start_date: campaign.start_date?.split('T')[0] ?? '',
        end_date: campaign.end_date?.split('T')[0] ?? '',
        status: campaign.status as CampaignStatus,
        negotiated_price: campaign.negotiated_price ?? 0,
        payment_status: campaign.payment_status,
        payment_reference: campaign.payment_reference ?? '',
        slots: campaign.slots,
      });
    } else {
      setEditingCampaign(null);
      setFormData({
        advertiser_name: '',
        title: '',
        description: '',
        image_url: '',
        destination_url: '',
        contact_info: '',
        start_date: new Date().toISOString().split('T')[0] ?? '',
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] ?? '',
        status: 'draft',
        negotiated_price: 0,
        payment_status: 'unpaid',
        payment_reference: '',
        slots: [],
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (editingCampaign) {
      await updateCampaign.mutateAsync({ id: editingCampaign.id, ...formData });
    } else {
      await createCampaign.mutateAsync(formData);
    }
    setIsDialogOpen(false);
  };

  if (campaignsError) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-destructive">
          Erreur lors du chargement des campagnes
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Gestion publicitaire</h1>
          <p className="text-muted-foreground">Campagnes, emplacements et analytics</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle campagne
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingCampaign ? 'Modifier la campagne' : 'Nouvelle campagne publicitaire'}</DialogTitle>
              <DialogDescription>Remplissez les informations de la campagne publicitaire</DialogDescription>
            </DialogHeader>
            <form onSubmit={e => { e.preventDefault(); handleSubmit(); }} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="advertiser_name">Annonceur *</Label>
                  <Input
                    id="advertiser_name"
                    value={formData.advertiser_name}
                    onChange={e => setFormData(prev => ({ ...prev, advertiser_name: e.target.value }))}
                    required
                    placeholder="Nom de l'annonceur"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Titre de la campagne *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    required
                    placeholder="Titre accrocheur"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Description de l'offre..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image_url">URL de l'image (bannière) *</Label>
                <Input
                  id="image_url"
                  value={formData.image_url}
                  onChange={e => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                  required
                  placeholder="https://..."
                />
                <p className="text-sm text-muted-foreground">Format recommandé : 1200x600px (ratio 2:1)</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="destination_url">URL de destination</Label>
                  <Input
                    id="destination_url"
                    value={formData.destination_url}
                    onChange={e => setFormData(prev => ({ ...prev, destination_url: e.target.value }))}
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact_info">Contact annonceur</Label>
                  <Input
                    id="contact_info"
                    value={formData.contact_info}
                    onChange={e => setFormData(prev => ({ ...prev, contact_info: e.target.value }))}
                    placeholder="Téléphone, email..."
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Date de début *</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={e => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_date">Date de fin *</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={e => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Emplacements (slots)</Label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(SLOT_LABELS).map(([key, label]) => (
                    <label key={key} className={cn(
                      'inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm cursor-pointer transition-colors',
                      formData.slots.includes(key)
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-border hover:bg-accent'
                    )}>
                      <input
                        type="checkbox"
                        checked={formData.slots.includes(key)}
                        onChange={e => {
                          const newSlots = e.target.checked
                            ? [...formData.slots, key]
                            : formData.slots.filter(s => s !== key);
                          setFormData(prev => ({ ...prev, slots: newSlots }));
                        }}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="status">Statut</Label>
                  <Select value={formData.status} onValueChange={(v: CampaignStatus) => setFormData(prev => ({ ...prev, status: v }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Brouillon</SelectItem>
                      <SelectItem value="pending_approval">En attente validation</SelectItem>
                      <SelectItem value="scheduled">Programmé</SelectItem>
                      <SelectItem value="active">Actif</SelectItem>
                      <SelectItem value="disabled">Désactivé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="negotiated_price">Prix négocié (FCFA)</Label>
                  <Input
                    id="negotiated_price"
                    type="number"
                    min="0"
                    step="1000"
                    value={formData.negotiated_price}
                    onChange={e => setFormData(prev => ({ ...prev, negotiated_price: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payment_status">Paiement</Label>
                  <Select value={formData.payment_status} onValueChange={v => setFormData(prev => ({ ...prev, payment_status: v }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Statut paiement" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unpaid">Non payé</SelectItem>
                      <SelectItem value="partial">Partiel</SelectItem>
                      <SelectItem value="paid">Payé</SelectItem>
                      <SelectItem value="refunded">Remboursé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment_reference">Référence de paiement</Label>
                <Input
                  id="payment_reference"
                  value={formData.payment_reference}
                  onChange={e => setFormData(prev => ({ ...prev, payment_reference: e.target.value }))}
                  placeholder="PAY-2024-XXX"
                />
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Annuler</Button>
                <Button type="submit" disabled={createCampaign.isPending || updateCampaign.isPending}>
                  {editingCampaign ? 'Mettre à jour' : 'Créer la campagne'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value: string) => setActiveTab(value as AdminTab)} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="campaigns">Campagnes ({campaigns.length})</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="slots">Emplacements</TabsTrigger>
        </TabsList>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher campagne..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="draft">Brouillon</SelectItem>
                <SelectItem value="pending_approval">En attente</SelectItem>
                <SelectItem value="scheduled">Programmé</SelectItem>
                <SelectItem value="active">Actif</SelectItem>
                <SelectItem value="expired">Expiré</SelectItem>
                <SelectItem value="disabled">Désactivé</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {campaignsLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : campaigns.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Aucune campagne ne correspond</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {campaigns.map((campaign) => {
                const statusConfig = STATUS_CONFIG[campaign.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.draft;
                const paymentConfig = PAYMENT_STATUS[campaign.payment_status as keyof typeof PAYMENT_STATUS] || PAYMENT_STATUS.unpaid;

                return (
                  <Card key={campaign.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 flex-wrap">
                            <h3 className="font-semibold text-lg">{campaign.title}</h3>
                            <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
                            <Badge variant={paymentConfig.variant}>{paymentConfig.label}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{campaign.advertiser_name}</p>
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{campaign.description}</p>
                          <div className="flex flex-wrap gap-4 mt-3 text-xs text-muted-foreground">
                            <span>📅 {formatDate(campaign.start_date)} → {formatDate(campaign.end_date)}</span>
                            <span>👁 {campaign.impressions_count.toLocaleString()} impressions</span>
                            <span>🖱 {campaign.clicks_count} clics (CTR: {getCTR(campaign.impressions_count, campaign.clicks_count)})</span>
                            <span>💰 {formatCurrency(campaign.negotiated_price)}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEditDialog(campaign)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Modifier
                              </DropdownMenuItem>
                              {campaign.status !== 'active' && (
                                <DropdownMenuItem onClick={() => {}} className="text-green-600">
                                  <Play className="h-4 w-4 mr-2" />
                                  Activer
                                </DropdownMenuItem>
                              )}
                              {campaign.status === 'active' && (
                                <DropdownMenuItem onClick={() => {}} className="text-yellow-600">
                                  <Pause className="h-4 w-4 mr-2" />
                                  Mettre en pause
                                </DropdownMenuItem>
                              )}
                              {campaign.destination_url && (
                                <DropdownMenuItem asChild>
                                  <a href={campaign.destination_url} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="h-4 w-4 mr-2" />
                                    Voir la landing page
                                  </a>
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => {}} className="text-blue-600">
                                <BarChart3 className="h-4 w-4 mr-2" />
                                Voir analytics détaillées
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => deleteCampaign.mutateAsync(campaign.id)} className="text-destructive">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Supprimer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Impressions totales</p>
                    <p className="text-2xl font-bold">{analytics?.total_impressions?.toLocaleString() ?? '0'}</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                    <BarChart3 className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Clics totaux</p>
                    <p className="text-2xl font-bold">{analytics?.total_clicks?.toLocaleString() ?? '0'}</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
                    <ExternalLink className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">CTR moyen</p>
                    <p className="text-2xl font-bold">
                      {analytics?.total_impressions && analytics?.total_impressions > 0
                        ? `${((analytics.total_clicks / analytics.total_impressions) * 100).toFixed(2)}%`
                        : '0%'}
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-100">
                    <BarChart3 className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Revenus confirmés</p>
                    <p className="text-2xl font-bold">{formatCurrency(analytics?.total_revenue ?? 0)}</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Performance par campagne</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campagne</TableHead>
                    <TableHead className="text-right">Impressions</TableHead>
                    <TableHead className="text-right">Clics</TableHead>
                    <TableHead className="text-right">CTR</TableHead>
                    <TableHead className="text-right">Revenus</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaigns.map(c => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.title}</TableCell>
                      <TableCell className="text-right">{c.impressions_count.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{c.clicks_count}</TableCell>
                      <TableCell className="text-right font-medium">{getCTR(c.impressions_count, c.clicks_count)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(c.negotiated_price)}</TableCell>
                      <TableCell>
                        <Badge variant={STATUS_CONFIG[c.status as keyof typeof STATUS_CONFIG]?.variant ?? 'secondary'}>
                          {STATUS_CONFIG[c.status as keyof typeof STATUS_CONFIG]?.label ?? c.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Slots Tab */}
        <TabsContent value="slots" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Emplacements publicitaires</CardTitle>
              <CardDescription>Configurez les slots disponibles pour les campagnes</CardDescription>
            </CardHeader>
            <CardContent>
              {slotsLoading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Slot</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Max bannières</TableHead>
                      <TableHead>Actif</TableHead>
                      <TableHead>Campagnes assignées</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {slots.map((slot) => (
                      <TableRow key={slot.id}>
                        <TableCell className="font-mono">{slot.slot_key}</TableCell>
                        <TableCell>{slot.slot_name}</TableCell>
                        <TableCell>{slot.max_banners}</TableCell>
                        <TableCell>
                          <Badge variant={slot.is_enabled ? 'success' : 'secondary'}>
                            {slot.is_enabled ? 'Oui' : 'Non'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {campaigns.filter(c => c.slots.includes(slot.slot_key) && c.status === 'active').length} active
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateSlot.mutateAsync({ id: slot.id, is_enabled: !slot.is_enabled })}
                            disabled={updateSlot.isPending}
                          >
                            {slot.is_enabled ? 'Désactiver' : 'Activer'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatCurrency(amount: number | null) {
  if (amount === null) return 'Non défini';
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XAF', minimumFractionDigits: 0 }).format(amount);
}

function getCTR(impressions: number, clicks: number) {
  if (impressions === 0) return '0%';
  return `${((clicks / impressions) * 100).toFixed(2)}%`;
}