import { useState, useCallback, useRef, useEffect } from 'react';
import { Plus, LogOut, KeyRound, Search } from 'lucide-react';
import { useAuth } from './hooks/useAuth';
import { useAccounts } from './hooks/useAccounts';
import { Auth } from './components/Auth';
import { AccountCard } from './components/AccountCard';
import { AddAccountModal } from './components/AddAccountModal';
import { Toast } from './components/Toast';
import type { ToastMessage } from './lib/types';

function App() {
  const { user, loading: authLoading, signIn, signUp, signOut } = useAuth();
  const { accounts, loading, addAccount, deleteAccount, toggleLoggedIn, updateTitle } = useAccounts(user);
  const [showAddModal, setShowAddModal] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [search, setSearch] = useState('');
  const scrollPositions = useRef<Record<string, number>>({});

  const addToast = useCallback((message: string, type: ToastMessage['type'] = 'success') => {
    const id = crypto.randomUUID();
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const handleCopy = useCallback((_text: string, label: string) => {
    addToast(`${label} copied to clipboard`);
  }, [addToast]);

  const handleDelete = async (id: string) => {
    const { error } = await deleteAccount(id);
    if (error) addToast('Failed to delete account', 'error');
    else addToast('Account deleted');
  };

  const handleToggleLoggedIn = async (id: string, is_logged_in: boolean) => {
    const { error } = await toggleLoggedIn(id, is_logged_in);
    if (error) addToast('Failed to update status', 'error');
    else addToast(is_logged_in ? 'Marked as logged in' : 'Marked as logged out');
  };

  const handleUpdateTitle = async (id: string, title: string) => {
    const { error } = await updateTitle(id, title);
    if (error) addToast('Failed to update title', 'error');
    else addToast('Title updated');
    return { error };
  };

  const saveScrollPosition = useCallback(() => {
    const scrollContainer = document.querySelector('main');
    if (scrollContainer) {
      scrollPositions.current[search] = scrollContainer.scrollTop;
    }
  }, [search]);

  const restoreScrollPosition = useCallback((searchKey: string) => {
    const scrollContainer = document.querySelector('main');
    if (scrollContainer && scrollPositions.current[searchKey] !== undefined) {
      setTimeout(() => {
        scrollContainer.scrollTop = scrollPositions.current[searchKey];
      }, 0);
    }
  }, []);

  const handleSearchChange = (value: string) => {
    saveScrollPosition();
    setSearch(value);
    restoreScrollPosition(value);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Auth onSignIn={signIn} onSignUp={signUp} />;
  }

  const filtered = accounts.filter(a =>
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    a.username.toLowerCase().includes(search.toLowerCase())
  );

  const loggedInCount = accounts.filter(a => a.is_logged_in).length;

  return (
    <div className="min-h-screen bg-gray-950">
      <header className="bg-gray-900/80 backdrop-blur-md border-b border-gray-800 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow shadow-blue-900/40">
              <KeyRound size={16} className="text-white" />
            </div>
            <div>
              <span className="text-white font-bold text-base leading-none">AccountVault</span>
              <p className="text-gray-500 text-xs mt-0.5 hidden sm:block">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-medium px-3.5 py-2 rounded-xl text-sm transition-all shadow-lg shadow-blue-900/30"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Add Account</span>
            </button>
            <button
              onClick={signOut}
              className="p-2 text-gray-500 hover:text-gray-300 hover:bg-gray-800 rounded-xl transition-colors"
              title="Sign out"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Your Accounts</h2>
            <p className="text-gray-500 text-sm mt-1">
              {accounts.length} saved &middot; {loggedInCount} logged in
            </p>
          </div>

          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search accounts..."
              value={search}
              onChange={e => handleSearchChange(e.target.value)}
              className="bg-gray-900 border border-gray-800 rounded-xl pl-9 pr-4 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-colors w-full sm:w-56"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-7 h-7 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState hasAccounts={accounts.length > 0} onAdd={() => setShowAddModal(true)} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map(account => (
              <AccountCard
                key={account.id}
                account={account}
                onDelete={handleDelete}
                onToggleLoggedIn={handleToggleLoggedIn}
                onUpdateTitle={handleUpdateTitle}
                onCopy={handleCopy}
              />
            ))}
          </div>
        )}
      </main>

      {showAddModal && (
        <AddAccountModal
          onAdd={addAccount}
          onClose={() => setShowAddModal(false)}
        />
      )}

      <Toast toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

function EmptyState({ hasAccounts, onAdd }: { hasAccounts: boolean; onAdd: () => void }) {
  return (
    <div className="text-center py-20">
      <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <KeyRound size={28} className="text-gray-600" />
      </div>
      <h3 className="text-white font-semibold text-lg mb-2">
        {hasAccounts ? 'No results found' : 'No accounts yet'}
      </h3>
      <p className="text-gray-500 text-sm mb-6 max-w-xs mx-auto">
        {hasAccounts
          ? 'Try adjusting your search query.'
          : 'Add your first account to get started storing your credentials securely.'
        }
      </p>
      {!hasAccounts && (
        <button
          onClick={onAdd}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-medium px-5 py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-blue-900/30"
        >
          <Plus size={16} />
          Add your first account
        </button>
      )}
    </div>
  );
}

export default App;
