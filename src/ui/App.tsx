import { Toaster } from "sonner";
import ReduxProvider from "../redux/redux-provider";
import AuthGuard from "./components/auth-guard";
import ErrorBoundary from "./components/error-boundary";
import useAuth from "./hooks/useAuth";
import Login from "./pages/auth/login";
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
    <ErrorBoundary>
      <ReduxProvider>
        <AppInner />
        <Toaster />
      </ReduxProvider>
    </ErrorBoundary>
  );
};

export default App;
