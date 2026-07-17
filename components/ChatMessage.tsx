import { useState, useRef, useEffect } from 'react';
import { User, MoreVertical, Flag } from 'lucide-react';
import { ReportContentModal } from './ReportContentModal';
import { Toast } from './Toast';

interface ChatMessageProps {
  author: string;
  message: string;
  timestamp: string;
  isOwn?: boolean;
}

export function ChatMessage({ author, message, timestamp, isOwn = false }: ChatMessageProps) {
  const [menuOpen, setMenuOpen]   = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [reported, setReported]   = useState(false);
  const [showToast, setShowToast] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleConfirmReport = () => {
    setShowModal(false);
    setReported(true);
    setShowToast(true);
  };

  return (
    <>
      <div
        className={`flex gap-3 mb-4 group ${isOwn ? 'flex-row-reverse' : ''}`}
        onMouseLeave={() => setMenuOpen(false)}
      >
        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 self-start">
          <User className="w-5 h-5 text-primary" />
        </div>

        <div className={`flex-1 max-w-[70%] ${isOwn ? 'flex flex-col items-end' : ''}`}>
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-sm font-medium ${isOwn ? 'order-2' : ''}`}>{author}</span>
            <span className={`text-xs text-muted-foreground ${isOwn ? 'order-1' : ''}`}>{timestamp}</span>
          </div>

          <div className={`flex items-end gap-1.5 ${isOwn ? 'flex-row-reverse' : ''}`}>
            <div
              className={`px-4 py-3 rounded-lg ${
                isOwn
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-foreground'
              }`}
            >
              <p className="leading-relaxed">{message}</p>
            </div>

            {/* Botón ⋮ solo en mensajes ajenos */}
            {!isOwn && (
              <div className="relative self-center" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setMenuOpen((v) => !v)}
                  className="w-7 h-7 flex items-center justify-center rounded-full text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-secondary transition-all"
                  aria-label="Opciones del mensaje"
                >
                  <MoreVertical className="w-3.5 h-3.5" />
                </button>

                {menuOpen && (
                  <div className="absolute left-0 bottom-8 w-40 bg-white rounded-lg border border-border shadow-lg py-1.5 z-20 animate-in fade-in slide-in-from-bottom-2">
                    {reported ? (
                      <div className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground">
                        <Flag className="w-3.5 h-3.5 flex-shrink-0" />
                        Ya reportado
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => { setMenuOpen(false); setShowModal(true); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-muted-foreground hover:text-destructive hover:bg-red-50 transition-colors text-left"
                      >
                        <Flag className="w-4 h-4" />
                        Reportar
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <ReportContentModal
        isOpen={showModal}
        contentType="mensaje"
        alreadyReported={reported}
        onConfirm={handleConfirmReport}
        onCancel={() => setShowModal(false)}
      />

      {showToast && (
        <Toast
          message="Reporte enviado con éxito."
          type="success"
          onClose={() => setShowToast(false)}
        />
      )}
    </>
  );
}
