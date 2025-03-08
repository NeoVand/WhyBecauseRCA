import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';
import { RCAAppShell } from './layout/RCAAppShell';
import './App.css';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <RCAAppShell />
    </ThemeProvider>
  );
}

export default App;
