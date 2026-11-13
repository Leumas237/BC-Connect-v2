'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Heart, Loader2, AlertCircle, CheckCircle2, Mail, Lock, User, Calendar, MapPin, GraduationCap, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { toast } from 'sonner';

const GENDER_OPTIONS = [
  { value: 'male', label: 'Homme' },
  { value: 'female', label: 'Femme' },
  { value: 'non_binary', label: 'Non-binaire' },
  { value: 'prefer_not_to_say', label: 'Préfère ne pas dire' },
] as const;

const INSTITUTIONS = [
  { value: 'iut-fv-bandjoun', label: 'IUT Fotso Victor de Bandjoun' },
] as const;

export default function RegisterPage() {
  const router = useRouter();
  const { signUp } = useAuth();

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirm_password: '',
    date_of_birth: '',
    gender: 'male' as const,
    institution: 'iut-fv-bandjoun',
    terms_accepted: false,
    privacy_accepted: false,
  });

  const validateStep = (currentStep: number) => {
    const newErrors: Record<string, string> = {};

    if (currentStep >= 1) {
      if (!formData['first_name'].trim()) newErrors['first_name'] = 'Le prénom est requis';
      if (!formData['last_name'].trim()) newErrors['last_name'] = 'Le nom est requis';
      if (!formData['email'].trim()) {
        newErrors['email'] = 'L\'email est requis';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData['email'])) {
        newErrors['email'] = 'Format d\'email invalide';
      }
      if (!formData['date_of_birth']) {
        newErrors['date_of_birth'] = 'La date de naissance est requise';
      } else {
        const birthDate = new Date(formData['date_of_birth']);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          if (age - 1 < 18) newErrors['date_of_birth'] = 'Vous devez avoir au moins 18 ans';
        } else if (age < 18) {
          newErrors['date_of_birth'] = 'Vous devez avoir au moins 18 ans';
        }
      }
      if (!formData['gender']) newErrors['gender'] = 'Le genre est requis';
    }

    if (currentStep >= 2) {
      if (!formData['password']) {
        newErrors['password'] = 'Le mot de passe est requis';
      } else if (formData['password'].length < 8) {
        newErrors['password'] = 'Le mot de passe doit contenir au moins 8 caractères';
      } else if (!/[A-Z]/.test(formData['password'])) {
        newErrors['password'] = 'Le mot de passe doit contenir au moins une majuscule';
      } else if (!/[a-z]/.test(formData['password'])) {
        newErrors['password'] = 'Le mot de passe doit contenir au moins une minuscule';
      } else if (!/[0-9]/.test(formData['password'])) {
        newErrors['password'] = 'Le mot de passe doit contenir au moins un chiffre';
      }

      if (formData['password'] !== formData['confirm_password']) {
        newErrors['confirm_password'] = 'Les mots de passe ne correspondent pas';
      }
    }

    if (currentStep >= 3) {
      if (!formData.terms_accepted) newErrors['terms_accepted'] = 'Vous devez accepter les conditions';
      if (!formData.privacy_accepted) newErrors['privacy_accepted'] = 'Vous devez accepter la politique de confidentialité';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep(3)) return;

    setIsLoading(true);

    try {
      const { error } = await signUp(formData['email'], formData['password'], {
        first_name: formData['first_name'],
        last_name: formData['last_name'],
        date_of_birth: formData['date_of_birth'],
        gender: formData['gender'],
        institution: formData['institution'],
      });

      if (error) {
        if (error.message.includes('User already registered')) {
          setErrors({ email: 'Cet email est déjà utilisé' });
        } else {
          setErrors({ form: error.message });
        }
      } else {
        toast.success('Compte créé ! Vérifiez votre email pour confirmer votre inscription.');
        router.push('/login');
      }
    } catch (error) {
      setErrors({ form: 'Une erreur est survenue. Veuillez réessayer.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const steps = [
    { number: 1, title: 'Informations', description: 'Vos informations personnelles' },
    { number: 2, title: 'Sécurité', description: 'Créez votre mot de passe' },
    { number: 3, title: 'Validation', description: 'Acceptez les conditions' },
  ];

  return (
    <Card className="w-full">
      {/* Progress Steps */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          {steps.map((s, i) => (
            <React.Fragment key={s.number}>
              <div className="flex flex-col items-center">
                <div className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition-colors',
                  step > s.number
                    ? 'bg-primary text-primary-foreground'
                    : step === s.number
                    ? 'bg-primary/10 text-primary ring-2 ring-primary'
                    : 'bg-muted text-muted-foreground'
                )}>
                  {step > s.number ? <CheckCircle2 className="h-5 w-5" /> : s.number}
                </div>
                <span className={cn('text-xs mt-1', step >= s.number ? 'text-foreground' : 'text-muted-foreground')}>
                  {s.title}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className={cn(
                  'flex-1 h-1 mx-2 rounded',
                  step > s.number + 1 ? 'bg-primary' : 'bg-muted'
                )} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <CardHeader className="px-6 pt-6 pb-2">
        <CardTitle className="text-xl">{steps[step - 1]?.title}</CardTitle>
        <CardDescription>{steps[step - 1]?.description}</CardDescription>
      </CardHeader>

      <CardContent className="px-6 pb-2">
        <form onSubmit={handleSubmit} className="space-y-4">
          {errors['form'] && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              <AlertCircle className="h-4 w-4" />
              {errors['form']}
            </div>
          )}

          {/* Step 1: Personal Info */}
          {step >= 1 && (
            <div className="space-y-4" data-step="1">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="first_name">Prénom *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="first_name"
                      value={formData['first_name']}
                      onChange={e => handleChange('first_name', e.target.value)}
                      placeholder="Votre prénom"
                      className={cn('pl-10', errors['first_name'] && 'border-destructive focus:ring-destructive')}
                      disabled={isLoading}
                    />
                  </div>
                  {errors['first_name'] && <p className="text-sm text-destructive">{errors['first_name']}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Nom *</Label>
                  <Input
                    id="last_name"
                    value={formData['last_name']}
                    onChange={e => handleChange('last_name', e.target.value)}
                    placeholder="Votre nom"
                    className={cn(errors['last_name'] && 'border-destructive focus:ring-destructive')}
                    disabled={isLoading}
                  />
                  {errors['last_name'] && <p className="text-sm text-destructive">{errors['last_name']}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={formData['email']}
                    onChange={e => handleChange('email', e.target.value)}
                    placeholder="vous@exemple.com"
                    className={cn('pl-10', errors['email'] && 'border-destructive focus:ring-destructive')}
                    disabled={isLoading}
                  />
                </div>
                {errors['email'] && <p className="text-sm text-destructive">{errors['email']}</p>}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="date_of_birth">Date de naissance *</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="date_of_birth"
                      type="date"
                      value={formData['date_of_birth']}
                      onChange={e => handleChange('date_of_birth', e.target.value)}
                      max={new Date(Date.now() - 18 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                      className={cn('pl-10', errors['date_of_birth'] && 'border-destructive focus:ring-destructive')}
                      disabled={isLoading}
                    />
                  </div>
                  {errors['date_of_birth'] && <p className="text-sm text-destructive">{errors['date_of_birth']}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Genre *</Label>
                  <Select value={formData['gender']} onValueChange={v => handleChange('gender', v)}>
                    <SelectTrigger className={cn(errors['gender'] && 'border-destructive focus:ring-destructive')}>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      {GENDER_OPTIONS.map(g => (
                        <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors['gender'] && <p className="text-sm text-destructive">{errors['gender']}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="institution">Établissement *</Label>
                <Select value={formData['institution']} onValueChange={v => handleChange('institution', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner votre établissement" />
                  </SelectTrigger>
                  <SelectContent>
                    {INSTITUTIONS.map(i => (
                      <SelectItem key={i.value} value={i.value}>{i.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Step 2: Password */}
          {step >= 2 && (
            <div className="space-y-4" data-step="2">
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData['password']}
                    onChange={e => handleChange('password', e.target.value)}
                    placeholder="••••••••"
                    className={cn('pl-10 pr-10', errors['password'] && 'border-destructive focus:ring-destructive')}
                    disabled={isLoading}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors['password'] && <p className="text-sm text-destructive">{errors['password']}</p>}
                <p className="text-xs text-muted-foreground">
                  Minimum 8 caractères, une majuscule, une minuscule, un chiffre
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm_password">Confirmer le mot de passe *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="confirm_password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData['confirm_password']}
                    onChange={e => handleChange('confirm_password', e.target.value)}
                    placeholder="••••••••"
                    className={cn('pl-10 pr-10', errors['confirm_password'] && 'border-destructive focus:ring-destructive')}
                    disabled={isLoading}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors['confirm_password'] && <p className="text-sm text-destructive">{errors['confirm_password']}</p>}
              </div>
            </div>
          )}

          {/* Step 3: Terms */}
          {step >= 3 && (
            <div className="space-y-4" data-step="3">
              <div className="space-y-2">
                <Label className="flex items-start gap-2 cursor-pointer">
                  <Checkbox
                    checked={formData.terms_accepted}
                    onCheckedChange={checked => handleChange('terms_accepted', checked)}
                    className={cn(errors['terms_accepted'] && 'border-destructive focus:ring-destructive')}
                  />
                  <span className="text-sm">
                    J\'accepte les <Link href="/terms" className="text-primary hover:underline">Conditions d\'utilisation</Link> *
                  </span>
                </Label>
                {errors['terms_accepted'] && <p className="text-sm text-destructive ml-6">{errors['terms_accepted']}</p>}
              </div>

              <div className="space-y-2">
                <Label className="flex items-start gap-2 cursor-pointer">
                  <Checkbox
                    checked={formData.privacy_accepted}
                    onCheckedChange={checked => handleChange('privacy_accepted', checked)}
                    className={cn(errors['privacy_accepted'] && 'border-destructive focus:ring-destructive')}
                  />
                  <span className="text-sm">
                    J\'accepte la <Link href="/privacy" className="text-primary hover:underline">Politique de confidentialité</Link> *
                  </span>
                </Label>
                {errors['privacy_accepted'] && <p className="text-sm text-destructive ml-6">{errors['privacy_accepted']}</p>}
              </div>

              <div className="p-4 rounded-lg bg-muted/50 text-sm text-muted-foreground">
                <p>En créant votre compte, vous confirmez avoir 18 ans ou plus.</p>
                <p className="mt-2">Votre profil sera soumis à vérification étudiante après inscription.</p>
              </div>
            </div>
          )}
        </form>
      </CardContent>

      <CardFooter className="px-6 pb-6 flex flex-col gap-3">
        {step < 3 && (
          <Button
            type="button"
            variant="outline"
            onClick={() => { validateStep(step); if (Object.keys(errors).length === 0) setStep(s => s + 1); }}
            className="w-full"
            disabled={isLoading}
          >
            Étape suivante
            <span className="ml-2">→</span>
          </Button>
        )}

        {step > 1 && step < 3 && (
          <Button
            type="button"
            variant="ghost"
            onClick={() => setStep(s => s - 1)}
            className="w-full"
            disabled={isLoading}
          >
            ← Retour
          </Button>
        )}

        {step === 3 && (
          <Button
            type="submit"
            form="register-form"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Création du compte...
              </>
            ) : (
              'Créer mon compte'
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}