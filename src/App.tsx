import { ThemeProvider } from "@mui/material";
import "./App.css";
import AppRouter from "./Router";
import { colorTheme } from "./utils/theme/colorTheme";

function App() {
  return (
    <ThemeProvider theme={colorTheme}>
      <AppRouter />
    </ThemeProvider>
  );
}
export default App;
