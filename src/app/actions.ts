'use server';

import { db } from '@/lib/db';
import { cookies } from 'next/headers';

// Simple auth for MVP using cookies
export async function authenticate(cpf: string, name: string, password: string) {
  try {
    const userRow = db.prepare('SELECT * FROM users WHERE cpf = ?').get(cpf) as any;

    if (userRow) {
      // User exists, verify password
      if (userRow.password !== password) {
        return { error: 'Senha incorreta.' };
      }
      
      // Set simple cookie session (MVP approach)
      const cookieStore = await cookies();
      cookieStore.set('userId', userRow.id.toString(), { secure: true });
      return { success: true, user: userRow };
    } else {
      // Create new user
      if (!name) {
        return { error: 'Nome é obrigatório para novo cadastro.' };
      }
      const info = db.prepare('INSERT INTO users (name, cpf, password) VALUES (?, ?, ?)').run(name, cpf, password);
      
      const cookieStore = await cookies();
      cookieStore.set('userId', info.lastInsertRowid.toString(), { secure: true });
      return { success: true, user: { id: info.lastInsertRowid, name, cpf } };
    }
  } catch (error: any) {
    console.error(error);
    return { error: 'Erro ao autenticar.' };
  }
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('userId');
  return { success: true };
}

export async function getUser() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;
  if (!userId) return null;

  const user = db.prepare('SELECT id, name, cpf FROM users WHERE id = ?').get(userId);
  return user || null;
}

export async function getAppointments(date: string) {
  // Returns all appointments for a specific date to block slots
  const appointments = db.prepare('SELECT time FROM appointments WHERE date = ?').all(date) as any[];
  return appointments.map(app => app.time);
}

export async function bookAppointment(date: string, time: string) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;
  if (!userId) return { error: 'Usuário não autenticado.' };

  try {
    db.prepare('INSERT INTO appointments (user_id, date, time) VALUES (?, ?, ?)').run(userId, date, time);
    return { success: true };
  } catch (error: any) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return { error: 'Horário já agendado por outro paciente.' };
    }
    return { error: 'Erro ao agendar horário.' };
  }
}

export async function getMyAppointments() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;
  if (!userId) return [];

  const appointments = db.prepare('SELECT date, time FROM appointments WHERE user_id = ? ORDER BY date, time').all(userId);
  return appointments;
}
