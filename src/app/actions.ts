'use server';

import { db } from '@/lib/db';
import { cookies } from 'next/headers';

// ─── PATIENT AUTH ──────────────────────────────────

export async function authenticate(cpf: string, name: string, password: string) {
  try {
    const userRow = db.prepare("SELECT * FROM users WHERE cpf = ? AND role = 'patient'").get(cpf) as any;

    if (userRow) {
      if (userRow.password !== password) return { error: 'Senha incorreta.' };
      const cookieStore = await cookies();
      cookieStore.set('userId', userRow.id.toString(), { httpOnly: true });
      return { success: true };
    } else {
      if (!name) return { error: 'Nome é obrigatório para novo cadastro.' };
      const info = db.prepare(
        "INSERT INTO users (name, cpf, password, role) VALUES (?, ?, ?, 'patient')"
      ).run(name, cpf, password);
      const cookieStore = await cookies();
      cookieStore.set('userId', info.lastInsertRowid.toString(), { httpOnly: true });
      return { success: true };
    }
  } catch {
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
  const user = db.prepare("SELECT id, name, cpf FROM users WHERE id = ? AND role = 'patient'").get(userId);
  return user || null;
}

// ─── ADMIN AUTH ────────────────────────────────────

export async function adminAuthenticate(cpf: string, password: string) {
  try {
    const adminRow = db.prepare("SELECT * FROM users WHERE cpf = ? AND role = 'admin'").get(cpf) as any;
    if (!adminRow) return { error: 'Credenciais inválidas.' };
    if (adminRow.password !== password) return { error: 'Senha incorreta.' };
    const cookieStore = await cookies();
    cookieStore.set('adminId', adminRow.id.toString(), { httpOnly: true });
    return { success: true };
  } catch {
    return { error: 'Erro ao autenticar.' };
  }
}

export async function adminLogout() {
  const cookieStore = await cookies();
  cookieStore.delete('adminId');
  return { success: true };
}

export async function getAdminUser() {
  const cookieStore = await cookies();
  const adminId = cookieStore.get('adminId')?.value;
  if (!adminId) return null;
  const user = db.prepare("SELECT id, name FROM users WHERE id = ? AND role = 'admin'").get(adminId);
  return user || null;
}

// ─── APPOINTMENTS ──────────────────────────────────

export async function getAppointments(date: string) {
  const rows = db.prepare(
    "SELECT time FROM appointments WHERE date = ? AND status = 'active'"
  ).all(date) as any[];
  return rows.map(r => r.time);
}

export async function bookAppointment(date: string, time: string) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;
  if (!userId) return { error: 'Usuário não autenticado.' };

  // One appointment per day limit
  const existing = db.prepare(
    "SELECT id FROM appointments WHERE user_id = ? AND date = ? AND status = 'active'"
  ).get(userId, date) as any;
  if (existing) return { error: 'Você já possui uma consulta agendada neste dia.' };

  try {
    db.prepare(
      "INSERT INTO appointments (user_id, date, time, status) VALUES (?, ?, ?, 'active')"
    ).run(userId, date, time);
    return { success: true };
  } catch (error: any) {
    if (error.message?.includes('UNIQUE')) return { error: 'Horário já reservado por outro paciente.' };
    return { error: 'Erro ao agendar.' };
  }
}

export async function cancelAppointment(appointmentId: number) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;
  if (!userId) return { error: 'Não autenticado.' };

  const appt = db.prepare(
    "SELECT id FROM appointments WHERE id = ? AND user_id = ? AND status = 'active'"
  ).get(appointmentId, userId) as any;
  if (!appt) return { error: 'Consulta não encontrada.' };

  db.prepare("UPDATE appointments SET status = 'cancelled' WHERE id = ?").run(appointmentId);
  return { success: true };
}

export async function getMyAppointments() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;
  if (!userId) return [];

  const today = new Date().toISOString().split('T')[0];
  return db.prepare(
    "SELECT id, date, time FROM appointments WHERE user_id = ? AND date >= ? AND status = 'active' ORDER BY date, time"
  ).all(userId, today) as { id: number; date: string; time: string }[];
}

// ─── ADMIN ACTIONS ─────────────────────────────────

export async function adminGetAppointments(date: string) {
  const cookieStore = await cookies();
  if (!cookieStore.get('adminId')?.value) return { error: 'Não autorizado.' };

  const rows = db.prepare(`
    SELECT a.id, a.time, a.status, u.name AS patient_name, u.cpf AS patient_cpf
    FROM appointments a
    JOIN users u ON a.user_id = u.id
    WHERE a.date = ?
    ORDER BY a.time
  `).all(date) as any[];

  return { appointments: rows };
}

export async function adminCancelAppointment(appointmentId: number) {
  const cookieStore = await cookies();
  if (!cookieStore.get('adminId')?.value) return { error: 'Não autorizado.' };

  const appt = db.prepare(
    "SELECT id FROM appointments WHERE id = ? AND status = 'active'"
  ).get(appointmentId) as any;
  if (!appt) return { error: 'Consulta não encontrada ou já cancelada.' };

  db.prepare("UPDATE appointments SET status = 'cancelled' WHERE id = ?").run(appointmentId);
  return { success: true };
}
