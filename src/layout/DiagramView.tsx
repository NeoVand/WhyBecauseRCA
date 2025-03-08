import { Box, Typography } from '@mui/material';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import { useTheme } from '../contexts/ThemeContext';

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
      {/* Empty state / placeholder */}
      <Box 
        sx={{ 
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: 0.7,
        }}
      >
        <AccountTreeOutlinedIcon 
          sx={{ 
            fontSize: 64,
            color: COLORS.lightText,
            mb: 2
          }} 
        />
        <Typography variant="h6" sx={{ color: COLORS.lightText }}>
          Your RCA diagram will appear here
        </Typography>
        <Typography variant="body2" sx={{ color: COLORS.lightText, mt: 1 }}>
          Use the toolbar to add nodes and connections
        </Typography>
      </Box>
    </Box>
  );
} 