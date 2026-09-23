'use client';

import { useState, useEffect, useCallback } from 'react';
import { adminGetAppointments, adminCancelAppointment, adminLogout } from '../actions';
import { Heart, LogOut, CalendarDays, Users, X, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

const TIMES = ['07:00', '08:00', '09:00', '10:00', '13:00', '14:00', '15:00', '16:00'];

function maskCpf(cpf: string) {
  if (cpf.length !== 11) return cpf;
  return `${cpf.slice(0, 3)}.***.***.${cpf.slice(-2)}`;
}

export default function AdminDashboard({ admin }: { admin: any }) {
  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [message, setMessage] = useState({ text: '', type: '' });

  const fetchAppointments = useCallback(async () => {
    if (!selectedDate) return;
    setLoading(true);
    const res = await adminGetAppointments(selectedDate);
    if (res && !('error' in res)) {
      setAppointments(res.appointments);
    }
    setLoading(false);
  }, [selectedDate]);

  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

  const handleCancel = async (id: number) => {
    setCancellingId(id);
    setMessage({ text: '', type: '' });
    const res = await adminCancelAppointment(id);
    if (res.error) {
      setMessage({ text: res.error, type: 'error' });
    } else {
      setMessage({ text: 'Consulta cancelada com sucesso.', type: 'success' });
      await fetchAppointments();
    }
    setCancellingId(null);
  };

  const handleLogout = async () => {
    await adminLogout();
    window.location.reload();
  };

  // Build full schedule (all time slots, merged with booked data)
  const schedule = TIMES.map(time => {
    const appt = appointments.find(a => a.time === time && a.status === 'active');
    const cancelled = appointments.find(a => a.time === time && a.status === 'cancelled');
    return { time, appt: appt || null, cancelled: cancelled || null };
  });

  const totalActive    = appointments.filter(a => a.status === 'active').length;
  const totalCancelled = appointments.filter(a => a.status === 'cancelled').length;
  const totalFree      = TIMES.length - totalActive;

  const formatDisplayDate = (iso: string) => {
    const [y, m, d] = iso.split('-');
    return `${d}/${m}/${y}`;
  };

  return (
    <>
      {/* Header */}
      <header className="app-header">
        <div className="logo">
          <div className="logo-icon">
            <Heart size={18} />
          </div>
          <span className="logo-name">Fisio<span>Vida</span></span>
        </div>

        <div className="header-right">
          <span className="admin-badge">Admin</span>
          <div className="user-pill">
            <div className="user-avatar" style={{ fontSize: '0.65rem' }}>DR</div>
            <span>{admin.name}</span>
          </div>
          <button onClick={handleLogout} className="btn btn-ghost btn-sm">
            <LogOut size={15} />
            Sair
          </button>
        </div>
      </header>

      <main className="page-content animate-in">
        {/* Welcome */}
        <div className="welcome-banner" style={{ marginBottom: '24px' }}>
          <h2>Painel de Agendamentos</h2>
          <p>Visualize e gerencie todos os agendamentos da clínica.</p>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon si-teal">
              <Users size={22} />
            </div>
            <div>
              <div className="stat-value">{totalActive}</div>
              <div className="stat-label">Agendadas</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon si-red">
              <XCircle size={22} />
            </div>
            <div>
              <div className="stat-value">{totalCancelled}</div>
              <div className="stat-label">Canceladas</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon si-gray">
              <Clock size={22} />
            </div>
            <div>
              <div className="stat-value">{totalFree}</div>
              <div className="stat-label">Horários livres</div>
            </div>
          </div>
        </div>

        {/* Appointments table */}
        <div className="card">
          <div className="card-header" style={{ justifyContent: 'space-between' }}>
            <div className="flex items-center gap-3">
              <div className="card-icon"><CalendarDays size={18} /></div>
              <h3>Agenda do dia</h3>
            </div>
            <input
              type="date"
              className="input"
              style={{ maxWidth: '200px', marginBottom: 0 }}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>

          {message.text && (
            <div className={`alert ${message.type === 'error' ? 'alert-error' : 'alert-success'}`}
              style={{ margin: '12px 24px 0' }}>
              <AlertCircle size={14} />
              {message.text}
            </div>
          )}

          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Horário</th>
                  <th>Paciente</th>
                  <th>CPF</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'center' }}>Ação</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                      Carregando...
                    </td>
                  </tr>
                ) : (
                  schedule.map(({ time, appt, cancelled }) => (
                    <tr key={time}>
                      <td>
                        <strong style={{ fontVariantNumeric: 'tabular-nums' }}>{time}</strong>
                      </td>
                      <td>
                        {appt ? (
                          <span className="font-semibold">{appt.patient_name}</span>
                        ) : cancelled ? (
                          <span style={{ color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                            {cancelled.patient_name}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>— Livre —</span>
                        )}
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                        {appt ? maskCpf(appt.patient_cpf) : cancelled ? maskCpf(cancelled.patient_cpf) : '—'}
                      </td>
                      <td>
                        {appt ? (
                          <span className="status-badge badge-active">
                            <CheckCircle size={11} /> Agendado
                          </span>
                        ) : cancelled ? (
                          <span className="status-badge badge-cancelled">
                            <XCircle size={11} /> Cancelado
                          </span>
                        ) : (
                          <span className="status-badge badge-free">Disponível</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {appt && (
                          <button
                            className="btn btn-danger-outline btn-sm"
                            onClick={() => handleCancel(appt.id)}
                            disabled={cancellingId === appt.id}
                          >
                            <X size={13} />
                            {cancellingId === appt.id ? '...' : 'Cancelar'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {!loading && schedule.every(s => !s.appt) && (
            <div className="empty-state" style={{ padding: '40px' }}>
              <CalendarDays size={40} />
              <p style={{ marginTop: '8px' }}>Nenhum agendamento para {formatDisplayDate(selectedDate)}.</p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
