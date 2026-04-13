import { useEffect } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';
import type { ToastMessage } from '../lib/types';

interface ToastProps {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}

export function Toast({ toasts, onRemove }: ToastProps) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onRemove }: { toast: ToastMessage; onRemove: (id: string) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onRemove(toast.id), 3000);
    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  return (
    <div
      className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl backdrop-blur-sm border text-sm font-medium animate-slide-in
        ${toast.type === 'success'
          ? 'bg-emerald-950/90 border-emerald-700/50 text-emerald-300'
          : 'bg-red-950/90 border-red-700/50 text-red-300'
        }`}
    >
      {toast.type === 'success'
        ? <CheckCircle size={16} className="text-emerald-400 shrink-0" />
        : <XCircle size={16} className="text-red-400 shrink-0" />
      }
      <span>{toast.message}</span>
      <button
        onClick={() => onRemove(toast.id)}
        className="ml-2 opacity-60 hover:opacity-100 transition-opacity"
      >
        <X size={14} />
      </button>
    </div>
  );
}
