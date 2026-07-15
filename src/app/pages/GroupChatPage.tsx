import { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router';
import { ChatMessage } from '../components/ChatMessage';
import { ChatInput } from '../components/ChatInput';
import { GroupInfo } from '../components/GroupInfo';
import { AlertCircle } from 'lucide-react';

interface Message {
  id: string;
  author: string;
  message: string;
  timestamp: string;
  isOwn: boolean;
}

export function GroupChatPage() {
  const { id } = useParams();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      author: 'Lourdes Curahua',
      message: '¡Hola a todos! Bienvenidos al grupo de estudio de Estructuras de Datos I.',
      timestamp: '10:30 AM',
      isOwn: false,
    },
    {
      id: '2',
      author: 'Sebastián Chapman',
      message: 'Hola Lourdes, gracias por crear el grupo.',
      timestamp: '10:32 AM',
      isOwn: false,
    },
    {
      id: '3',
      author: 'Lourdes Curahua',
      message: '¿Alguien resolvió el ejercicio 3 de la práctica?',
      timestamp: '10:35 AM',
      isOwn: false,
    },
    {
      id: '4',
      author: 'Sebastián Chapman',
      message: 'Sí, te paso la solución. Es un problema de árboles binarios, tienes que implementar el recorrido inorden.',
      timestamp: '10:37 AM',
      isOwn: false,
    },
    {
      id: '5',
      author: 'Gabriela Garay',
      message: '¿Podrían compartir el material de la clase de hoy? No pude asistir.',
      timestamp: '10:40 AM',
      isOwn: false,
    },
    {
      id: '6',
      author: 'Tú',
      message: 'Claro, lo subo en un momento.',
      timestamp: '10:42 AM',
      isOwn: true,
    },
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (message: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      author: 'Tú',
      message,
      timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      isOwn: true,
    };

    setMessages([...messages, newMessage]);
    setError(null);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setTimeout(() => {
      setError(null);
    }, 3000);
  };

  return (
    <div className="h-[calc(100vh-8rem)] max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
        {/* Panel de información del grupo */}
        <aside className="lg:col-span-3 h-full overflow-y-auto">
          <GroupInfo
            groupName="Estructuras de Datos I"
            memberCount={8}
            nextMeeting="Martes 7:00 PM"
          />
        </aside>

        {/* Panel de chat */}
        <div className="lg:col-span-9 flex flex-col bg-white rounded-xl border border-border overflow-hidden h-full">
          {/* Header del chat */}
          <div className="p-4 border-b border-border bg-white">
            <h1 className="text-xl font-semibold">Chat del Grupo</h1>
            <p className="text-sm text-muted-foreground">
              Comparte ideas, materiales y resuelve dudas con tus compañeros
            </p>
          </div>

          {/* Mensajes de error */}
          {error && (
            <div className="mx-4 mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-3 animate-in slide-in-from-top-2">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
              <p className="text-destructive text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Área de mensajes */}
          <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-white to-secondary/20">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} {...msg} />
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input de mensaje */}
          <ChatInput onSendMessage={handleSendMessage} onError={handleError} />
        </div>
      </div>
    </div>
  );
}
