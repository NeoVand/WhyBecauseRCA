import { 
  Box, 
  Typography, 
  TextField,
  Tooltip,
  Collapse
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CodeOutlinedIcon from '@mui/icons-material/CodeOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

// Function to get colors based on current theme
const getSidebarColors = (isDarkMode: boolean) => {
  return {
    activeTab: isDarkMode ? '#e0e0e0' : '#666666',               // Active tab color
    inactiveTab: isDarkMode ? '#777777' : '#bbbbbb',             // Inactive tab color
    iconColor: isDarkMode ? '#b0b0b0' : '#999999',               // Icon color
    text: isDarkMode ? '#e0e0e0' : '#666666',                    // Text color
    lightText: isDarkMode ? '#a0a0a0' : '#999999',               // Light text color
    background: isDarkMode ? '#1e1e1e' : '#ffffff',              // Background color
    border: isDarkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)', // Border color
    hoverBg: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)', // Hover background
    inputBg: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#ffffff', // Input background
    focusBorder: isDarkMode ? '#a0a0a0' : '#666666',             // Focus border color
  };
};

export function ProjectSettings() {
  const { isDarkMode } = useTheme();
  const COLORS = getSidebarColors(isDarkMode);
  const [expandedPanel, setExpandedPanel] = useState<string | false>('panel1');

  const handlePanelToggle = (panel: string) => {
    setExpandedPanel(expandedPanel === panel ? false : panel);
  };
  
  return (
    <Box sx={{ px: 0 }}>
      {/* Project Info Panel */}
      <Box sx={{ borderBottom: `1px solid ${COLORS.border}` }}>
        <Box 
          sx={{ 
            p: 1.5,
            cursor: 'pointer',
            '&:hover': {
              backgroundColor: COLORS.hoverBg
            }
          }}
          onClick={() => handlePanelToggle('panel1')}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CodeOutlinedIcon sx={{ color: COLORS.iconColor, mr: 1, fontSize: 18 }} />
            <Typography sx={{ color: COLORS.text, fontWeight: 500, fontSize: '0.875rem' }}>
              Project Info
            </Typography>
            <Box sx={{ flexGrow: 1 }} />
            {expandedPanel === 'panel1' ? (
              <KeyboardArrowUpIcon sx={{ color: COLORS.iconColor, fontSize: 20 }} />
            ) : (
              <KeyboardArrowDownIcon sx={{ color: COLORS.iconColor, fontSize: 20 }} />
            )}
          </Box>
        </Box>
        <Collapse in={expandedPanel === 'panel1'}>
          <Box sx={{ p: 1.5, pt: 0 }}>
            <Box sx={{ mb: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography 
                  component="label"
                  sx={{ 
                    fontSize: '0.75rem', 
                    color: COLORS.text,
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  Project Name
                  <Tooltip title="The name of your project">
                    <InfoOutlinedIcon sx={{ fontSize: 14, ml: 0.5, color: COLORS.lightText }} />
                  </Tooltip>
                </Typography>
              </Box>
              <TextField
                fullWidth
                size="small"
                placeholder="Enter project name"
                defaultValue="New Project"
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: COLORS.border,
                    },
                    '&:hover fieldset': {
                      borderColor: COLORS.border,
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: COLORS.focusBorder,
                    },
                    backgroundColor: COLORS.inputBg,
                  },
                  '& .MuiInputBase-input': {
                    color: COLORS.text,
                  },
                  '& .MuiInputLabel-root': {
                    color: COLORS.lightText,
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: COLORS.focusBorder,
                  },
                }}
              />
            </Box>
            
            <Box sx={{ mb: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography 
                  component="label"
                  sx={{ 
                    fontSize: '0.75rem', 
                    color: COLORS.text,
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  Description
                  <Tooltip title="A brief description of your project">
                    <InfoOutlinedIcon sx={{ fontSize: 14, ml: 0.5, color: COLORS.lightText }} />
                  </Tooltip>
                </Typography>
              </Box>
              <TextField
                fullWidth
                multiline
                rows={2}
                size="small"
                placeholder="Enter project description"
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: COLORS.border,
                    },
                    '&:hover fieldset': {
                      borderColor: COLORS.border,
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: COLORS.focusBorder,
                    },
                    backgroundColor: COLORS.inputBg,
                  },
                  '& .MuiInputBase-input': {
                    color: COLORS.text,
                  },
                }}
              />
            </Box>
          </Box>
        </Collapse>
      </Box>

      {/* Analysis Settings Panel */}
      <Box sx={{ borderBottom: `1px solid ${COLORS.border}` }}>
        <Box 
          sx={{ 
            p: 1.5,
            cursor: 'pointer',
            '&:hover': {
              backgroundColor: COLORS.hoverBg
            }
          }}
          onClick={() => handlePanelToggle('panel2')}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <DescriptionOutlinedIcon sx={{ color: COLORS.iconColor, mr: 1, fontSize: 18 }} />
            <Typography sx={{ color: COLORS.text, fontWeight: 500, fontSize: '0.875rem' }}>
              Analysis Settings
            </Typography>
            <Box sx={{ flexGrow: 1 }} />
            {expandedPanel === 'panel2' ? (
              <KeyboardArrowUpIcon sx={{ color: COLORS.iconColor, fontSize: 20 }} />
            ) : (
              <KeyboardArrowDownIcon sx={{ color: COLORS.iconColor, fontSize: 20 }} />
            )}
          </Box>
        </Box>
        <Collapse in={expandedPanel === 'panel2'}>
          <Box sx={{ p: 1.5, pt: 0 }}>
            <Typography sx={{ fontSize: '0.875rem', color: COLORS.lightText, fontStyle: 'italic' }}>
              Analysis settings will appear here as your project develops.
            </Typography>
          </Box>
        </Collapse>
      </Box>
    </Box>
  );
} 