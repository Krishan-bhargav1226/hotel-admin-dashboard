import "./App.css";
import AppRouter from "./Router";
import { ThemeModeProvider } from "./utils/theme/ThemeMode";

function App() {
  return (
    <ThemeModeProvider>
      <AppRouter />
    </ThemeModeProvider>
  );
}

export default App;
