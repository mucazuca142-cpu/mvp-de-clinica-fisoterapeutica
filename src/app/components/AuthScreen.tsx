'use client';

import { useState } from 'react';
import { authenticate } from '../actions';
import { LogIn } from 'lucide-react';

export default function AuthScreen() {
  const [cpf, setCpf] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await authenticate(cpf, isLogin ? '' : name, password);

    if (res.error) {
      setError(res.error);
      setLoading(false);
    } else {
      // Reload to trigger server component re-render and show Dashboard
      window.location.reload();
    }
  };

  return (
    <div className="animate-fade-in flex flex-col items-center justify-center" style={{ minHeight: '80vh' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '32px' }}>
        <div className="text-center mb-6">
          <h1 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>
            {isLogin ? 'Bem-vindo de volta' : 'Crie sua conta'}
          </h1>
          <p className="text-muted" style={{ fontSize: '0.875rem' }}>
            Fisioterapia Especializada
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {!isLogin && (
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.875rem', fontWeight: 500 }}>
                Nome Completo
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="Seu nome completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required={!isLogin}
              />
            </div>
          )}

          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.875rem', fontWeight: 500 }}>
              CPF
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="000.000.000-00"
              value={cpf}
              onChange={(e) => setCpf(e.target.value)}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.875rem', fontWeight: 500 }}>
              Senha
            </label>
            <input
              type="password"
              className="input-field"
              placeholder="Sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <div style={{ color: 'var(--danger)', fontSize: '0.875rem' }}>{error}</div>}

          <button type="submit" className="btn-primary mt-4" disabled={loading}>
            {loading ? 'Aguarde...' : isLogin ? 'Entrar' : 'Cadastrar'}
            <LogIn size={18} />
          </button>
        </form>

        <div className="text-center mt-4" style={{ fontSize: '0.875rem' }}>
          <span className="text-muted">
            {isLogin ? 'Ainda não tem conta?' : 'Já possui conta?'}
          </span>{' '}
          <button
            type="button"
            style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
          >
            {isLogin ? 'Cadastre-se' : 'Faça login'}
          </button>
        </div>
      </div>
    </div>
  );
}
