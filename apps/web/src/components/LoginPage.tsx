import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/client';

export function LoginPage() {
  const [key, setKey] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      login(key);
      const res = await fetch('/api/admin/stats', {
        headers: { Authorization: `Bearer ${key}` },
      });
      if (res.ok) {
        navigate('/');
      } else {
        localStorage.removeItem('admin_api_key');
        setError('Invalid API key');
      }
    } catch {
      localStorage.removeItem('admin_api_key');
      setError('Connection failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-admin-bg">
      <div className="w-full max-w-sm p-8 bg-admin-surface rounded-lg border border-admin-border">
        <h1 className="text-xl font-semibold text-admin-text-bright mb-1">Ember Galaxies</h1>
        <p className="text-sm text-admin-text-dim mb-6">Admin Dashboard</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-admin-text-dim mb-1.5">API Key</label>
            <input
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="w-full px-3 py-2 bg-admin-bg border border-admin-border rounded-md text-admin-text text-sm focus:outline-none focus:border-admin-accent"
              placeholder="Enter admin API key"
              autoFocus
            />
          </div>

          {error && <p className="text-sm text-admin-danger">{error}</p>}

          <button
            type="submit"
            className="w-full py-2 bg-admin-accent hover:bg-admin-accent-hover text-white text-sm font-medium rounded-md transition-colors"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}