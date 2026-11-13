'use client';

import { useParams } from 'next/navigation';
import { useAuth } from '@/lib/hooks/use-auth';
import { useConversation, useMessages, useSendMessage, useTypingIndicator } from '@/lib/hooks/use-messages';
import { MessageList } from '@/components/messaging/message-list';
import { MessageInput } from '@/components/messaging/message-input';
import { Loader2, ArrowLeft, MoreVertical, Share2, UserCheck, Flag, X, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { cn } from '@/lib/utils/cn';
import { useState } from 'react';
import Link from 'next/link';

export default function ConversationPage() {
  const params = useParams();
  const conversationId = params['conversationId'] as string;
  const { user, profile } = useAuth();
  const [showProfile, setShowProfile] = useState(false);
  const [showReport, setShowReport] = useState(false);

  const { conversation, isLoading: convLoading } = useConversation(conversationId);
  const { messages, isLoading, sendMessage, markAsRead } = useMessages(conversationId);
  const { typingUsers, setTyping } = useTypingIndicator(conversationId);

  const otherProfile = conversation?.other_profile;
  const primaryPhoto = otherProfile?.profile_photos?.find(p => p.is_primary)?.url ?? otherProfile?.profile_photos?.[0]?.url;

  if (!user) return null;

  if (convLoading || isLoading) {
    return (
      <div className="flex flex-col h-[calc(100vh-200px)] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground mt-2">Chargement de la conversation...</p>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] space-y-4 text-center">
        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
          <Loader2 className="h-8 w-8 text-muted-foreground/50" />
        </div>
        <h2 className="text-xl font-semibold">Conversation introuvable</h2>
        <p className="text-muted-foreground">Cette conversation n'existe plus ou a été supprimée.</p>
        <Link href="/messages">
          <Button>Retour aux messages</Button>
        </Link>
      </div>
    );
  }

  const handleSend = async (content: string) => {
    await sendMessage(content);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      // Send handled by MessageInput
    }
  };

  const handleInputChange = (value: string) => {
    setTyping(value.length > 0);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)]">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur sticky top-0 z-10">
        <Link href="/messages" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>

        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Link href={`/profile/${otherProfile?.id}`} className="relative flex-shrink-0">
            <Avatar className="h-10 w-10">
              <AvatarImage src={primaryPhoto} alt={otherProfile?.first_name} />
              <AvatarFallback className="text-sm font-bold text-primary">
                {otherProfile?.first_name?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {otherProfile?.verification_status === 'verified' && (
              <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-verified text-verified-foreground">
                <UserCheck className="h-3 w-3" />
              </span>
            )}
          </Link>
          <div className="min-w-0">
            <Link href={`/profile/${otherProfile?.id}`} className="font-semibold truncate block hover:text-primary transition-colors">
              {otherProfile?.first_name} {otherProfile?.last_name}
            </Link>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {typingUsers.length > 0 && (
                <span className="flex items-center gap-1 text-primary">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" />
                  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                  En train d'écrire...
                </span>
              )}
              {!typingUsers.length && otherProfile?.is_online && (
                <span className="flex items-center gap-1 text-success">
                  <span className="h-1.5 w-1.5 rounded-full bg-success" />
                  En ligne
                </span>
              )}
            </div>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/profile/${otherProfile?.id}`}>
                <Shield className="h-4 w-4 mr-2" />
                Voir le profil
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setShowProfile(true)}>
              <Share2 className="h-4 w-4 mr-2" />
              Voir les réseaux partagés
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setShowReport(true)} className="text-destructive focus:text-destructive">
              <Flag className="h-4 w-4 mr-2" />
              Signaler
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive focus:text-destructive">
              <X className="h-4 w-4 mr-2" />
              Bloquer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* Messages */}
      <MessageList
        conversationId={conversationId}
        otherProfile={{
          id: otherProfile?.id || '',
          first_name: otherProfile?.first_name || '',
          last_name: otherProfile?.last_name || '',
          profile_photos: otherProfile?.profile_photos || [],
          verification_status: otherProfile?.verification_status || 'unverified',
        }}
      />

      {/* Shared Social Dialog */}
      <Dialog open={showProfile} onOpenChange={setShowProfile}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Réseaux partagés par {otherProfile?.first_name}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-4">
              {otherProfile?.first_name} n'a pas encore partagé ses réseaux sociaux avec vous.
              Cela se débloque automatiquement quand vous choisissez de partager les vôtres.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowProfile(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Report Dialog */}
      <Dialog open={showReport} onOpenChange={setShowReport}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Signaler {otherProfile?.first_name}</DialogTitle>
          </DialogHeader>
          <form className="py-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Raison du signalement</label>
              <select className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="inappropriate_content">Contenu inapproprié</option>
                <option value="harassment">Harcèlement</option>
                <option value="spam">Spam</option>
                <option value="fake_profile">Faux profil</option>
                <option value="other">Autre</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Détails (optionnel)</label>
              <textarea className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring min-h-[80px] resize-y" placeholder="Décrivez la situation..." />
            </div>
          </form>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReport(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={() => { setShowReport(false); /* submit report */ }}>
              Envoyer le signalement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}