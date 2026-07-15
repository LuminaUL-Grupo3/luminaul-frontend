import { useState, useRef, useEffect } from 'react';
import { Search } from 'lucide-react';
import { ChatListItem } from '../components/ChatListItem';
import { ChatMessage } from '../components/ChatMessage';
import { ChatInput } from '../components/ChatInput';
import { EmptyChatState } from '../components/EmptyChatState';

interface Chat {
  id: string;
  groupName: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: {
    id: string;
    author: string;
    message: string;
    timestamp: string;
    isOwn: boolean;
  }[];
}

export function MessagesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChatId, setSelectedChatId] = useState<string | null>('1');
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [chats, setChats] = useState<Chat[]>([
    {
      id: '1',
      groupName: 'Estructuras de Datos I',
      lastMessage: 'Nos vemos mañana',
      lastMessageTime: '10:30 AM',
      unreadCount: 2,
      messages: [
        {
          id: '1',
          author: 'Lourdes Curahua',
          message: '¿Alguien resolvió el ejercicio 3?',
          timestamp: '10:25 AM',
          isOwn: false,
        },
        {
          id: '2',
          author: 'Sebastián Chapman',
          message: 'Sí, te paso la solución más tarde.',
          timestamp: '10:27 AM',
          isOwn: false,
        },
        {
          id: '3',
          author: 'Tú',
          message: 'Nos vemos mañana',
          timestamp: '10:30 AM',
          isOwn: true,
        },
      ],
    },
    {
      id: '2',
      groupName: 'Machine Learning',
      lastMessage: 'Ya subieron el dataset',
      lastMessageTime: 'Ayer',
      unreadCount: 0,
      messages: [
        {
          id: '1',
          author: 'Ana Martínez',
          message: 'Ya subieron el dataset al Drive',
          timestamp: 'Ayer',
          isOwn: false,
        },
        {
          id: '2',
          author: 'Carlos Ramírez',
          message: 'Perfecto, lo reviso hoy',
          timestamp: 'Ayer',
          isOwn: false,
        },
      ],
    },
    {
      id: '3',
      groupName: 'Programación Web',
      lastMessage: '¿Quién expone primero?',
      lastMessageTime: '2 días',
      unreadCount: 1,
      messages: [
        {
          id: '1',
          author: 'Roberto Silva',
          message: '¿Quién expone primero la próxima clase?',
          timestamp: '2 días',
          isOwn: false,
        },
      ],
    },
  ]);

  const filteredChats = chats.filter(chat =>
    chat.groupName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedChat = chats.find(chat => chat.id === selectedChatId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedChat?.messages]);

  const handleSendMessage = (message: string) => {
    if (!selectedChatId) return;

    setChats(chats.map(chat => {
      if (chat.id === selectedChatId) {
        return {
          ...chat,
          messages: [
            ...chat.messages,
            {
              id: Date.now().toString(),
              author: 'Tú',
              message,
              timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
              isOwn: true,
            },
          ],
          lastMessage: message,
          lastMessageTime: 'Ahora',
        };
      }
      return chat;
    }));

    setError(null);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setTimeout(() => {
      setError(null);
    }, 3000);
  };

  return (
    <div className="h-[calc(100vh-8rem)] max-w-[1600px] mx-auto">
      <div className="mb-4">
        <h1 className="text-3xl mb-2">Mensajes</h1>
        <p className="text-muted-foreground">Conversaciones con tus grupos de estudio</p>
      </div>

      <div className="h-[calc(100%-5rem)] grid grid-cols-12 gap-4">
        {/* Panel izquierdo - Lista de chats */}
        <div className="col-span-4 bg-white rounded-xl border border-border flex flex-col overflow-hidden">
          {/* Buscador */}
          <div className="p-4 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar conversaciones..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 pl-10 pr-4 bg-secondary rounded-lg border border-transparent focus:border-primary focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Lista de chats */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {filteredChats.length > 0 ? (
              filteredChats.map((chat) => (
                <ChatListItem
                  key={chat.id}
                  {...chat}
                  isActive={selectedChatId === chat.id}
                  onClick={() => setSelectedChatId(chat.id)}
                />
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground text-sm">No se encontraron conversaciones</p>
              </div>
            )}
          </div>
        </div>

        {/* Panel derecho - Conversación */}
        <div className="col-span-8 bg-white rounded-xl border border-border flex flex-col overflow-hidden">
          {selectedChat ? (
            <>
              {/* Header del chat */}
              <div className="p-4 border-b border-border">
                <h2 className="text-xl font-semibold">{selectedChat.groupName}</h2>
                <p className="text-sm text-muted-foreground">Chat grupal</p>
              </div>

              {/* Mensajes de error */}
              {error && (
                <div className="mx-4 mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-destructive text-sm font-medium">{error}</p>
                </div>
              )}

              {/* Área de mensajes */}
              <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-white to-secondary/20">
                {selectedChat.messages.map((msg) => (
                  <ChatMessage key={msg.id} {...msg} />
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input de mensaje */}
              <ChatInput onSendMessage={handleSendMessage} onError={handleError} />
            </>
          ) : (
            <EmptyChatState />
          )}
        </div>
      </div>
    </div>
  );
}
