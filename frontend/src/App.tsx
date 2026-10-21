import "./App.css";
import AppRouter from "./Router";
import { AuthProvider } from "./utils/auth/AuthContext";
import { DeskRoleProvider } from "./utils/access/DeskRoleProvider";
import { ThemeModeProvider } from "./utils/theme/ThemeMode";
import { ErrorBoundary } from "./components/ErrorBoundary";

function App() {
  return (
    <ErrorBoundary>
      <ThemeModeProvider>
        <AuthProvider>
          <DeskRoleProvider>
            <AppRouter />
          </DeskRoleProvider>
        </AuthProvider>
      </ThemeModeProvider>
    </ErrorBoundary>
  );
}

export default App;
