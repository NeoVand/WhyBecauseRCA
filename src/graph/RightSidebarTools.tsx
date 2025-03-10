import { Box, Stack, Tooltip, IconButton } from '@mui/material';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import CableOutlinedIcon from '@mui/icons-material/CableOutlined';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { useTheme } from '../contexts/ThemeContext';
import { useToolbar, EditorMode } from '../contexts/ToolbarContext';
import { useGraph } from '../contexts/GraphContext';

// Get colors based on current theme
const getToolbarColors = (isDarkMode: boolean) => {
  return {
    iconColor: isDarkMode ? '#b0b0b0' : '#999999',              // Icon color
    activeIconColor: isDarkMode ? '#90caf9' : '#1976d2',        // Active button color
    background: isDarkMode ? '#1e1e1e' : '#ffffff',             // Background color
    border: isDarkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)', // Border color
  };
};

export function RightSidebarTools() {
  const { isDarkMode } = useTheme();
  const { editorMode, toggleEditorMode } = useToolbar();
  const { selectedElements, deleteNode, deleteEdge } = useGraph();
  
  const COLORS = getToolbarColors(isDarkMode);

  // Handle tool actions
  const handleAddNode = () => {
    toggleEditorMode(EditorMode.ADD_NODE);
  };

  const handleAddEdge = () => {
    toggleEditorMode(EditorMode.ADD_EDGE);
  };

  const handleDelete = () => {
    // Delete selected elements
    selectedElements.nodes.forEach(nodeId => deleteNode(nodeId));
    selectedElements.edges.forEach(edgeId => deleteEdge(edgeId));
  };

  // Check if a button should be shown as active
  const isButtonActive = (mode: EditorMode) => editorMode === mode;

  // Determine if delete button should be enabled
  const isDeleteEnabled = selectedElements.nodes.length > 0 || selectedElements.edges.length > 0;

  return (
    <Box sx={{
      borderLeft: `1px solid ${COLORS.border}`,
      display: 'flex',
      flexDirection: 'column',
      p: 0.5,
      pt: 3,
      alignItems: 'center',
      backgroundColor: COLORS.background,
      height: '100%',
      width: '48px',
    }}>
      <Stack spacing={2} alignItems="center">
        <Tooltip title="Add Node" placement="left">
          <IconButton 
            size="small" 
            onClick={handleAddNode}
            sx={{ 
              color: isButtonActive(EditorMode.ADD_NODE) ? COLORS.activeIconColor : COLORS.iconColor,
              backgroundColor: isButtonActive(EditorMode.ADD_NODE) ? 'rgba(25, 118, 210, 0.1)' : 'transparent',
              '&:hover': {
                backgroundColor: isButtonActive(EditorMode.ADD_NODE) ? 'rgba(25, 118, 210, 0.2)' : 'rgba(0, 0, 0, 0.04)',
              }
            }}
          >
            <AddOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Add Connection" placement="left">
          <IconButton 
            size="small" 
            onClick={handleAddEdge}
            sx={{ 
              color: isButtonActive(EditorMode.ADD_EDGE) ? COLORS.activeIconColor : COLORS.iconColor,
              backgroundColor: isButtonActive(EditorMode.ADD_EDGE) ? 'rgba(25, 118, 210, 0.1)' : 'transparent',
              '&:hover': {
                backgroundColor: isButtonActive(EditorMode.ADD_EDGE) ? 'rgba(25, 118, 210, 0.2)' : 'rgba(0, 0, 0, 0.04)',
              }
            }}
          >
            <CableOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Duplicate" placement="left">
          <IconButton size="small" sx={{ color: COLORS.iconColor }}>
            <ContentCopyOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete" placement="left">
          <span>
            <IconButton 
              size="small" 
              onClick={handleDelete}
              disabled={!isDeleteEnabled}
              sx={{ 
                color: isDeleteEnabled ? COLORS.iconColor : 'rgba(0, 0, 0, 0.26)'
              }}
            >
              <DeleteOutlineOutlinedIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      </Stack>
    </Box>
  );
} 