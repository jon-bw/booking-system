import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await login(email, password);
      if (res.error) {
        setError(res.error.message || 'Login failed');
      } else {
        if(res.data && res.data.user.name === "Superadmin") {
          navigate('/superadmin');
        } else {
          navigate('/home');
        }
      }
    } catch (err) {
      setError(err.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <h1 className="font-display text-3xl text-center text-text">Login</h1>
        {error && (
          <div className="font-mono text-sm text-red-500 text-center border border-red-500/20 rounded-lg p-3">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="font-mono text-xs uppercase text-text-muted block mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-surface border border-border rounded-lg px-4 py-2 text-text outline-none focus:border-accent"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="font-mono text-xs uppercase text-text-muted block mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-surface border border-border rounded-lg px-4 py-2 text-text outline-none focus:border-accent"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-accent text-white font-mono uppercase text-sm rounded-full py-3 hover:opacity-90 transition-opacity"
          >
            Sign In
          </button>
        </form>
        <p className="text-center text-text-muted text-sm">
          <a href="/" className="hover:text-text transition-colors">Back to home</a>
        </p>
      </div>
    </div>
  );
}
