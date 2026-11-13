'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/use-auth';
import { useProfile, useUpdateProfile, useProfilePhotos, useUploadPhoto, useDeletePhoto, useSetPrimaryPhoto, useInterests, useProfileInterests, useUpdateInterests, useIntentions, useUpdateIntentions } from '@/lib/hooks/use-profile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils/cn';
import { Camera, X, CheckCircle2, MapPin, GraduationCap, BookOpen, Heart, Users, Briefcase, Edit, Trash2, Star, Upload, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Interest } from '@/lib/hooks/use-profile';

const INTENTION_OPTIONS = [
  { value: 'dating', label: 'Dating', icon: Heart, color: 'bg-primary/10 text-primary' },
  { value: 'friendship', label: 'Amitié', icon: Users, color: 'bg-secondary/10 text-secondary' },
  { value: 'networking', label: 'Networking', icon: Briefcase, color: 'bg-accent/10 text-accent' },
] as const;

export default function ProfilePage() {
  const { profile: authProfile, user } = useAuth();
  const { data: profile, isLoading: profileLoading, refetch } = useProfile();
  const { data: photos = [] as import('@/lib/supabase/types').ProfilePhoto[], isLoading: photosLoading } = useProfilePhotos(user?.id);
  const { data: allInterests = [], isLoading: interestsLoading } = useInterests();
  const { data: myInterestIds = [], isLoading: myInterestsLoading } = useProfileInterests(user?.id);
  const { data: myIntentions = [], isLoading: intentionsLoading } = useIntentions(user?.id);

  const updateProfileMutation = useUpdateProfile();
  const uploadPhotoMutation = useUploadPhoto();
  const deletePhotoMutation = useDeletePhoto();
  const setPrimaryPhotoMutation = useSetPrimaryPhoto();
  const updateInterestsMutation = useUpdateInterests();
  const updateIntentionsMutation = useUpdateIntentions();

  const [activeTab, setActiveTab] = useState<string>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<{
    first_name: string;
    last_name: string;
    bio: string;
    city: string;
    min_age_preference: number;
    max_age_preference: number;
    max_distance_km: number;
    preferred_genders: string[];
    interests: string[];
    intentions: ('dating' | 'friendship' | 'networking')[];
  }>({
    first_name: '',
    last_name: '',
    bio: '',
    city: '',
    min_age_preference: 18,
    max_age_preference: 30,
    max_distance_km: 50,
    preferred_genders: ['male', 'female', 'non_binary'] as string[],
    interests: [] as string[],
    intentions: [] as ('dating' | 'friendship' | 'networking')[],
  });

  const [photoDialogOpen, setPhotoDialogOpen] = useState(false);
  const [selectedPhotoFile, setSelectedPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Initialize form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        first_name: profile.first_name,
        last_name: profile.last_name,
        bio: profile.bio || '',
        city: profile.city || '',
        min_age_preference: profile.min_age_preference,
        max_age_preference: profile.max_age_preference,
        max_distance_km: profile.max_distance_km,
        preferred_genders: profile.preferred_genders,
        interests: myInterestIds,
        intentions: myIntentions,
      });
    }
  }, [profile, myInterestIds]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfileMutation.mutateAsync(formData);
      toast.success('Profil mis à jour');
      setIsEditing(false);
      refetch();
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handlePhotoSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('L\'image doit faire moins de 5 Mo');
      return;
    }
    setSelectedPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setPhotoDialogOpen(true);
  };

  const handlePhotoUpload = async () => {
    if (!selectedPhotoFile) return;
    try {
      await uploadPhotoMutation.mutateAsync(selectedPhotoFile);
      toast.success('Photo ajoutée');
      setPhotoDialogOpen(false);
      setSelectedPhotoFile(null);
      setPhotoPreview(null);
      refetch();
    } catch (error) {
      toast.error('Erreur lors de l\'upload');
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (confirm('Supprimer cette photo ?')) {
      try {
        await deletePhotoMutation.mutateAsync(photoId);
        toast.success('Photo supprimée');
        refetch();
      } catch (error) {
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const handleSetPrimary = async (photoId: string) => {
    try {
      await setPrimaryPhotoMutation.mutateAsync(photoId);
      toast.success('Photo de profil mise à jour');
      refetch();
    } catch (error) {
      toast.error('Erreur');
    }
  };

  const handleInterestToggle = (interestId: string) => {
    const newIds = myInterestIds.includes(interestId)
      ? myInterestIds.filter(id => id !== interestId)
      : [...myInterestIds, interestId];
    setFormData(prev => ({ ...prev, interests: newIds }));
  };

  const handleInterestsSubmit = async () => {
    try {
      await updateInterestsMutation.mutateAsync(formData['interests'] || []);
      toast.success('Centres d\'intérêt mis à jour');
    } catch (error) {
      toast.error('Erreur');
    }
  };

  const handleIntentionToggle = (intention: 'dating' | 'friendship' | 'networking') => {
    const newIntentions = myIntentions.includes(intention)
      ? myIntentions.filter(i => i !== intention)
      : [...myIntentions, intention];
    setFormData(prev => ({ ...prev, intentions: newIntentions }));
  };

  const handleIntentionsSubmit = async () => {
    try {
      await updateIntentionsMutation.mutateAsync(formData.intentions || []);
      toast.success('Intentions mises à jour');
    } catch (error) {
      toast.error('Erreur');
    }
  };

  if (!user) return null;

  const primaryPhoto = photos.find(p => p.is_primary)?.url ?? photos[0]?.url;
  const age = authProfile?.date_of_birth
    ? new Date().getFullYear() - new Date(authProfile.date_of_birth).getFullYear()
    : null;

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="card-profile overflow-hidden">
        <div className="relative h-48 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20" />

        <div className="px-6 pb-6 -mt-12 flex items-end justify-between">
          <div className="flex items-end gap-4">
            <div className="relative">
              <Avatar className="h-24 w-24 border-4 border-background">
                <AvatarImage src={primaryPhoto} alt={authProfile?.first_name} />
                <AvatarFallback className="text-3xl font-bold text-primary">
                  {authProfile?.first_name?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {authProfile?.verification_status === 'verified' && (
                <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-verified text-verified-foreground">
                  <CheckCircle2 className="h-4 w-4" />
                </span>
              )}
            </div>
            <div>
              <div className="flex items-baseline gap-3">
                <h1 className="font-display text-3xl font-bold">
                  {authProfile?.first_name} {authProfile?.last_name}
                  {age && <span className="text-muted-foreground font-normal text-xl">{age}</span>}
                </h1>
                {authProfile?.verification_status === 'verified' && (
                  <Badge variant="verified" className="gap-1.5">
                    <CheckCircle2 className="h-3 w-3" />
                    Vérifié
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground">
                {authProfile?.academic_programs?.name}
                {authProfile?.academic_levels?.name && ` • ${authProfile.academic_levels.name}`}
                {authProfile?.city && ` • ${authProfile.city}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Modifier
            </Button>
            <Button>
              <Camera className="h-4 w-4 mr-2" />
              Photo
            </Button>
          </div>
        </div>
      </div>

      {/* Bio */}
      {authProfile?.bio && (
        <div className="card-profile p-6">
          <p className="text-foreground whitespace-pre-wrap">{authProfile.bio}</p>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Profil</TabsTrigger>
          <TabsTrigger value="photos">Photos ({photos.length}/6)</TabsTrigger>
          <TabsTrigger value="interests">Centres d'intérêt ({myInterestIds.length})</TabsTrigger>
          <TabsTrigger value="intentions">Intentions</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="first_name">Prénom *</Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={e => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Nom *</Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={e => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Biographie</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={e => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Parlez de vous..."
                  maxLength={500}
                />
                <p className="text-sm text-muted-foreground text-right">
                  {formData.bio.length}/500
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">Ville</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={e => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="Votre ville"
                />
              </div>

              <Separator />

              <h3 className="font-semibold">Préférences de recherche</h3>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="min_age_preference">Âge minimum</Label>
                  <Input
                    id="min_age_preference"
                    type="number"
                    min="18"
                    max="60"
                    value={formData.min_age_preference}
                    onChange={e => setFormData(prev => ({ ...prev, min_age_preference: parseInt(e.target.value) }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max_age_preference">Âge maximum</Label>
                  <Input
                    id="max_age_preference"
                    type="number"
                    min="18"
                    max="60"
                    value={formData.max_age_preference}
                    onChange={e => setFormData(prev => ({ ...prev, max_age_preference: parseInt(e.target.value) }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max_distance_km">Distance max (km)</Label>
                  <Input
                    id="max_distance_km"
                    type="number"
                    min="5"
                    max="200"
                    value={formData.max_distance_km}
                    onChange={e => setFormData(prev => ({ ...prev, max_distance_km: parseInt(e.target.value) }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Genres recherchés</Label>
                <div className="flex flex-wrap gap-3">
                  {['male', 'female', 'non_binary'].map(gender => (
                    <label
                      key={gender}
                      className={cn(
                        'flex items-center gap-2 rounded-lg border p-3 text-sm cursor-pointer transition-colors',
                        formData.preferred_genders.includes(gender)
                          ? 'border-primary/50 bg-primary/5 text-primary'
                          : 'border-border hover:bg-accent'
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={formData.preferred_genders.includes(gender)}
                        onChange={e => {
                          const newGenders = e.target.checked
                            ? [...formData.preferred_genders, gender]
                            : formData.preferred_genders.filter(g => g !== gender);
                          setFormData(prev => ({ ...prev, preferred_genders: newGenders }));
                        }}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span>{gender === 'male' ? 'Hommes' : gender === 'female' ? 'Femmes' : 'Non-binaires'}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => { setIsEditing(false); refetch(); }}>
                  Annuler
                </Button>
                <Button type="submit" disabled={updateProfileMutation.isPending}>
                  {updateProfileMutation.isPending ? 'Sauvegarde...' : 'Sauvegarder'}
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Prénom</p>
                  <p className="font-medium">{authProfile?.first_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Nom</p>
                  <p className="font-medium">{authProfile?.last_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Âge</p>
                  <p className="font-medium">{age} ans</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Genre</p>
                  <p className="font-medium capitalize">{authProfile?.gender}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-muted-foreground">Ville</p>
                  <p className="font-medium flex items-center gap-1">
                    <MapPin className="h-4 w-4" /> {authProfile?.city || 'Non renseignée'}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-muted-foreground">Filière</p>
                  <p className="font-medium flex items-center gap-1">
                    <GraduationCap className="h-4 w-4" /> {authProfile?.academic_programs?.name}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-muted-foreground">Niveau</p>
                  <p className="font-medium flex items-center gap-1">
                    <BookOpen className="h-4 w-4" /> {authProfile?.academic_levels?.name}
                  </p>
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-sm text-muted-foreground mb-2">Préférences de recherche</p>
                <div className="grid gap-2 md:grid-cols-3 text-sm">
                  <span>Âge : {authProfile?.min_age_preference} - {authProfile?.max_age_preference} ans</span>
                  <span>Distance : {authProfile?.max_distance_km} km max</span>
                  <span>
                    Genres : {authProfile?.preferred_genders?.map((g: string) => g === 'male' ? 'H' : g === 'female' ? 'F' : 'NB').join(', ')}
                  </span>
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Photos Tab */}
        <TabsContent value="photos" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Mes photos ({photos.length}/6)</h3>
            <Button onClick={() => handlePhotoSelect(new File([], ''))} disabled>
              <Upload className="h-4 w-4 mr-2" />
              Ajouter une photo
            </Button>
          </div>

          {photosLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : photos.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-xl">
              <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">Aucune photo pour le moment</p>
              <Button variant="outline" onClick={() => setPhotoDialogOpen(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Ajouter ma première photo
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {photos.map((photo) => (
                <div key={photo.id} className="relative aspect-square rounded-xl overflow-hidden group">
                  <img
                    src={photo.url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  {photo.is_primary && (
                    <div className="absolute top-2 left-2">
                      <Badge variant="success" className="gap-1">
                        <Star className="h-3 w-3" />
                        Profil
                      </Badge>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    {!photo.is_primary && (
                      <Button variant="secondary" size="icon" onClick={() => handleSetPrimary(photo.id)}>
                        <Star className="h-4 w-4" />
                      </Button>
                    )}
                    <Button variant="secondary" size="icon" onClick={() => handleDeletePhoto(photo.id)} className="text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  {photo.moderation_status === 'pending' && (
                    <div className="absolute bottom-2 left-2 right-2">
                      <Badge variant="pending" className="w-full justify-center">En modération</Badge>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {photos.length < 6 && (
            <Button
              variant="outline"
              className="w-full aspect-square grid place-items-center gap-2 rounded-xl border-2 border-dashed"
              onClick={() => setPhotoDialogOpen(true)}
              disabled={uploadPhotoMutation.isPending}
            >
              <Upload className="h-8 w-8 text-muted-foreground" />
              <span className="text-muted-foreground">Ajouter une photo</span>
            </Button>
          )}
        </TabsContent>

        {/* Interests Tab */}
        <TabsContent value="interests" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Mes centres d'intérêt ({myInterestIds.length})</h3>
            <Button onClick={handleInterestsSubmit} disabled={updateInterestsMutation.isPending}>
              {updateInterestsMutation.isPending ? 'Sauvegarde...' : 'Sauvegarder'}
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {allInterests.map((interest: Interest) => {
              const isSelected = myInterestIds.includes(interest.id);
              return (
                <Button
                  key={interest.id}
                  variant={isSelected ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleInterestToggle(interest.id)}
                  className="h-auto px-3 py-2"
                >
                  {interest.name}
                </Button>
              );
            })}
          </div>

          {myInterestIds.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              Aucun centre d'intérêt sélectionné. Cliquez sur ceux qui vous correspondent.
            </p>
          )}
        </TabsContent>

        {/* Intentions Tab */}
        <TabsContent value="intentions" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Mes intentions</h3>
            <Button onClick={handleIntentionsSubmit} disabled={updateIntentionsMutation.isPending}>
              {updateIntentionsMutation.isPending ? 'Sauvegarde...' : 'Sauvegarder'}
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {INTENTION_OPTIONS.map(({ value, label, icon: Icon, color }) => {
              const isSelected = myIntentions.includes(value);
              return (
                <Button
                  key={value}
                  variant={isSelected ? 'default' : 'outline'}
                  className={cn(
                    'h-32 flex-flex-col gap-3',
                    isSelected && color
                  )}
                  onClick={() => handleIntentionToggle(value)}
                >
                  <Icon className="h-8 w-8 mx-auto" />
                  <span className="font-medium">{label}</span>
                  {isSelected && <CheckCircle2 className="h-5 w-5 mx-auto" />}
                </Button>
              );
            })}
          </div>

          <p className="text-sm text-muted-foreground text-center">
            Sélectionnez une ou plusieurs intentions. Elles seront visibles sur votre profil.
          </p>
        </TabsContent>
      </Tabs>

      {/* Photo Upload Dialog */}
      <Dialog open={photoDialogOpen} onOpenChange={setPhotoDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Ajouter une photo</DialogTitle>
            <DialogDescription>
              Formats acceptés : JPG, PNG, WebP. Taille max : 5 Mo.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {photoPreview ? (
              <div className="relative aspect-square rounded-xl overflow-hidden mb-4">
                <img src={photoPreview} alt="Aperçu" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div
                className="relative aspect-square rounded-xl border-2 border-dashed border-muted bg-muted/50 flex flex-col items-center justify-center gap-2 mb-4 cursor-pointer"
                onClick={() => document.getElementById('photo-input')?.click()}
              >
                <Upload className="h-12 w-12 text-muted-foreground" />
                <span className="text-muted-foreground">Cliquez pour choisir une photo</span>
                <input
                  id="photo-input"
                  type="file"
                  accept="image/*"
              onChange={e => e.target.files?.[0] && handlePhotoSelect(e.target.files[0])}
                  className="hidden"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setPhotoDialogOpen(false); setSelectedPhotoFile(null); setPhotoPreview(null); }}>
              Annuler
            </Button>
            <Button onClick={handlePhotoUpload} disabled={uploadPhotoMutation.isPending || !selectedPhotoFile}>
              {uploadPhotoMutation.isPending ? 'Upload...' : 'Ajouter la photo'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}