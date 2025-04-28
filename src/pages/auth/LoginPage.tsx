import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, Chrome, Apple } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, signInWithProvider } = useApp();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login(email, password);
      // Navigation handled by auth listener in AppContext
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Erro ao fazer login. Verifique suas credenciais.');
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'apple') => {
    setError('');
    try {
      await signInWithProvider(provider);
      // Supabase will handle the redirect and auth listener will update state
    } catch (err: any) {
      console.error(`${provider} login error:`, err);
      setError(`Erro ao fazer login com ${provider}.`);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-secondary mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
            i
          </div>
          <h1 className="text-2xl font-bold">Bem-vindo à iLyra</h1>
          <p className="text-text/70 mt-2">Entre para continuar</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-error/10 border border-error/20 rounded-lg text-error text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">E-mail</label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-input focus:outline-none focus:border-primary"
                placeholder="seu@email.com"
                required
              />
              <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text/50" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Senha</label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-input focus:outline-none focus:border-primary"
                placeholder="••••••••"
                required
              />
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text/50" />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" />
              <span className="text-sm">Lembrar-me</span>
            </label>
            {/* TODO: Implement forgot password page */}
            <Link to="#" className="text-sm text-primary hover:underline">
              Esqueceu a senha?
            </Link>
          </div>

          <button type="submit" className="btn btn-primary w-full flex items-center justify-center gap-2">
            <LogIn size={18} />
            <span>Entrar</span>
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <p className="mb-3">Ou entre com:</p>
          <div className="flex justify-center gap-4">
            <button
              className="p-3 rounded-full border border-border hover:bg-card"
              aria-label="Login com Google"
              onClick={() => handleSocialLogin('google')}
            >
              <Chrome size={20} />
            </button>
            <button
              className="p-3 rounded-full border border-border hover:bg-card"
              aria-label="Login com Apple"
              onClick={() => handleSocialLogin('apple')}
            >
              <Apple size={20} />
            </button>
          </div>
        </div>


        <p className="mt-6 text-center text-sm">
          Não tem uma conta?{' '}
          <Link to="/auth/register" className="text-primary hover:underline">
            Cadastre-se
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
