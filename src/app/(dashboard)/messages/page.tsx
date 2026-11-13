'use client';

import { ConversationList } from '@/components/messaging/conversation-list';

export default function MessagesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Messages</h1>
        <p className="text-muted-foreground text-sm">
          Vos conversations avec vos matchs
        </p>
      </div>
      <ConversationList />
    </div>
  );
}