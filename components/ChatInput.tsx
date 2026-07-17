import { useState } from 'react';
import { Send, Paperclip, Smile } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onError: (error: string) => void;
}

export function ChatInput({ onSendMessage, onError }: ChatInputProps) {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();

    const trimmed = message.trim();
    if (!trimmed) {
      onError('No puede enviar un mensaje vacío');
      return;
    }

    onSendMessage(trimmed);
    setMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t border-border p-4 bg-white">
      <div className="flex items-end gap-3">
        <button
          type="button"
          className="p-2 hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-foreground"
        >
          <Paperclip className="w-5 h-5" />
        </button>

        <button
          type="button"
          className="p-2 hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-foreground"
        >
          <Smile className="w-5 h-5" />
        </button>

        <div className="flex-1 relative">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Escribe un mensaje..."
            rows={1}
            className="w-full px-4 py-3 bg-secondary border border-transparent rounded-lg focus:border-primary focus:outline-none resize-none max-h-32"
          />
        </div>

        <button
          type="submit"
          className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 font-medium"
        >
          <Send className="w-5 h-5" />
          <span>Enviar</span>
        </button>
      </div>
    </form>
  );
}
