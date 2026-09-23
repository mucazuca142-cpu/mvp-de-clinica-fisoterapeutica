'use client';

import { useState, useEffect, useCallback } from 'react';
import { getAppointments, bookAppointment, logout, getMyAppointments, cancelAppointment } from '../actions';
import { LogOut, CalendarDays, Clock, ClipboardList, Heart, X, AlertCircle } from 'lucide-react';

const TIMES = ['07:00', '08:00', '09:00', '10:00', '13:00', '14:00', '15:00', '16:00'];

const MONTHS = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];

function initials(name: string) {
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
}

function formatDate(iso: string) {
  const [y, m, d] = iso.split('-');
  return { day: d, month: MONTHS[parseInt(m) - 1], year: y };
}

export default function Dashboard({ user }: { user: any }) {
  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [myAppointments, setMyAppointments] = useState<{ id: number; date: string; time: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [message, setMessage] = useState({ text: '', type: '' });

  const fetchData = useCallback(async () => {
    if (!selectedDate) return;

    const dateObj = new Date(selectedDate + 'T00:00:00');
    const dow = dateObj.getDay();
    if (dow === 0 || dow === 6) {
      setBookedSlots(TIMES);
      setMessage({ text: 'A clínica não atende aos finais de semana.', type: 'info' });
      return;
    }

    setMessage({ text: '', type: '' });
    const [slots, mine] = await Promise.all([getAppointments(selectedDate), getMyAppointments()]);
    setBookedSlots(slots);
    setMyAppointments(mine);
  }, [selectedDate]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const mySlotForDate = myAppointments.find(a => a.date === selectedDate)?.time ?? null;
  const hasApptToday = mySlotForDate !== null;

  const handleBook = async (time: string) => {
    if (loading) return;
    setLoading(true);
    setMessage({ text: '', type: '' });

    const res = await bookAppointment(selectedDate, time);
    if (res.error) {
      setMessage({ text: res.error, type: 'error' });
    } else {
      setMessage({ text: 'Consulta agendada com sucesso!', type: 'success' });
      await fetchData();
    }
    setLoading(false);
  };

  const handleCancel = async (id: number) => {
    setCancellingId(id);
    const res = await cancelAppointment(id);
    if (res.error) {
      setMessage({ text: res.error, type: 'error' });
    } else {
      setMessage({ text: 'Consulta cancelada.', type: 'success' });
      await fetchData();
    }
    setCancellingId(null);
  };

  const handleLogout = async () => {
    await logout();
    window.location.reload();
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
          <div className="user-pill">
            <div className="user-avatar">{initials(user.name)}</div>
            <span>{user.name.split(' ')[0]}</span>
          </div>
          <button onClick={handleLogout} className="btn btn-ghost btn-sm">
            <LogOut size={15} />
            Sair
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="page-content animate-in">
        {/* Welcome banner */}
        <div className="welcome-banner">
          <h2>Olá, {user.name.split(' ')[0]}! 👋</h2>
          <p>Agende sua próxima sessão de fisioterapia — escolha a data e o horário ideal para você.</p>
        </div>

        {message.text && (
          <div className={`alert ${message.type === 'error' ? 'alert-error' : 'alert-success'} mb-4`}>
            <AlertCircle size={15} />
            {message.text}
          </div>
        )}

        <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px', alignItems: 'start' }}>
          {/* Booking panel */}
          <div className="card">
            <div className="card-header">
              <div className="card-icon"><CalendarDays size={18} /></div>
              <h3>Agendar Consulta</h3>
            </div>
            <div className="card-body">
              <div className="form-group">
                <label className="form-label">Selecione a data</label>
                <input
                  type="date"
                  className="input"
                  style={{ maxWidth: '240px' }}
                  min={today}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2 mb-4" style={{ marginTop: '24px' }}>
                <div className="card-icon" style={{ width: '28px', height: '28px', borderRadius: '8px' }}>
                  <Clock size={14} />
                </div>
                <span className="font-semibold" style={{ fontSize: '0.9rem' }}>Horários disponíveis</span>
              </div>

              {hasApptToday && (
                <div className="alert alert-success mb-4" style={{ fontSize: '0.82rem' }}>
                  <span>✓</span>
                  Você já tem uma consulta às {mySlotForDate} neste dia.
                </div>
              )}

              <div className="slots-grid">
                {TIMES.map(time => {
                  const isMine = time === mySlotForDate;
                  const isTaken = bookedSlots.includes(time) && !isMine;
                  const isDisabled = isTaken || loading || (hasApptToday && !isMine);

                  return (
                    <button
                      key={time}
                      className={`slot-btn ${isMine ? 'slot-mine' : isTaken ? 'slot-taken' : ''}`}
                      onClick={() => !isMine && !isDisabled && handleBook(time)}
                      disabled={isDisabled && !isMine}
                      title={isMine ? 'Seu horário' : isTaken ? 'Ocupado' : ''}
                    >
                      {time}
                    </button>
                  );
                })}
              </div>

              <p className="text-muted mt-4" style={{ fontSize: '0.78rem' }}>
                * Pausa de almoço: 11:00–13:00 · Atendimento de segunda a sexta
              </p>
            </div>
          </div>

          {/* My appointments panel */}
          <div className="card">
            <div className="card-header">
              <div className="card-icon"><ClipboardList size={18} /></div>
              <h3>Minhas Consultas</h3>
            </div>
            <div className="card-body" style={{ padding: '16px' }}>
              {myAppointments.length === 0 ? (
                <div className="empty-state">
                  <CalendarDays size={36} />
                  <p>Você ainda não tem<br />consultas agendadas.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {myAppointments.map(appt => {
                    const { day, month } = formatDate(appt.date);
                    return (
                      <div key={appt.id} className="appt-card">
                        <div className="appt-info">
                          <div className="appt-date-badge">
                            <span className="day">{day}</span>
                            <span className="month">{month}</span>
                          </div>
                          <div className="appt-meta">
                            <strong>{appt.time}</strong>
                            <span>Fisioterapia</span>
                          </div>
                        </div>
                        <button
                          className="btn btn-danger-outline btn-sm"
                          onClick={() => handleCancel(appt.id)}
                          disabled={cancellingId === appt.id}
                          title="Cancelar consulta"
                        >
                          <X size={13} />
                          {cancellingId === appt.id ? '...' : 'Cancelar'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
