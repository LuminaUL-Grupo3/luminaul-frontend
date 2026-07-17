import { MessageSquare } from 'lucide-react';

interface ChatListItemProps {
  id: string;
  groupName: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isActive: boolean;
  onClick: () => void;
}

export function ChatListItem({
  groupName,
  lastMessage,
  lastMessageTime,
  unreadCount,
  isActive,
  onClick,
}: ChatListItemProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full p-4 rounded-lg transition-all text-left border-2 ${
        isActive
          ? 'bg-primary/10 border-primary'
          : 'bg-white border-transparent hover:bg-secondary'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
          isActive ? 'bg-primary' : 'bg-primary/10'
        }`}>
          <MessageSquare className={`w-6 h-6 ${isActive ? 'text-white' : 'text-primary'}`} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-1">
            <h3 className={`font-semibold truncate ${isActive ? 'text-primary' : 'text-foreground'}`}>
              {groupName}
            </h3>
            <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
              {lastMessageTime}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <p className="text-sm text-muted-foreground truncate">
              {lastMessage}
            </p>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 bg-primary text-primary-foreground rounded-full text-xs font-medium flex-shrink-0">
                {unreadCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}
