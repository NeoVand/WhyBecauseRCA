import { Box, Typography, Paper } from '@mui/material';
import SummarizeOutlinedIcon from '@mui/icons-material/SummarizeOutlined';

// Custom colors based on the design screenshot
const COLORS = {
  activeTab: '#666666',       // Darker gray for active tab
  inactiveTab: '#bbbbbb',     // Lighter gray for inactive tab
  iconColor: '#999999',       // Icon color
  text: '#666666',            // Text color
  lightText: '#999999',       // Light text color
  background: '#ffffff',      // White background
  border: 'rgba(0, 0, 0, 0.12)' // Border color
};

export function SummaryView() {
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
            backgroundColor: 'rgba(255,255,255,0.9)',
            maxWidth: 500,
          }}
        >
          <SummarizeOutlinedIcon sx={{ fontSize: 48, color: COLORS.iconColor, mb: 2, opacity: 0.6 }} />
          <Typography variant="h6" sx={{ color: COLORS.text, mb: 1 }}>
            Summary View
          </Typography>
          <Typography variant="body2" sx={{ color: COLORS.lightText, textAlign: 'center' }}>
            This is where the summary of the RCA will be displayed.
            <br />
            The summary will provide a concise overview of key findings.
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
} 