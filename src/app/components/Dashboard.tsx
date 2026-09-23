'use client';

import { useState, useEffect } from 'react';
import { getAppointments, bookAppointment, logout, getMyAppointments } from '../actions';
import { LogOut, CalendarDays, Clock, CheckCircle } from 'lucide-react';

const AVAILABLE_TIMES = [
  '07:00', '08:00', '09:00', '10:00', 
  '13:00', '14:00', '15:00', '16:00'
];

export default function Dashboard({ user }: { user: any }) {
  // Setup date picker to min today
  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [myAppointments, setMyAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  const fetchData = async () => {
    if (!selectedDate) return;
    
    // Check if weekend
    const dateObj = new Date(selectedDate);
    const dayOfWeek = dateObj.getUTCDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) { // 0 is Sunday, 6 is Saturday
      setBookedSlots(AVAILABLE_TIMES); // Disable all on weekends
      setMessage({ text: 'A clínica não funciona aos finais de semana.', type: 'error' });
      return;
    } else {
      setMessage({ text: '', type: '' });
    }

    const slots = await getAppointments(selectedDate);
    setBookedSlots(slots);
    
    const mine = await getMyAppointments();
    setMyAppointments(mine);
  };

  const handleBook = async (time: string) => {
    if (bookedSlots.includes(time)) return;
    
    setLoading(true);
    setMessage({ text: '', type: '' });
    const res = await bookAppointment(selectedDate, time);
    
    if (res.error) {
      setMessage({ text: res.error, type: 'error' });
    } else {
      setMessage({ text: 'Agendamento realizado com sucesso!', type: 'success' });
      fetchData(); // Refresh slots
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await logout();
    window.location.reload();
  };

  return (
    <div className="animate-fade-in" style={{ padding: '20px 0' }}>
      <header className="flex items-center" style={{ justifyContent: 'space-between', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Olá, {user.name}</h2>
          <p className="text-muted">Agende sua próxima sessão de fisioterapia.</p>
        </div>
        <button onClick={handleLogout} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>
          <LogOut size={16} />
          Sair
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px' }}>
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CalendarDays size={20} className="text-muted" />
            Escolha uma Data
          </h3>
          
          <input 
            type="date" 
            className="input-field" 
            min={today}
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{ maxWidth: '300px', marginBottom: '24px' }}
          />

          <h3 style={{ fontSize: '1.25rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={20} className="text-muted" />
            Horários Disponíveis
          </h3>
          
          {message.text && (
            <div style={{ padding: '12px', borderRadius: '8px', marginBottom: '16px', backgroundColor: message.type === 'error' ? '#fef2f2' : '#ecfdf5', color: message.type === 'error' ? 'var(--danger)' : 'var(--success)' }}>
              {message.text}
            </div>
          )}

          <div className="slots-grid">
            {AVAILABLE_TIMES.map(time => {
              const isBooked = bookedSlots.includes(time);
              return (
                <button
                  key={time}
                  onClick={() => handleBook(time)}
                  disabled={isBooked || loading}
                  className={`slot-item ${isBooked ? 'disabled' : ''}`}
                >
                  {time}
                </button>
              );
            })}
          </div>
          <p className="text-muted mt-4" style={{ fontSize: '0.875rem' }}>* Pausa de almoço das 11:00 às 13:00</p>
        </div>

        <div className="glass-panel" style={{ padding: '24px', height: 'fit-content' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle size={20} className="text-muted" />
            Meus Agendamentos
          </h3>
          
          {myAppointments.length === 0 ? (
            <p className="text-muted text-center" style={{ fontSize: '0.875rem', padding: '20px 0' }}>
              Você ainda não tem consultas agendadas.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {myAppointments.map((app, idx) => {
                // Format date for better reading (YYYY-MM-DD to DD/MM/YYYY)
                const [y, m, d] = app.date.split('-');
                return (
                  <div key={idx} style={{ padding: '12px', border: '1px solid var(--border)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}>
                    <strong>{d}/{m}/{y}</strong>
                    <span>{app.time}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
