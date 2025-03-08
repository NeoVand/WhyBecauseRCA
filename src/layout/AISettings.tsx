import { 
  Box, 
  Typography, 
  FormControl, 
  Select, 
  MenuItem, 
  Tooltip,
  Collapse
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import SummarizeOutlinedIcon from '@mui/icons-material/SummarizeOutlined';
import DeveloperBoardOutlinedIcon from '@mui/icons-material/DeveloperBoardOutlined';
import SpeakerNotesOutlinedIcon from '@mui/icons-material/SpeakerNotesOutlined';
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
    selectBg: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#ffffff', // Select background
    focusBorder: isDarkMode ? '#a0a0a0' : '#666666',             // Focus border color
    agent5Whys: '#2196f3'       // Blue color for 5-Whys agent (same in both modes)
  };
};

export function AISettings() {
  const { isDarkMode } = useTheme();
  const COLORS = getSidebarColors(isDarkMode);
  const [expandedPanel, setExpandedPanel] = useState<string | false>('panel1');
  const [selectedTab, setSelectedTab] = useState('diagram');
  const [selectedAgent, setSelectedAgent] = useState('5-whys');

  const handlePanelToggle = (panel: string) => {
    setExpandedPanel(expandedPanel === panel ? false : panel);
  };

  return (
    <Box sx={{ px: 0 }}>
      {/* Agent Settings Panel */}
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
            <SmartToyOutlinedIcon sx={{ color: COLORS.iconColor, mr: 1, fontSize: 18 }} />
            <Typography sx={{ color: COLORS.text, fontWeight: 500, fontSize: '0.875rem' }}>
              Agent Settings
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
            {/* Tab Selection */}
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
                  Tab
                  <Tooltip title="Select which tab this agent should assist with">
                    <InfoOutlinedIcon sx={{ fontSize: 14, ml: 0.5, color: COLORS.lightText }} />
                  </Tooltip>
                </Typography>
              </Box>
              <FormControl fullWidth size="small">
                <Select
                  value={selectedTab}
                  onChange={(e) => setSelectedTab(e.target.value)}
                  displayEmpty
                  sx={{
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: COLORS.border,
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: COLORS.border,
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: COLORS.focusBorder,
                    },
                    backgroundColor: COLORS.selectBg,
                    color: COLORS.text,
                    '& .MuiSvgIcon-root': {
                      color: COLORS.iconColor
                    }
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        backgroundColor: isDarkMode ? '#2d2d2d' : '#ffffff',
                        borderColor: COLORS.border,
                        '& .MuiMenuItem-root': {
                          color: COLORS.text
                        },
                        '& .MuiMenuItem-root:hover': {
                          backgroundColor: COLORS.hoverBg
                        }
                      }
                    }
                  }}
                >
                  <MenuItem value="diagram">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <AccountTreeOutlinedIcon sx={{ fontSize: 16, mr: 1, color: COLORS.iconColor }} />
                      <Typography sx={{ fontSize: '0.875rem', color: COLORS.text }}>Diagram</Typography>
                    </Box>
                  </MenuItem>
                  <MenuItem value="report">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <ArticleOutlinedIcon sx={{ fontSize: 16, mr: 1, color: COLORS.iconColor }} />
                      <Typography sx={{ fontSize: '0.875rem', color: COLORS.text }}>Report</Typography>
                    </Box>
                  </MenuItem>
                  <MenuItem value="summary">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <SummarizeOutlinedIcon sx={{ fontSize: 16, mr: 1, color: COLORS.iconColor }} />
                      <Typography sx={{ fontSize: '0.875rem', color: COLORS.text }}>Summary</Typography>
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Agent Type Selection */}
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
                  Agent Type
                  <Tooltip title="Choose which type of AI agent to use">
                    <InfoOutlinedIcon sx={{ fontSize: 14, ml: 0.5, color: COLORS.lightText }} />
                  </Tooltip>
                </Typography>
              </Box>
              <FormControl fullWidth size="small">
                <Select
                  value={selectedAgent}
                  onChange={(e) => setSelectedAgent(e.target.value)}
                  displayEmpty
                  sx={{
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: COLORS.border,
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: COLORS.border,
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: COLORS.focusBorder,
                    },
                    backgroundColor: COLORS.selectBg,
                    color: COLORS.text,
                    '& .MuiSvgIcon-root': {
                      color: COLORS.iconColor
                    }
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        backgroundColor: isDarkMode ? '#2d2d2d' : '#ffffff',
                        borderColor: COLORS.border,
                        '& .MuiMenuItem-root': {
                          color: COLORS.text
                        },
                        '& .MuiMenuItem-root:hover': {
                          backgroundColor: COLORS.hoverBg
                        }
                      }
                    }
                  }}
                >
                  <MenuItem value="5-whys">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <DeveloperBoardOutlinedIcon sx={{ fontSize: 16, mr: 1, color: COLORS.agent5Whys }} />
                      <Typography sx={{ fontSize: '0.875rem', color: COLORS.text }}>5-Whys Analysis</Typography>
                    </Box>
                  </MenuItem>
                  <MenuItem value="explainer">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <SpeakerNotesOutlinedIcon sx={{ fontSize: 16, mr: 1, color: COLORS.iconColor }} />
                      <Typography sx={{ fontSize: '0.875rem', color: COLORS.text }}>Explainer</Typography>
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
        </Collapse>
      </Box>

      {/* Model Settings Panel */}
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
            <DeveloperBoardOutlinedIcon sx={{ color: COLORS.iconColor, mr: 1, fontSize: 18 }} />
            <Typography sx={{ color: COLORS.text, fontWeight: 500, fontSize: '0.875rem' }}>
              Model Settings
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
            {/* Model settings content */}
          </Box>
        </Collapse>
      </Box>

      {/* Prompt Template Panel */}
      <Box sx={{ borderBottom: `1px solid ${COLORS.border}` }}>
        <Box 
          sx={{ 
            p: 1.5,
            cursor: 'pointer',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.02)'
            }
          }}
          onClick={() => handlePanelToggle('panel3')}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <SpeakerNotesOutlinedIcon sx={{ color: COLORS.iconColor, mr: 1, fontSize: 18 }} />
            <Typography sx={{ color: COLORS.text, fontWeight: 500, fontSize: '0.875rem' }}>
              Prompt Template
            </Typography>
            {expandedPanel === 'panel3' ? (
              <KeyboardArrowUpIcon sx={{ ml: 'auto', color: COLORS.iconColor, fontSize: 18 }} />
            ) : (
              <KeyboardArrowDownIcon sx={{ ml: 'auto', color: COLORS.iconColor, fontSize: 18 }} />
            )}
          </Box>
        </Box>
        
        <Collapse in={expandedPanel === 'panel3'}>
          <Box sx={{ p: 1.5 }}>
            {/* Prompt template content */}
          </Box>
        </Collapse>
      </Box>
    </Box>
  );
} 