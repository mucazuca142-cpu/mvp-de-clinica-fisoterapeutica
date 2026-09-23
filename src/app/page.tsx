import { getUser } from './actions';
import AuthScreen from './components/AuthScreen';
import Dashboard from './components/Dashboard';

export default async function Home() {
  const user = await getUser();

  return (
    <main className="container">
      {!user ? (
        <AuthScreen />
      ) : (
        <Dashboard user={user} />
      )}
    </main>
  );
}
