'use client';

import { forwardRef, useRef, useImperativeHandle } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils/cn';
import { Send, Paperclip, Smile, Mic, Image, Hash } from 'lucide-react';

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  disabled?: boolean;
  placeholder?: string;
}

export const MessageInput = forwardRef<{ focus: () => void; clear: () => void }, MessageInputProps>(
  ({ value, onChange, onSend, onKeyDown, disabled, placeholder = 'Écrire un message...' }, ref) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useImperativeHandle(ref, () => ({
      focus: () => textareaRef.current?.focus(),
      clear: () => onChange(''),
    }));

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (value.trim() && !disabled) {
        onSend();
      }
    };

    return (
      <form onSubmit={handleSubmit} className="border-t p-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="flex items-end gap-2">
          {/* Attachment buttons */}
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-muted-foreground hover:text-foreground"
              aria-label="Joindre une image"
            >
              <Image className="h-5 w-5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-muted-foreground hover:text-foreground"
              aria-label="Partager un contact"
            >
              <Hash className="h-5 w-5" />
            </Button>
          </div>

          {/* Textarea */}
          <div className="flex-1">
            <Textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              className="min-h-[44px] max-h-[120px] resize-none pr-10"
              rows={1}
              aria-label="Message"
            />
          </div>

          {/* Send button */}
          <Button
            type="submit"
            size="icon"
            className="h-9 w-9 rounded-full bg-primary text-primary-foreground"
            disabled={disabled || !value.trim()}
            aria-label="Envoyer"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center mt-2">
          Appuyez sur Entrée pour envoyer • Maj+Entrée pour nouvelle ligne
        </p>
      </form>
    );
  }
);
MessageInput.displayName = 'MessageInput';