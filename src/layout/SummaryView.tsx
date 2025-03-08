import { Box, Typography, Paper } from '@mui/material';
import SummarizeOutlinedIcon from '@mui/icons-material/SummarizeOutlined';
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
    paperBg: isDarkMode ? 'rgba(45, 45, 45, 0.8)' : 'rgba(255, 255, 255, 0.9)' // Paper background
  };
};

export function SummaryView() {
  const { isDarkMode } = useTheme();
  const COLORS = getViewColors(isDarkMode);

  return (
    <Box 
      sx={{ 
        height: '100%', 
        width: '100%',
        position: 'relative',
        backgroundColor: COLORS.background,
        overflow: 'auto',
        flexGrow: 1,
      }}
    >
      <Box 
        sx={{ 
          height: '100%',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2,
        }}
      >
        <Paper 
          elevation={0} 
          sx={{ 
            p: 4, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            border: `1px dashed ${COLORS.border}`,
            borderRadius: 1,
            backgroundColor: COLORS.paperBg,
            maxWidth: 500,
          }}
        >
          <SummarizeOutlinedIcon sx={{ fontSize: 48, color: COLORS.iconColor, mb: 2, opacity: 0.6 }} />
          <Typography variant="h6" sx={{ color: COLORS.text, mb: 1 }}>
            Summary View
          </Typography>
          <Typography variant="body2" sx={{ color: COLORS.lightText, textAlign: 'center' }}>
            This view will provide a concise summary of your analysis.
            <br />
            Key findings and recommendations will be highlighted here.
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
} 