import { getAdminUser } from '../actions';
import AdminAuthScreen from '../components/AdminAuthScreen';
import AdminDashboard from '../components/AdminDashboard';

export default async function AdminPage() {
  const admin = await getAdminUser();

  return (
    <main>
      {!admin ? <AdminAuthScreen /> : <AdminDashboard admin={admin} />}
    </main>
  );
}
