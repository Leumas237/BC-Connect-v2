'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Search, Filter, MoreVertical, CheckCircle2, XCircle, Clock, UserPlus, Ban, Shield, Mail, Edit, Trash2, Eye, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useAdminUsers, useAdminUserActions } from '@/lib/hooks/use-admin';
import { toast } from 'sonner';

const STATUS_CONFIG = {
  verified: { label: 'Vérifié', variant: 'success' as const, icon: CheckCircle2 },
  pending: { label: 'En attente', variant: 'warning' as const, icon: Clock },
  rejected: { label: 'Refusé', variant: 'destructive' as const, icon: XCircle },
  unverified: { label: 'Non vérifié', variant: 'secondary' as const, icon: Clock },
} as const;

export default function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [banFilter, setBanFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedUser, setSelectedUser] = useState<{ id: string; reason: string } | null>(null);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'ban' | 'unban' | 'delete'>('ban');
  const [actionReason, setActionReason] = useState('');

  const { data, isLoading, error } = useAdminUsers({
    status: statusFilter !== 'all' ? statusFilter : undefined,
    banned: banFilter !== 'all' ? banFilter : undefined,
    search: search || undefined,
    page: currentPage,
    limit: 20,
  });

  const { banUser, unbanUser, deleteUser } = useAdminUserActions();

  const users = data?.users ?? [];
  const totalUsers = data?.total ?? 0;
  const totalPages = Math.ceil(totalUsers / 20);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getInitials = (first: string, last: string) => {
    return `${first[0]}${last[0]}`.toUpperCase();
  };

  const handleAction = async (user: { id: string; first_name: string; last_name: string }, type: 'ban' | 'unban' | 'delete') => {
    setSelectedUser({ id: user.id, reason: '' });
    setActionType(type);
    setActionReason('');
    setActionDialogOpen(true);
  };

  const handleActionConfirm = async () => {
    if (!selectedUser) return;

    try {
      if (actionType === 'ban') {
        await banUser.mutateAsync({ userId: selectedUser.id, reason: actionReason });
      } else if (actionType === 'unban') {
        await unbanUser.mutateAsync(selectedUser.id);
      } else if (actionType === 'delete') {
        await deleteUser.mutateAsync({ userId: selectedUser.id, reason: actionReason });
      }
      setActionDialogOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error(error);
    }
  };

  if (error) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-destructive">
          Erreur lors du chargement des utilisateurs
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Gestion des utilisateurs</h1>
          <p className="text-muted-foreground">{totalUsers} utilisateur{totalUsers > 1 ? 's' : ''} au total</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtres avancés
          </Button>
          <Button size="sm">
            <UserPlus className="h-4 w-4 mr-2" />
            Ajouter un utilisateur
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom, email..."
                value={search}
                onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setCurrentPage(1); }}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Statut vérification" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="verified">Vérifié</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="rejected">Refusé</SelectItem>
                <SelectItem value="unverified">Non vérifié</SelectItem>
              </SelectContent>
            </Select>
            <Select value={banFilter} onValueChange={v => { setBanFilter(v); setCurrentPage(1); }}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Statut compte" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="active">Actifs</SelectItem>
                <SelectItem value="banned">Bannis</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Trier par" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at">Date d'inscription</SelectItem>
                <SelectItem value="last_active_at">Dernière activité</SelectItem>
                <SelectItem value="matches_count">Nombre de matchs</SelectItem>
                <SelectItem value="reports_count">Signalements</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Utilisateur</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Programme</TableHead>
                      <TableHead className="hidden md:table-cell">Vérification</TableHead>
                      <TableHead className="hidden md:table-cell">Compte</TableHead>
                      <TableHead className="text-right">Matchs</TableHead>
                      <TableHead className="text-right">Signalements</TableHead>
                      <TableHead className="hidden lg:table-cell">Inscrit le</TableHead>
                      <TableHead className="hidden lg:table-cell">Dernière activité</TableHead>
                      <TableHead className="w-32">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                          Aucun utilisateur ne correspond aux critères
                        </TableCell>
                      </TableRow>
                    ) : (
                      users.map((user) => {
                        const statusConfig = STATUS_CONFIG[user.verification_status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.unverified;
                        const StatusIcon = statusConfig.icon;

                        return (
                          <TableRow key={user.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                  <AvatarFallback>{getInitials(user.first_name, user.last_name)}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">{user.first_name} {user.last_name}</p>
                                  <p className="text-xs text-muted-foreground">{user.id}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>{user.academic_program ?? 'Non renseigné'}</TableCell>
                            <TableCell className="hidden md:table-cell">
                              <Badge variant={statusConfig.variant} className="gap-1">
                                <StatusIcon className="h-3 w-3" />
                                {statusConfig.label}
                              </Badge>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              <Badge variant={user.is_banned ? 'destructive' : 'success'} className="gap-1">
                                {user.is_banned ? (
                                  <>
                                    <Ban className="h-3 w-3" />
                                    Banni
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle2 className="h-3 w-3" />
                                    Actif
                                  </>
                                )}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right font-medium">{user.matches_count}</TableCell>
                            <TableCell className="text-right">
                              <Badge variant={user.reports_count > 0 ? 'destructive' : 'secondary'}>
                                {user.reports_count}
                              </Badge>
                            </TableCell>
                            <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">
                              {formatDate(user.created_at)}
                            </TableCell>
                            <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">
                              {formatDate(user.last_active_at)}
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <button className="p-2 rounded-lg hover:bg-muted transition-colors" aria-label="Actions">
                                    <MoreVertical className="h-4 w-4" />
                                  </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem asChild>
                                    <a href={`/admin/users/${user.id}`}>
                                      <Eye className="h-4 w-4 mr-2" />
                                      Voir le profil
                                    </a>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem asChild>
                                    <a href={`/admin/users/${user.id}/edit`}>
                                      <Edit className="h-4 w-4 mr-2" />
                                      Modifier
                                    </a>
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  {user.verification_status !== 'verified' && (
                                    <DropdownMenuItem onClick={() => {}} className="text-primary">
                                      <Shield className="h-4 w-4 mr-2" />
                                      Approuver vérification
                                    </DropdownMenuItem>
                                  )}
                                  {user.verification_status === 'verified' && (
                                    <DropdownMenuItem onClick={() => {}} className="text-destructive">
                                      <XCircle className="h-4 w-4 mr-2" />
                                      Révoquer vérification
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuSeparator />
                                  {!user.is_banned ? (
                                    <DropdownMenuItem onClick={() => handleAction(user, 'ban')} className="text-destructive">
                                      <Ban className="h-4 w-4 mr-2" />
                                      Bannir l'utilisateur
                                    </DropdownMenuItem>
                                  ) : (
                                    <DropdownMenuItem onClick={() => handleAction(user, 'unban')} className="text-green-600">
                                      <CheckCircle2 className="h-4 w-4 mr-2" />
                                      Débannir
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => handleAction(user, 'delete')} className="text-destructive">
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Supprimer le compte
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  Page {currentPage} sur {totalPages} • {totalUsers} utilisateurs au total
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => p - 1)}
                  >
                    Précédent
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(p => p + 1)}
                  >
                    Suivant
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Action Dialog */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {actionType === 'ban' ? 'Bannir l\'utilisateur' : actionType === 'unban' ? 'Débannir l\'utilisateur' : 'Supprimer le compte'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'ban'
                ? `L'utilisateur sera banni et ne pourra plus accéder à la plateforme. Indiquez la raison.`
                : actionType === 'unban'
                ? `L'utilisateur sera débanni et retrouvera l'accès à son compte.`
                : `Cette action est IRRÉVERSIBLE. Toutes les données de l'utilisateur seront supprimées définitivement.`}
            </DialogDescription>
          </DialogHeader>

          {(actionType === 'ban' || actionType === 'delete') && (
            <div className="py-4 space-y-2">
              <Label htmlFor="action_reason">Raison *</Label>
              <Textarea
                id="action_reason"
                value={actionReason}
                onChange={e => setActionReason(e.target.value)}
                placeholder={actionType === 'ban' ? 'Ex: Comportement inapproprié, spam, faux profil...' : 'Confirmez la suppression...'}
                rows={3}
                required
              />
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => { setActionDialogOpen(false); setSelectedUser(null); }}>
              Annuler
            </Button>
            <Button
              variant={actionType === 'delete' ? 'destructive' : actionType === 'ban' ? 'destructive' : 'default'}
              onClick={handleActionConfirm}
              disabled={banUser.isPending || unbanUser.isPending || deleteUser.isPending}
            >
              {banUser.isPending || unbanUser.isPending || deleteUser.isPending ? 'Traitement...' :
                actionType === 'ban' ? 'Bannir' :
                actionType === 'unban' ? 'Débannir' : 'Supprimer'}
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

function getInitials(first: string, last: string) {
  return `${first[0]}${last[0]}`.toUpperCase();
}