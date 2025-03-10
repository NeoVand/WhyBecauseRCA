import { memo, useState, FC } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Box, Typography, IconButton, TextField, Paper } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import EditIcon from '@mui/icons-material/Edit';
import { useTheme } from '../contexts/ThemeContext';
import { useGraph } from '../contexts/GraphContext';

// Get colors based on current theme
const getNodeColors = (isDarkMode: boolean) => {
  return {
    nodeBg: isDarkMode ? '#2a2a2a' : '#ffffff',
    nodeText: isDarkMode ? '#e0e0e0' : '#444444',
    nodeBorder: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
    handleBg: isDarkMode ? '#555555' : '#cccccc',
    handleBorder: isDarkMode ? '#888888' : '#999999',
    hoverState: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
    selectedBorder: isDarkMode ? '#90caf9' : '#1976d2',
  };
};

const CausalNode: FC<NodeProps> = ({ id, data, selected }) => {
  const { isDarkMode } = useTheme();
  const { updateNodeLabel } = useGraph();
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(data.label);

  const COLORS = getNodeColors(isDarkMode);

  // Handle save of edited label
  const handleSave = () => {
    updateNodeLabel(id, label);
    setIsEditing(false);
  };

  // Handle pressing Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        minWidth: 150,
        maxWidth: 250,
        borderRadius: 2,
        padding: 1,
        backgroundColor: COLORS.nodeBg,
        border: `2px solid ${selected ? COLORS.selectedBorder : COLORS.nodeBorder}`,
        transition: 'border-color 0.2s',
        '&:hover': {
          boxShadow: 4,
          backgroundColor: COLORS.hoverState,
        },
      }}
    >
      {/* Source handle (output) */}
      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          background: COLORS.handleBg,
          border: `1px solid ${COLORS.handleBorder}`,
          borderRadius: 6,
          height: 12,
          width: 12,
        }}
      />

      {/* Node content */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {isEditing ? (
          <TextField
            autoFocus
            variant="outlined"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onKeyDown={handleKeyDown}
            size="small"
            fullWidth
            sx={{
              '& .MuiOutlinedInput-root': {
                color: COLORS.nodeText,
                fontSize: '0.9rem',
              },
            }}
          />
        ) : (
          <Typography
            variant="body1"
            sx={{
              color: COLORS.nodeText,
              fontWeight: 'medium',
              wordWrap: 'break-word',
              fontSize: '0.9rem',
              flexGrow: 1,
              px: 1,
            }}
          >
            {data.label}
          </Typography>
        )}

        {isEditing ? (
          <IconButton
            size="small"
            onClick={handleSave}
            sx={{ color: COLORS.nodeText, p: 0.5 }}
          >
            <CheckIcon fontSize="small" />
          </IconButton>
        ) : (
          <IconButton
            size="small"
            onClick={() => setIsEditing(true)}
            sx={{ color: COLORS.nodeText, p: 0.5 }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      {/* Target handle (input) */}
      <Handle
        type="target"
        position={Position.Top}
        style={{
          background: COLORS.handleBg,
          border: `1px solid ${COLORS.handleBorder}`,
          borderRadius: 6,
          height: 12,
          width: 12,
        }}
      />
    </Paper>
  );
};

export default memo(CausalNode); 