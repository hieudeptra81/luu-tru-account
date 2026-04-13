export interface Account {
  id: string;
  user_id: string;
  title: string;
  username: string;
  password: string;
  is_logged_in: boolean;
  created_at: string;
}

export type NewAccount = Omit<Account, 'id' | 'user_id' | 'created_at'>;

export interface Database {
  public: {
    Tables: {
      accounts: {
        Row: Account;
        Insert: Omit<Account, 'id' | 'created_at'>;
        Update: Partial<Omit<Account, 'id' | 'user_id' | 'created_at'>>;
      };
    };
  };
}

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error';
}
