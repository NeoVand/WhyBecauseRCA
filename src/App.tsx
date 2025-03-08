import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { RCAAppShell } from './layout/RCAAppShell';
import { UserProvider } from './contexts/UserContext';
import { ProjectProvider } from './contexts/ProjectContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { SignInDialog } from './components/SignInDialog';
import { createAppTheme } from './theme';
import './App.css';

// AppContent component that uses the theme context
function AppContent() {
  // Get the current theme mode from context
  const { mode } = useTheme();
  
  // Create the MUI theme based on the current mode
  const theme = createAppTheme(mode);
  
  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline /> {/* Applies the theme's baseline styles */}
      <UserProvider>
        <ProjectProvider>
          <RCAAppShell />
          <SignInDialog />
        </ProjectProvider>
      </UserProvider>
    </MuiThemeProvider>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
