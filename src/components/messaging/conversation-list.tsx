'use client';

import { useAuth } from '@/lib/hooks/use-auth';
import { useConversations } from '@/lib/hooks/use-messages';
import { ConversationItem } from './conversation-item';
import { Button } from '@/components/ui/button';
import { Loader2, MessageSquare, Plus } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export function ConversationList() {
  const { data: conversations = [], isLoading, refetch } = useConversations();
  const { user } = useAuth();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground">Chargement de vos conversations...</p>
      </div>
    );
  }

  return (
    <div className="space-y-2" role="list" aria-label="Vos conversations">
      {conversations.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[60vh] space-y-6 text-center px-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <MessageSquare className="h-10 w-10 text-muted-foreground/50" />
          </div>
          <h3 className="text-xl font-semibold">Aucune conversation</h3>
          <p className="text-muted-foreground max-w-xs">
            Quand vous avez un match, la conversation apparaît ici.
            Commencez àswiper pour trouver des personnes !
          </p>
          <Button variant="outline" asChild>
            <a href="/discover">Aller découvrir</a>
          </Button>
        </div>
      ) : (
        conversations.map((conversation) => (
          <ConversationItem
            key={conversation.id}
            conversation={conversation}
          />
        ))
      )}
    </div>
  );
}