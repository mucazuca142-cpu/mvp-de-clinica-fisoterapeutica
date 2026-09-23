'use client';

import { useState } from 'react';
import { authenticate } from '../actions';
import { Heart, LogIn, UserPlus, CheckCircle, Calendar, Clock, ShieldCheck } from 'lucide-react';

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [cpf, setCpf] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
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
      window.location.reload();
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setCpf('');
    setName('');
    setPassword('');
  };

  return (
    <div className="auth-page">
      {/* Left hero panel */}
      <div className="auth-hero">
        <div className="hero-logo">
          <div className="hero-logo-icon">
            <Heart size={24} />
          </div>
          <span className="hero-logo-name">Fisio<span style={{ opacity: 0.75 }}>Vida</span></span>
        </div>

        <h1>Cuide da sua<br />saúde hoje.</h1>
        <p>
          Agende sua sessão de fisioterapia com facilidade e conte com os melhores profissionais para a sua recuperação.
        </p>

        <div className="hero-features">
          <div className="hero-feature">
            <div className="hero-check">✓</div>
            <span>Agendamento online em segundos</span>
          </div>
          <div className="hero-feature">
            <div className="hero-check">✓</div>
            <span>Profissionais certificados e especializados</span>
          </div>
          <div className="hero-feature">
            <div className="hero-check">✓</div>
            <span>Acompanhamento personalizado</span>
          </div>
          <div className="hero-feature">
            <div className="hero-check">✓</div>
            <span>Horários flexíveis de segunda a sexta</span>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="auth-form-side">
        <div className="auth-form-box animate-in">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-6" style={{ display: 'none' }}>
            <div className="logo-icon">
              <Heart size={18} />
            </div>
            <span className="logo-name">Fisio<span>Vida</span></span>
          </div>

          <span className="form-eyebrow">
            {isLogin ? 'Acesso ao portal' : 'Novo paciente'}
          </span>

          <h2 className="form-title">
            {isLogin ? 'Bem-vindo de volta!' : 'Crie sua conta'}
          </h2>
          <p className="form-subtitle">
            {isLogin
              ? 'Entre com seus dados para acessar o agendamento.'
              : 'Preencha as informações para se cadastrar gratuitamente.'}
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            {!isLogin && (
              <div className="form-group">
                <label className="form-label">Nome Completo</label>
                <input
                  type="text"
                  className="input"
                  placeholder="Seu nome completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={!isLogin}
                  autoFocus={!isLogin}
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">CPF</label>
              <input
                type="text"
                className="input"
                placeholder="000.000.000-00"
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                required
                autoFocus={isLogin}
                maxLength={14}
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
              {loading ? (
                'Aguarde...'
              ) : isLogin ? (
                <><LogIn size={17} /> Entrar</>
              ) : (
                <><UserPlus size={17} /> Criar conta</>
              )}
            </button>
          </form>

          <div className="form-toggle">
            {isLogin ? 'Ainda não tem conta?' : 'Já possui conta?'}{' '}
            <button type="button" onClick={switchMode}>
              {isLogin ? 'Cadastre-se grátis' : 'Faça login'}
            </button>
          </div>

          <div className="form-divider" />

          <div className="flex items-center justify-center gap-2" style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
            <ShieldCheck size={14} />
            <span>Seus dados estão protegidos e seguros</span>
          </div>
        </div>
      </div>
    </div>
  );
}
