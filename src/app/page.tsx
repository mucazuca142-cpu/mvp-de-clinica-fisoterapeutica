import { getUser } from './actions';
import AuthScreen from './components/AuthScreen';
import Dashboard from './components/Dashboard';

export default async function Home() {
  const user = await getUser();

  if (!user) return <AuthScreen />;
  return <Dashboard user={user} />;
}
