import { Box } from '@mui/material';
import { useTheme } from '../contexts/ThemeContext';
import { GraphProvider } from '../contexts/GraphContext';
import { ToolbarProvider } from '../contexts/ToolbarContext';
import CausalGraph from '../graph/CausalGraph';
import { useProject } from '../contexts/ProjectContext';

// Function to get colors based on current theme
const getViewColors = (isDarkMode: boolean) => {
  return {
    activeTab: isDarkMode ? '#e0e0e0' : '#666666',              // Active tab color
    inactiveTab: isDarkMode ? '#777777' : '#bbbbbb',            // Inactive tab color
    iconColor: isDarkMode ? '#b0b0b0' : '#999999',              // Icon color
    text: isDarkMode ? '#e0e0e0' : '#666666',                   // Text color
    lightText: isDarkMode ? '#a0a0a0' : '#999999',              // Light text color
    background: isDarkMode ? '#1e1e1e' : '#ffffff',             // Background color
    border: isDarkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)', // Border color
    gridDot: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)', // Grid dots
    diagramBg: isDarkMode ? '#121212' : '#ffffff'               // Diagram background
  };
};

// Export the providers for use in global context
export const DiagramContextProviders = ({ children }: { children: React.ReactNode }) => {
  // Check if we have a current project
  const { currentProject } = useProject();
  
  if (!currentProject) {
    return (
      <Box 
        sx={{ 
          height: '100%', 
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#121212',
          color: '#a0a0a0'
        }}
      >
        <div>No project selected. Please create or open a project.</div>
      </Box>
    );
  }
  
  return (
    <ToolbarProvider>
      <GraphProvider>
        {children}
      </GraphProvider>
    </ToolbarProvider>
  );
};

export function DiagramView() {
  const { isDarkMode } = useTheme();
  const COLORS = getViewColors(isDarkMode);

  return (
    <Box 
      sx={{ 
        height: '100%', 
        width: '100%',
        position: 'relative',
        backgroundImage: `
          radial-gradient(${COLORS.gridDot} 1px, transparent 1px),
          radial-gradient(${COLORS.gridDot} 1px, transparent 1px)
        `,
        backgroundSize: '10px 10px',
        backgroundColor: COLORS.diagramBg,
        overflow: 'auto',
        flexGrow: 1,
      }}
    >
      <CausalGraph />
    </Box>
  );
} 