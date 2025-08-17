import ReduxProvider from "../redux/redux-provider";
import AuthGuard from "./components/auth-guard";
import useAuth from "./hooks/useAuth";
import Login from "./pages/auth/login";
import { Toaster } from "sonner";
import Index from "./pages/chat";

function AppInner() {
  const { isAuthenticated } = useAuth();

  return (
    <AuthGuard requireAuth={false}>
      {isAuthenticated ? <Index /> : <Login />}
    </AuthGuard>
  );
}

const App = () => {
  return (
    <ReduxProvider>
      <AppInner />
      <Toaster />
    </ReduxProvider>
  );
};

export default App;
