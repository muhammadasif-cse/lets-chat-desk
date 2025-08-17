import ReduxProvider from "../redux/redux-provider";
import AuthGuard from "./components/auth-guard";
import useAuth from "./hooks/useAuth";
import Login from "./pages/auth/login";
import { Toaster } from "sonner";
import Index from "./pages/chat";

function AppInner() {
  const { getAuthInfo } = useAuth();
  const authInfo = getAuthInfo();

  return (
    <AuthGuard requireAuth={false}>
      {authInfo.access_token ? <Index /> : <Login />}
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
