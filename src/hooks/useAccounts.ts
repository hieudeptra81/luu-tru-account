import { useState, useEffect, useCallback } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { Account, NewAccount } from '../lib/types';

export function useAccounts(user: User | null) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAccounts = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('accounts')
      .select('*')
      .order('created_at', { ascending: false });
    setAccounts(data ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const addAccount = async (account: NewAccount) => {
    if (!user) return { error: new Error('Not authenticated') };
    const { error } = await supabase.from('accounts').insert({
      ...account,
      user_id: user.id,
    });
    if (!error) await fetchAccounts();
    return { error };
  };

  const deleteAccount = async (id: string) => {
    const { error } = await supabase.from('accounts').delete().eq('id', id);
    if (!error) setAccounts(prev => prev.filter(a => a.id !== id));
    return { error };
  };

  const toggleLoggedIn = async (id: string, is_logged_in: boolean) => {
    const { error } = await supabase
      .from('accounts')
      .update({ is_logged_in })
      .eq('id', id);
    if (!error) {
      setAccounts(prev =>
        prev.map(a => (a.id === id ? { ...a, is_logged_in } : a))
      );
    }
    return { error };
  };

  return { accounts, loading, addAccount, deleteAccount, toggleLoggedIn };
}
