'use client';

import { useState } from 'react';
import { adminAuthenticate } from '../actions';
import { Heart, Lock, ShieldCheck } from 'lucide-react';

export default function AdminAuthScreen() {
  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await adminAuthenticate(cpf, password);
    if (res.error) {
      setError(res.error);
      setLoading(false);
    } else {
      window.location.reload();
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(145deg, var(--primary-active) 0%, var(--primary) 55%, var(--primary-light) 100%)',
      padding: '24px',
    }}>
      <div className="animate-in" style={{
        background: 'white',
        borderRadius: '20px',
        padding: '40px 36px',
        width: '100%',
        maxWidth: '400px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
      }}>
        {/* Logo */}
        <div className="flex items-center gap-3 mb-6">
          <div className="logo-icon">
            <Heart size={18} />
          </div>
          <span className="logo-name">Fisio<span>Vida</span></span>
        </div>

        <span className="form-eyebrow" style={{ marginBottom: '12px', display: 'inline-block' }}>
          Área restrita
        </span>

        <h2 className="form-title">Painel do Fisioterapeuta</h2>
        <p className="form-subtitle">
          Acesse para visualizar e gerenciar os agendamentos da clínica.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="form-group">
            <label className="form-label">CPF do Administrador</label>
            <input
              type="text"
              className="input"
              placeholder="000.000.000-00"
              value={cpf}
              onChange={(e) => setCpf(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">Senha</label>
            <input
              type="password"
              className="input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="alert alert-error">
              <span>⚠</span>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-full mt-2"
            disabled={loading}
            style={{ padding: '13px 20px' }}
          >
            <Lock size={16} />
            {loading ? 'Verificando...' : 'Acessar painel'}
          </button>
        </form>

        <div className="form-divider" />

        <div className="flex items-center justify-center gap-2 text-muted text-xs">
          <ShieldCheck size={13} />
          <span>Acesso exclusivo para profissionais autorizados</span>
        </div>
      </div>
    </div>
  );
}
