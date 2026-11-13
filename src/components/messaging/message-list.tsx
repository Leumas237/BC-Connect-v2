'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/lib/hooks/use-auth';
import { useMessages, useTypingIndicator } from '@/lib/hooks/use-messages';
import { MessageBubble } from './message-bubble';
import { MessageInput } from './message-input';
import { TypingIndicator } from './typing-indicator';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface MessageListProps {
  conversationId: string;
  otherProfile: {
    id: string;
    first_name: string;
    last_name: string;
    profile_photos: { url: string; is_primary: boolean }[];
    verification_status: string;
  };
}

export function MessageList({ conversationId, otherProfile }: MessageListProps) {
  const { user } = useAuth();
  const { messages, isLoading, sendMessage, markAsRead, refetch } = useMessages(conversationId);
  const { typingUsers, setTyping } = useTypingIndicator(conversationId);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  // Mark as read when component mounts
  useEffect(() => {
    if (messages.length > 0) {
      markAsRead();
    }
  }, [messages.length, markAsRead]);

  // Handle typing indicator
  const handleInputChange = (value: string) => {
    setNewMessage(value);
    setTyping(value.length > 0);
  };

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    setTyping(false);
    await sendMessage(newMessage.trim());
    setNewMessage('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    setShowScrollButton(false);
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const isNearBottom = target.scrollHeight - target.scrollTop - target.clientHeight < 100;
    setShowScrollButton(!isNearBottom);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Messages */}
      <div
        ref={scrollAreaRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
        onScroll={handleScroll}
        role="log"
        aria-live="polite"
        aria-label="Messages"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
              <svg className="h-8 w-8 text-muted-foreground/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium">Aucun message pour l'instant</h3>
            <p className="text-muted-foreground mt-1">
              Soyez le premier à envoyer un message à {otherProfile.first_name} !
            </p>
          </div>
        ) : (
          <>
            {messages.map((message, index) => {
              const isOwn = message.sender_id === user?.id;
              const showTime = index === 0 || index === messages.length - 1 ||
                (messages[index - 1] != null &&
                  new Date(message.created_at).getTime() - new Date(messages[index - 1]!.created_at).getTime() > 5 * 60 * 1000);

              return (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isOwn={isOwn}
                  showTime={showTime}
                  showAvatar={!isOwn && (index === 0 || messages[index - 1]?.sender_id !== message.sender_id)}
                />
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}

        {/* Typing indicator */}
        {typingUsers.length > 0 && (
          <TypingIndicator users={typingUsers} />
        )}
      </div>

      {/* Scroll to bottom button */}
      {showScrollButton && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-20 left-1/2 -translate-x-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-primary/90 text-primary-foreground shadow-lg transition-opacity hover:bg-primary"
          aria-label="Aller aux nouveaux messages"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </button>
      )}

      {/* Message input */}
      <MessageInput
        value={newMessage}
        onChange={handleInputChange}
        onSend={handleSend}
        onKeyDown={handleKeyDown}
        disabled={!newMessage.trim()}
        placeholder={`Message à ${otherProfile.first_name}`}
      />
    </div>
  );
}