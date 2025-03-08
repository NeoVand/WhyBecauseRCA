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

// Custom colors based on the design screenshot
const COLORS = {
  activeTab: '#666666',       // Darker gray for active tab
  inactiveTab: '#bbbbbb',     // Lighter gray for inactive tab
  iconColor: '#999999',       // Icon color
  text: '#666666',            // Text color
  lightText: '#999999',       // Light text color
  background: '#ffffff',      // White background
  border: 'rgba(0, 0, 0, 0.12)', // Border color
  agent5Whys: '#2196f3'       // Blue color for 5-Whys agent
};

export function AISettings() {
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
              backgroundColor: 'rgba(0, 0, 0, 0.02)'
            }
          }}
          onClick={() => handlePanelToggle('panel1')}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <SmartToyOutlinedIcon sx={{ color: COLORS.iconColor, mr: 1, fontSize: 18 }} />
            <Typography sx={{ color: COLORS.text, fontWeight: 500, fontSize: '0.875rem' }}>
              Agent Settings
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
                  Tab
                  <Tooltip title="Tab information">
                    <InfoOutlinedIcon sx={{ fontSize: 14, ml: 0.5, color: COLORS.lightText }} />
                  </Tooltip>
                </Typography>
              </Box>
              <FormControl fullWidth size="small">
                <Select
                  value={selectedTab}
                  onChange={(e) => setSelectedTab(e.target.value)}
                  sx={{ 
                    color: COLORS.text,
                    fontSize: '0.875rem',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: COLORS.border,
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: COLORS.border,
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: COLORS.border,
                      borderWidth: '1px',
                    },
                  }}
                  IconComponent={(props) => <KeyboardArrowDownIcon {...props} fontSize="small" />}
                >
                  <MenuItem value="diagram">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <AccountTreeOutlinedIcon sx={{ fontSize: 16, mr: 1, color: COLORS.iconColor }} />
                      <Typography sx={{ fontSize: '0.875rem' }}>Diagram</Typography>
                    </Box>
                  </MenuItem>
                  <MenuItem value="report">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <ArticleOutlinedIcon sx={{ fontSize: 16, mr: 1, color: COLORS.iconColor }} />
                      <Typography sx={{ fontSize: '0.875rem' }}>Report</Typography>
                    </Box>
                  </MenuItem>
                  <MenuItem value="summary">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <SummarizeOutlinedIcon sx={{ fontSize: 16, mr: 1, color: COLORS.iconColor }} />
                      <Typography sx={{ fontSize: '0.875rem' }}>Summary</Typography>
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
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
                  Agent
                  <Tooltip title="Agent information">
                    <InfoOutlinedIcon sx={{ fontSize: 14, ml: 0.5, color: COLORS.lightText }} />
                  </Tooltip>
                </Typography>
              </Box>
              <FormControl fullWidth size="small">
                <Select
                  value={selectedAgent}
                  onChange={(e) => setSelectedAgent(e.target.value)}
                  sx={{ 
                    color: COLORS.text,
                    fontSize: '0.875rem',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: COLORS.border,
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: COLORS.border,
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: COLORS.border,
                      borderWidth: '1px',
                    },
                  }}
                  IconComponent={(props) => <KeyboardArrowDownIcon {...props} fontSize="small" />}
                >
                  <MenuItem value="5-whys">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <SmartToyOutlinedIcon sx={{ fontSize: 16, mr: 1, color: COLORS.agent5Whys }} />
                      <Typography sx={{ fontSize: '0.875rem' }}>5-Whys</Typography>
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