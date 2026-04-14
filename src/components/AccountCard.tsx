import { useState, useRef, useEffect } from 'react';
import { Copy, Trash2, Eye, EyeOff, CheckCircle2, Check, Pencil, X } from 'lucide-react';
import type { Account } from '../lib/types';

interface AccountCardProps {
  account: Account;
  onDelete: (id: string) => Promise<void>;
  onToggleLoggedIn: (id: string, is_logged_in: boolean) => Promise<void>;
  onUpdateTitle: (id: string, title: string) => Promise<{ error: Error | null }>;
  onCopy: (text: string, label: string) => void;
}

export function AccountCard({ account, onDelete, onToggleLoggedIn, onUpdateTitle, onCopy }: AccountCardProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<'username' | 'password' | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editingTitle, setEditingTitle] = useState(account.title);
  const [savingTitle, setSavingTitle] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleCopy = async (text: string, field: 'username' | 'password') => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    onCopy(text, field === 'username' ? 'Username' : 'Password');
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleDelete = async () => {
    setDeleting(true);
    await onDelete(account.id);
  };

  const handleSaveTitle = async () => {
    if (!editingTitle.trim()) {
      setEditingTitle(account.title);
      setIsEditingTitle(false);
      return;
    }
    setSavingTitle(true);
    const { error } = await onUpdateTitle(account.id, editingTitle.trim());
    if (!error) {
      setIsEditingTitle(false);
    } else {
      setEditingTitle(account.title);
    }
    setSavingTitle(false);
  };

  const handleCancelEdit = () => {
    setEditingTitle(account.title);
    setIsEditingTitle(false);
  };

  useEffect(() => {
    if (isEditingTitle && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditingTitle]);

  const initials = account.title.slice(0, 2).toUpperCase();

  const colors = [
    'bg-blue-600', 'bg-emerald-600', 'bg-amber-600',
    'bg-rose-600', 'bg-cyan-600', 'bg-violet-600',
  ];
  const colorIndex = account.title.charCodeAt(0) % colors.length;
  const avatarColor = colors[colorIndex];

  return (
    <div className={`group bg-gray-900 border rounded-2xl p-5 transition-all duration-200 hover:border-gray-700 hover:shadow-xl hover:shadow-black/30 ${
      account.is_logged_in ? 'border-emerald-800/60' : 'border-gray-800'
    }`}>
      <div className="flex items-start gap-4">
        <div className={`w-11 h-11 ${avatarColor} rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-lg`}>
          {initials}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            {isEditingTitle ? (
              <div className="flex items-center gap-1 flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={editingTitle}
                  onChange={e => setEditingTitle(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleSaveTitle();
                    if (e.key === 'Escape') handleCancelEdit();
                  }}
                  className="flex-1 bg-gray-800 border border-blue-500 rounded-lg px-2.5 py-1 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 min-w-0"
                />
                <button
                  onClick={handleSaveTitle}
                  disabled={savingTitle}
                  className="p-1 text-emerald-400 hover:text-emerald-300 transition-colors shrink-0"
                >
                  <Check size={15} />
                </button>
                <button
                  onClick={handleCancelEdit}
                  disabled={savingTitle}
                  className="p-1 text-gray-500 hover:text-gray-300 transition-colors shrink-0"
                >
                  <X size={15} />
                </button>
              </div>
            ) : (
              <>
                <h3 className="text-white font-semibold text-base leading-tight truncate">{account.title}</h3>
                <button
                  onClick={() => setIsEditingTitle(true)}
                  className="p-1.5 text-gray-600 hover:text-gray-300 hover:bg-gray-800 rounded-lg transition-colors shrink-0"
                  title="Edit title"
                >
                  <Pencil size={13} />
                </button>
                {account.is_logged_in && (
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-2 py-0.5 rounded-full shrink-0">
                    <Check size={10} strokeWidth={3} />
                    Logged in
                  </span>
                )}
              </>
            )}
          </div>

          <div className="space-y-2 mt-3">
            <FieldRow
              label="Username"
              value={account.username}
              displayValue={account.username}
              copied={copiedField === 'username'}
              onCopy={() => handleCopy(account.username, 'username')}
            />
            <FieldRow
              label="Password"
              value={account.password}
              displayValue={showPassword ? account.password : '••••••••••'}
              copied={copiedField === 'password'}
              onCopy={() => handleCopy(account.password, 'password')}
              showToggle
              isRevealed={showPassword}
              onToggleReveal={() => setShowPassword(!showPassword)}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-800">
        <button
          onClick={() => onToggleLoggedIn(account.id, !account.is_logged_in)}
          className={`flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-lg transition-all duration-200 ${
            account.is_logged_in
              ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/50 hover:bg-emerald-950'
              : 'bg-gray-800 text-gray-400 border border-gray-700 hover:text-gray-200 hover:border-gray-600'
          }`}
        >
          <CheckCircle2 size={13} />
          {account.is_logged_in ? 'Mark as logged out' : 'Mark as logged in'}
        </button>

        <button
          onClick={handleDelete}
          disabled={deleting}
          className="p-2 text-gray-600 hover:text-red-400 hover:bg-red-950/40 rounded-lg transition-all duration-200 disabled:opacity-50"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}

interface FieldRowProps {
  label: string;
  value: string;
  displayValue: string;
  copied: boolean;
  onCopy: () => void;
  showToggle?: boolean;
  isRevealed?: boolean;
  onToggleReveal?: () => void;
}

function FieldRow({ label, displayValue, copied, onCopy, showToggle, isRevealed, onToggleReveal }: FieldRowProps) {
  return (
    <div className="flex items-center gap-2 bg-gray-800/60 rounded-lg px-3 py-2">
      <span className="text-xs text-gray-500 w-16 shrink-0">{label}</span>
      <span className="text-sm text-gray-300 flex-1 font-mono truncate min-w-0">{displayValue}</span>
      <div className="flex items-center gap-1 shrink-0">
        {showToggle && (
          <button
            onClick={onToggleReveal}
            className="p-1 text-gray-500 hover:text-gray-300 transition-colors rounded"
          >
            {isRevealed ? <EyeOff size={13} /> : <Eye size={13} />}
          </button>
        )}
        <button
          onClick={onCopy}
          className={`p-1 rounded transition-all duration-200 ${
            copied ? 'text-emerald-400' : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          {copied ? <Check size={13} strokeWidth={3} /> : <Copy size={13} />}
        </button>
      </div>
    </div>
  );
}
