import React, { useRef, useEffect } from 'react';
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
import { getThemeColors } from '../constants/themeColors';

interface NodeTypeTrayProps {
  open: boolean;
  onClose: () => void;
  onSelectNodeType: (type: NodeType) => void;
}

export function NodeTypeTray({ open, onClose, onSelectNodeType }: NodeTypeTrayProps) {
  const { isDarkMode } = useTheme();
  const [searchTerm, setSearchTerm] = React.useState('');
  const trayRef = useRef<HTMLDivElement>(null);
  
  const COLORS = getThemeColors(isDarkMode);
  
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
  
  // Click outside handler
  useEffect(() => {
    if (!open) return;
    
    const handleClickOutside = (event: MouseEvent) => {
      if (trayRef.current && !trayRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open, onClose]);
  
  return (
    <Collapse in={open} orientation="vertical">
      <Paper
        ref={trayRef}
        elevation={4}
        sx={{
          position: 'absolute',
          right: 58, // Positioned to the left of the toolbar
          top: 0,
          width: 240,
          backgroundColor: COLORS.dialogBg,
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
            <CloseIcon fontSize="small" sx={{ color: COLORS.iconColor }} />
          </IconButton>
        </Box>
        
        <Box sx={{ p: 1.5 }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            backgroundColor: COLORS.inputBg,
            borderRadius: 1,
            px: 1.5
          }}>
            <SearchIcon fontSize="small" sx={{ color: COLORS.iconColor, mr: 1 }} />
            <InputBase
              placeholder="Search node types..."
              value={searchTerm}
              onChange={handleSearchChange}
              fullWidth
              sx={{ 
                fontSize: '0.875rem',
                color: COLORS.text,
                '& input::placeholder': {
                  color: COLORS.lightText,
                  opacity: 1
                }
              }}
            />
          </Box>
        </Box>
        
        <Stack sx={{ maxHeight: 300, overflow: 'auto' }}>
          {filteredNodeTypes.map(nodeType => (
            <Box
              key={nodeType.type}
              onClick={() => handleNodeTypeClick(nodeType.type)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                py: 1,
                px: 1.5,
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: COLORS.hoverBg
                }
              }}
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
                <Typography variant="caption" sx={{ color: COLORS.lightText }}>
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
              <Typography variant="body2" sx={{ color: COLORS.lightText }}>
                No node types match your search
              </Typography>
            </Box>
          )}
        </Stack>
      </Paper>
    </Collapse>
  );
} 