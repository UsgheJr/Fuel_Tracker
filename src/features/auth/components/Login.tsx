import { useState } from 'react';
import { supabase } from '../shared/utils/supabaseClient';

interface LoginProps {
  onLoginSuccess: (user: any) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const emailToUse = username.trim().toLowerCase();
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: emailToUse,
      password: password,
    });

    setLoading(false);

    if (error) {
      setError('Credenziali non valide o accesso non autorizzato.');
    } else {
      onLoginSuccess(data.user);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100">
      <div className="p-8 bg-white rounded-xl shadow-md w-96 border border-slate-200">
        <h2 className="text-xl font-extrabold text-slate-900 mb-2 text-center">🚗 Trip Cost Tracker</h2>
        <p className="text-xs text-slate-500 mb-6 text-center">Inserisci le credenziali fornite dall'amministratore</p>
        
        {error && <div className="mb-4 p-3 bg-rose-50 text-rose-700 text-xs font-medium rounded-lg">{error}</div>}
        
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-slate-700 text-xs font-bold mb-1">Nome Utente</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-slate-700 text-xs font-bold mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition font-semibold text-xs cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Accesso in corso...' : 'Accedi'}
          </button>
        </form>
      </div>
    </div>
  );
}