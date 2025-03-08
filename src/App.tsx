import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';
import { RCAAppShell } from './layout/RCAAppShell';
import { UserProvider } from './contexts/UserContext';
import { ProjectProvider } from './contexts/ProjectContext';
import { SignInDialog } from './components/SignInDialog';
import './App.css';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <UserProvider>
        <ProjectProvider>
          <RCAAppShell />
          <SignInDialog />
        </ProjectProvider>
      </UserProvider>
    </ThemeProvider>
  );
}

export default App;
