import React from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  IconButton, 
  Stack, 
  Collapse
} from '@mui/material';
import { NodeType, NODE_TYPES } from '../models/types';
import { useTheme } from '../contexts/ThemeContext';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import InputBase from '@mui/material/InputBase';

interface NodeTypeTrayProps {
  open: boolean;
  onClose: () => void;
  onSelectNodeType: (type: NodeType) => void;
}

export function NodeTypeTray({ open, onClose, onSelectNodeType }: NodeTypeTrayProps) {
  const { isDarkMode } = useTheme();
  const [searchTerm, setSearchTerm] = React.useState('');
  
  const getColors = (isDark: boolean) => ({
    background: isDark ? '#333333' : '#ffffff',
    border: isDark ? '#555555' : '#dddddd',
    text: isDark ? '#e0e0e0' : '#333333',
    secondaryText: isDark ? '#aaaaaa' : '#666666',
    hoverBg: isDark ? '#444444' : '#f5f5f5',
    iconBg: isDark ? '#444444' : '#f0f0f0'
  });
  
  const COLORS = getColors(isDarkMode);
  
  const filteredNodeTypes = React.useMemo(() => {
    if (!searchTerm) return Object.values(NODE_TYPES);
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    return Object.values(NODE_TYPES).filter(nodeType => 
      nodeType.name.toLowerCase().includes(lowerSearchTerm)
    );
  }, [searchTerm]);
  
  const handleNodeTypeClick = (type: NodeType) => {
    onSelectNodeType(type);
    onClose();
    setSearchTerm('');
  };
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  // Reset search when tray closes
  React.useEffect(() => {
    if (!open) {
      setSearchTerm('');
    }
  }, [open]);
  
  return (
    <Collapse in={open} orientation="vertical">
      <Paper
        elevation={4}
        sx={{
          position: 'absolute',
          right: 58, // Positioned to the left of the toolbar
          top: 0,
          width: 240,
          backgroundColor: COLORS.background,
          border: `1px solid ${COLORS.border}`,
          zIndex: 100,
          borderRadius: 2,
          overflow: 'hidden'
        }}
      >
        <Box sx={{ 
          p: 1.5, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          borderBottom: `1px solid ${COLORS.border}`
        }}>
          <Typography variant="subtitle2" sx={{ color: COLORS.text, fontWeight: 600 }}>
            Select Node Type
          </Typography>
          <IconButton size="small" onClick={onClose}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
        
        <Box sx={{ p: 1.5, borderBottom: `1px solid ${COLORS.border}` }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            backgroundColor: COLORS.iconBg,
            borderRadius: 1,
            px: 1.5
          }}>
            <SearchIcon fontSize="small" sx={{ color: COLORS.secondaryText, mr: 1 }} />
            <InputBase
              placeholder="Search node types..."
              value={searchTerm}
              onChange={handleSearchChange}
              sx={{ 
                fontSize: '0.875rem', 
                flex: 1,
                color: COLORS.text
              }}
              autoFocus
            />
          </Box>
        </Box>
        
        <Stack sx={{ maxHeight: 280, overflowY: 'auto', p: 1 }} spacing={0.5}>
          {filteredNodeTypes.map((nodeType) => (
            <Box
              key={nodeType.type}
              sx={{
                display: 'flex',
                alignItems: 'center',
                p: 1,
                borderRadius: 1,
                cursor: 'pointer',
                '&:hover': { backgroundColor: COLORS.hoverBg }
              }}
              onClick={() => handleNodeTypeClick(nodeType.type)}
            >
              <Box 
                sx={{ 
                  width: 32, 
                  height: 32, 
                  borderRadius: '50%', 
                  backgroundColor: `${nodeType.color}22`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: 2
                }}
              >
                <span className="material-icons" style={{ color: nodeType.color }}>
                  {nodeType.icon}
                </span>
              </Box>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 500, color: COLORS.text }}>
                  {nodeType.name}
                </Typography>
                <Typography variant="caption" sx={{ color: COLORS.secondaryText }}>
                  {nodeType.type === 'problem' || nodeType.type === 'incident' 
                    ? 'Mishap type' 
                    : nodeType.type === 'event' || nodeType.type === 'condition' 
                      ? 'Cause type' 
                      : 'Basic type'}
                </Typography>
              </Box>
            </Box>
          ))}
          
          {filteredNodeTypes.length === 0 && (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: COLORS.secondaryText }}>
                No node types match your search
              </Typography>
            </Box>
          )}
        </Stack>
      </Paper>
    </Collapse>
  );
} 