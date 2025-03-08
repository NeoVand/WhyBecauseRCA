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

export function ProjectSettings() {
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
              backgroundColor: 'rgba(0, 0, 0, 0.02)'
            }
          }}
          onClick={() => handlePanelToggle('panel1')}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CodeOutlinedIcon sx={{ color: COLORS.iconColor, mr: 1, fontSize: 18 }} />
            <Typography sx={{ color: COLORS.text, fontWeight: 500, fontSize: '0.875rem' }}>
              Project Info
            </Typography>
            {expandedPanel === 'panel1' ? (
              <KeyboardArrowUpIcon sx={{ ml: 'auto', color: COLORS.iconColor, fontSize: 18 }} />
            ) : (
              <KeyboardArrowDownIcon sx={{ ml: 'auto', color: COLORS.iconColor, fontSize: 18 }} />
            )}
          </Box>
        </Box>
        
        <Collapse in={expandedPanel === 'panel1'}>
          <Box sx={{ p: 1.5 }}>
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
                size="small"
                placeholder="Enter description"
                variant="outlined"
                multiline
                rows={3}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: COLORS.border,
                    },
                    '&:hover fieldset': {
                      borderColor: COLORS.border,
                    },
                  },
                }}
              />
            </Box>
          </Box>
        </Collapse>
      </Box>
      
      {/* Other Panel */}
      <Box sx={{ borderBottom: `1px solid ${COLORS.border}` }}>
        <Box 
          sx={{ 
            p: 1.5,
            cursor: 'pointer',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.02)'
            }
          }}
          onClick={() => handlePanelToggle('panel2')}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <DescriptionOutlinedIcon sx={{ color: COLORS.iconColor, mr: 1, fontSize: 18 }} />
            <Typography sx={{ color: COLORS.text, fontWeight: 500, fontSize: '0.875rem' }}>
              Some Other Panel
            </Typography>
            {expandedPanel === 'panel2' ? (
              <KeyboardArrowUpIcon sx={{ ml: 'auto', color: COLORS.iconColor, fontSize: 18 }} />
            ) : (
              <KeyboardArrowDownIcon sx={{ ml: 'auto', color: COLORS.iconColor, fontSize: 18 }} />
            )}
          </Box>
        </Box>
        
        <Collapse in={expandedPanel === 'panel2'}>
          <Box sx={{ p: 1.5 }}>
            {/* Other panel content */}
          </Box>
        </Collapse>
      </Box>
    </Box>
  );
} 