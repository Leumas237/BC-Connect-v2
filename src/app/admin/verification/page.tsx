'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Search, Filter, CheckCircle2, XCircle, Clock, FileText, Eye, Download, MoreVertical, Shield, AlertTriangle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useAdminVerifications, useAdminUserActions } from '@/lib/hooks/use-admin';
import { toast } from 'sonner';

const STATUS_CONFIG = {
  pending: { label: 'En attente', variant: 'warning' as const, icon: Clock },
  approved: { label: 'Approuvé', variant: 'success' as const, icon: CheckCircle2 },
  rejected: { label: 'Refusé', variant: 'destructive' as const, icon: XCircle },
} as const;

export default function AdminVerificationPage() {
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [search, setSearch] = useState('');
  const [selectedVerification, setSelectedVerification] = useState<{
    id: string;
    profile_id: string;
    first_name: string;
    last_name: string;
    email: string;
    file_name: string;
    file_size: number;
    mime_type: string;
    created_at: string;
    profile_completeness: number;
  } | null>(null);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');
  const [rejectionReason, setRejectionReason] = useState('');

  const { data: verifications = [], isLoading, error } = useAdminVerifications(activeTab === 'all' ? undefined : activeTab);
  const { approveVerification, rejectVerification } = useAdminUserActions();

  const pendingCount = verifications.filter((v: typeof verifications[0]) => v.status === 'pending').length;
  const approvedCount = verifications.filter((v: typeof verifications[0]) => v.status === 'approved').length;
  const rejectedCount = verifications.filter((v: typeof verifications[0]) => v.status === 'rejected').length;

  const filteredVerifications = verifications.filter((v: typeof verifications[0]) => {
    const matchesSearch =
      v.first_name.toLowerCase().includes(search.toLowerCase()) ||
      v.last_name.toLowerCase().includes(search.toLowerCase()) ||
      v.email.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
  };

  const getInitials = (first: string, last: string) => `${first[0]}${last[0]}`.toUpperCase();

  const openActionDialog = (verification: typeof verifications[0], type: 'approve' | 'reject') => {
    setSelectedVerification(verification);
    setActionType(type);
    setRejectionReason('');
    setActionDialogOpen(true);
  };

  const handleActionConfirm = async () => {
    if (!selectedVerification) return;

    try {
      if (actionType === 'approve') {
        await approveVerification.mutateAsync(selectedVerification.id);
      } else {
        await rejectVerification.mutateAsync({ docId: selectedVerification.id, reason: rejectionReason });
      }
      setActionDialogOpen(false);
      setSelectedVerification(null);
    } catch (error) {
      console.error(error);
    }
  };

  if (error) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-destructive">
          Erreur lors du chargement des vérifications
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Vérifications étudiantes</h1>
          <p className="text-muted-foreground">Validez les documents d'identité des étudiants</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtres
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">En attente</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-100">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Approuvés</p>
                <p className="text-2xl font-bold text-green-600">{approvedCount}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Refusés</p>
                <p className="text-2xl font-bold text-red-600">{rejectedCount}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{verifications.length}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value: string) => setActiveTab(value as 'pending' | 'approved' | 'rejected' | 'all')} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">Tous ({verifications.length})</TabsTrigger>
          <TabsTrigger value="pending">En attente ({pendingCount})</TabsTrigger>
          <TabsTrigger value="approved">Approuvés ({approvedCount})</TabsTrigger>
          <TabsTrigger value="rejected">Refusés ({rejectedCount})</TabsTrigger>
        </TabsList>

        {/* Verification List */}
        <TabsContent value="all" className="space-y-4">
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Rechercher par nom, email..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredVerifications.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Aucune vérification ne correspond aux critères</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredVerifications.map((verification: typeof filteredVerifications[0]) => {
                const statusConfig = STATUS_CONFIG[verification.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;
                const StatusIcon = statusConfig.icon;

                return (
                  <Card key={verification.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-4 flex-1">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback>{getInitials(verification.first_name, verification.last_name)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-3">
                              <p className="font-semibold text-lg">{verification.first_name} {verification.last_name}</p>
                              <Badge variant={statusConfig.variant} className="gap-1">
                                <StatusIcon className="h-3 w-3" />
                                {statusConfig.label}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{verification.email}</p>
                            <p className="text-xs text-muted-foreground">Profil complété à {verification.profile_completeness}%</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right text-sm text-muted-foreground hidden sm:block">
                            <p>Document: {verification.file_name}</p>
                            <p>{formatFileSize(verification.file_size)} • {formatDate(verification.created_at)}</p>
                          </div>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => {}}>
                                <Eye className="h-4 w-4 mr-2" />
                                Voir le document
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {}}>
                                <Download className="h-4 w-4 mr-2" />
                                Télécharger
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {verification.status === 'pending' && (
                                <>
                                  <DropdownMenuItem onClick={() => openActionDialog(verification, 'approve')} className="text-green-600">
                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                    Approuver
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => openActionDialog(verification, 'reject')} className="text-red-600">
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Refuser
                                  </DropdownMenuItem>
                                </>
                              )}
                              {verification.status === 'approved' && (
                                <DropdownMenuItem className="text-destructive">
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Révoquer l'approbation
                                </DropdownMenuItem>
                              )}
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
      </Tabs>

      {/* Action Dialog */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{actionType === 'approve' ? 'Approuver la vérification' : 'Refuser la vérification'}</DialogTitle>
            <DialogDescription>
              {actionType === 'approve'
                ? `Confirmez l'approbation du document de ${selectedVerification?.first_name} ${selectedVerification?.last_name}. Le badge "Étudiant vérifié" sera attribué.`
                : `Indiquez la raison du refus pour ${selectedVerification?.first_name} ${selectedVerification?.last_name}. L'étudiant sera notifié.`}
            </DialogDescription>
          </DialogHeader>

          {actionType === 'reject' && (
            <div className="py-4 space-y-2">
              <Label htmlFor="rejection_reason">Motif du refus *</Label>
              <Textarea
                id="rejection_reason"
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
                placeholder="Ex: Document illisible, nom ne correspond pas, document expiré..."
                rows={3}
                required
              />
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => { setActionDialogOpen(false); setSelectedVerification(null); }}>
              Annuler
            </Button>
            <Button
              variant={actionType === 'approve' ? 'default' : 'destructive'}
              onClick={handleActionConfirm}
              disabled={approveVerification.isPending || rejectVerification.isPending}
            >
              {approveVerification.isPending || rejectVerification.isPending ? 'Traitement...' : actionType === 'approve' ? 'Approuver' : 'Refuser'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

function getInitials(first: string, last: string) {
  return `${first[0]}${last[0]}`.toUpperCase();
}