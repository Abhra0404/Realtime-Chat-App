import Login from "./pages/Login";
import Chat from "./pages/Chat";
import { useAuth } from "./hooks/useAuth";

export default function App() {
  const { user, token, isLoading, login, register, logout } = useAuth();

  if (isLoading) {
    return (
      <div className="grid min-h-screen place-items-center text-sm text-[var(--text-subtle)]">
        Loading PulseChat...
      </div>
    );
  }

  if (!user || !token) {
    return <Login onLogin={login} onRegister={register} />;
  }

  return <Chat token={token} user={user} onLogout={logout} />;
}
