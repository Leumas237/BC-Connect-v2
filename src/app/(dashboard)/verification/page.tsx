'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/hooks/use-auth';
import { useProfile } from '@/lib/hooks/use-profile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dropzone } from '@/components/ui/dropzone';
import { Loader2, FileText, CheckCircle2, XCircle, AlertCircle, Clock, Upload, Eye, Shield } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

const VERIFICATION_STATUS = {
  unverified: { label: 'Non vérifié', color: 'bg-gray-100 text-gray-700', icon: XCircle },
  pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  verified: { label: 'Vérifié', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  rejected: { label: 'Refusé', color: 'bg-red-100 text-red-700', icon: XCircle },
} as const;

const ACCEPTED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export default function VerificationPage() {
  const { profile: authProfile } = useAuth();
  const { data: profile, refetch } = useProfile();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const verificationStatus = authProfile?.verification_status || 'unverified';
  const statusConfig = VERIFICATION_STATUS[verificationStatus as keyof typeof VERIFICATION_STATUS] || VERIFICATION_STATUS.unverified;
  const StatusIcon = statusConfig.icon;

  const handleFileSelect = (file: File) => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error('Format non supporté. Utilisez PDF, JPG, PNG ou WebP.');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error('Le fichier est trop volumineux (max 10 Mo).');
      return;
    }
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error('Veuillez sélectionner un document');
      return;
    }

    setIsUploading(true);

    try {
      // Upload to Supabase Storage
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) throw new Error('Non authentifié');

      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `verification/${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('verification-documents')
        .upload(fileName, selectedFile);

      if (uploadError) throw uploadError;

      // Create verification document record
      const { error: dbError } = await supabase
        .from('verification_documents')
        .insert({
          profile_id: user.id,
          storage_path: fileName,
          file_name: selectedFile.name,
          file_size: selectedFile.size,
          mime_type: selectedFile.type,
          status: 'pending',
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        });

      if (dbError) throw dbError;

      // Update profile status
      await supabase
        .from('profiles')
        .update({
          verification_status: 'pending',
          verification_submitted_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      toast.success('Document soumis pour vérification !');
      handleRemoveFile();
      refetch();
    } catch (error) {
      console.error(error);
      toast.error('Erreur lors de la soumission');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Status Card */}
      <Card className={cn('border-2', verificationStatus === 'verified' && 'border-green-500', verificationStatus === 'pending' && 'border-yellow-500', verificationStatus === 'rejected' && 'border-red-500')}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                <Shield className="h-7 w-7 text-primary" />
              </div>
              <div>
                <CardTitle>Statut de vérification</CardTitle>
                <CardDescription>Badge « Étudiant vérifié » pour plus de confiance</CardDescription>
              </div>
            </div>
            <Badge variant={verificationStatus as any} className="gap-1.5 text-sm">
              <StatusIcon className="h-3 w-3" />
              {statusConfig.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {verificationStatus === 'unverified' && (
            <Alert variant="default">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Profil non vérifié</AlertTitle>
              <AlertDescription>
                Soumettez un document prouvant votre statut d'étudiant (carte étudiante, certificat de scolarité, etc.)
                pour obtenir le badge « Étudiant vérifié ». Cela augmente votre crédibilité et vos chances de match.
              </AlertDescription>
            </Alert>
          )}

          {verificationStatus === 'pending' && (
            <Alert variant="default">
              <Clock className="h-4 w-4" />
              <AlertTitle>Vérification en cours</AlertTitle>
              <AlertDescription>
                Votre document a été soumis et est en cours de vérification par notre équipe.
                Cela prend généralement 24 à 48 heures. Vous recevrez une notification dès que c'est traité.
              </AlertDescription>
            </Alert>
          )}

          {verificationStatus === 'verified' && (
            <Alert variant="success">
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>Profil vérifié !</AlertTitle>
              <AlertDescription>
                Félicitations ! Votre profil est vérifié. Le badge est visible par tous les étudiants.
                Cela augmente significativement vos chances de faire des connexions de qualité.
              </AlertDescription>
            </Alert>
          )}

          {verificationStatus === 'rejected' && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertTitle>Vérification refusée</AlertTitle>
              <AlertDescription>
                {profile?.verification_rejection_reason || 'Votre document n\'a pas pu être validé.'}
                Vous pouvez soumettre un nouveau document ci-dessous.
              </AlertDescription>
            </Alert>
          )}

          {/* Upload Form */}
          {(verificationStatus === 'unverified' || verificationStatus === 'rejected') && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Document d'identité étudiante</Label>
                <p className="text-sm text-muted-foreground">
                  Formats acceptés : PDF, JPG, PNG, WebP • Taille max : 10 Mo
                </p>

                <Dropzone
                  onFileSelect={handleFileSelect}
                  selectedFile={selectedFile}
                  previewUrl={previewUrl}
                  onRemoveFile={handleRemoveFile}
                  isDragActive={dragActive}
                  setDragActive={setDragActive}
                  acceptedTypes={ACCEPTED_TYPES}
                  maxSize={MAX_FILE_SIZE}
                />
              </div>

              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground flex items-start gap-2">
                  <Shield className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>
                    Vos documents sont stockés de manière sécurisée et ne sont accessibles qu'aux administrateurs.
                    Ils sont automatiquement supprimés après validation selon notre politique de conservation.
                  </span>
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={isUploading || !selectedFile}>
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Soumettre pour vérification
                  </>
                )}
              </Button>
            </form>
          )}

          {verificationStatus === 'verified' && (
            <div className="text-center py-4">
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
              <h3 className="font-semibold text-lg">Profil vérifié avec succès</h3>
              <p className="text-muted-foreground mt-1">
                Votre badge est visible sur votre profil et dans la découverte.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">Documents acceptés</p>
                <p className="text-sm text-muted-foreground">Carte étudiante, certificat de scolarité, attestation d'inscription</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                <Clock className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium">Délai de traitement</p>
                <p className="text-sm text-muted-foreground">24 à 48 heures ouvrées en moyenne</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                <Eye className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium">Confidentialité</p>
                <p className="text-sm text-muted-foreground">Documents visibles uniquement par les administrateurs</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
                <XCircle className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="font-medium">Si refusé</p>
                <p className="text-sm text-muted-foreground">Vous pouvez soumettre un nouveau document à tout moment</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}