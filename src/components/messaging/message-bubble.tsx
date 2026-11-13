'use client';

import { cn } from '@/lib/utils/cn';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { CheckCircle2, Clock, MoreVertical, X, Share2, Download } from 'lucide-react';
import { Message } from '@/lib/hooks/use-messages';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showTime?: boolean;
  showAvatar?: boolean;
}

export function MessageBubble({ message, isOwn, showTime, showAvatar }: MessageBubbleProps) {
  const time = message.created_at
    ? formatDistanceToNow(new Date(message.created_at), { addSuffix: true, locale: fr })
    : '';

  const isRead = message.is_read;

  return (
    <div
      className={cn(
        'flex gap-2 max-w-[75%] animate-in fade-in slide-in-from-bottom-2',
        isOwn ? 'justify-end' : 'justify-start'
      )}
      role="listitem"
    >
      {/* Avatar for received messages */}
      {!isOwn && showAvatar && (
        <Avatar className="h-8 w-8 flex-shrink-0 self-end">
          <AvatarFallback className="text-xs font-medium">
            {message.sender?.first_name?.[0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>
      )}

      <div
        className={cn(
          'relative rounded-2xl px-4 py-2',
          isOwn
            ? 'rounded-tr-sm bg-primary text-primary-foreground'
            : 'rounded-tl-sm bg-muted text-muted-foreground'
        )}
      >
        {/* Message content */}
        <div className="whitespace-pre-wrap break-words">
          {message.content}
        </div>

        {/* Message type indicators */}
        {message.message_type === 'image' && (
          <div className="mt-2">
            <span className="text-xs opacity-70">📷 Photo</span>
          </div>
        )}

        {message.message_type === 'social_share' && (
          <div className="mt-2 p-2 bg-background/50 rounded-lg">
            <span className="text-xs opacity-70">🔗 Partage de contact</span>
          </div>
        )}

        {/* Time & status */}
        <div
          className={cn(
            'flex items-center justify-end gap-1 mt-1 text-[11px]',
            isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground/70'
          )}
        >
          {showTime && <span>{time}</span>}
          {isOwn && (
            <>
              {isRead ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-primary-foreground" aria-label="Lu" />
              ) : (
                <Clock className="h-3.5 w-3.5" aria-label="Envoyé" />
              )}
            </>
          )}
        </div>
      </div>

      {/* Own message dropdown */}
      {isOwn && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground/50 hover:bg-accent hover:text-accent-foreground transition-colors self-end -mr-2"
              aria-label="Options du message"
            >
              <MoreVertical className="h-4 w-4" aria-hidden="true" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Share2 className="h-4 w-4 mr-2" />
              Partager
            </DropdownMenuItem>
            {message.message_type === 'image' && (
              <DropdownMenuItem>
                <Download className="h-4 w-4 mr-2" />
                Télécharger
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive focus:text-destructive">
              <X className="h-4 w-4 mr-2" />
              Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}