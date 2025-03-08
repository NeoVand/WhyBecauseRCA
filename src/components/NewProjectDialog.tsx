import { useState } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  Button,
  backdropClasses
} from '@mui/material';
import { 
  Add as AddIcon, 
  Close as CloseIcon, 
  CreateNewFolder as CreateNewFolderIcon 
} from '@mui/icons-material';
import { db } from '../db/LocalDB';
import { useUser } from '../contexts/UserContext';
import { useProject } from '../contexts/ProjectContext';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeColors } from '../constants/themeColors';
import { v4 as uuidv4 } from 'uuid';

interface NewProjectDialogProps {
  open: boolean;
  onClose: () => void;
}

export function NewProjectDialog({ open, onClose }: NewProjectDialogProps) {
  const { currentUser } = useUser();
  const { setCurrentProject, refreshProjects } = useProject();
  const { isDarkMode } = useTheme();
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get theme-specific colors
  const COLORS = getThemeColors(isDarkMode);

  const handleCreate = async () => {
    if (!currentUser || !projectName.trim()) return;
    
    setIsSubmitting(true);
    try {
      const newProject = {
        id: uuidv4(),
        name: projectName.trim(),
        description: description.trim() || undefined,
        ownerId: currentUser.id,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      
      await db.projects.add(newProject);
      setCurrentProject(newProject);
      await refreshProjects();
      
      // Reset form
      setProjectName('');
      setDescription('');
      onClose();
    } catch (error) {
      console.error('Error creating project:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form when dialog opens
  const handleEnter = () => {
    setProjectName('');
    setDescription('');
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="xs" 
      fullWidth
      TransitionProps={{
        onEnter: handleEnter
      }}
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: isDarkMode 
            ? '0 8px 24px rgba(0, 0, 0, 0.5)' 
            : '0 8px 24px rgba(0, 0, 0, 0.12)',
          backgroundColor: COLORS.dialogBg,
          border: `1px solid ${COLORS.border}`,
          '& .MuiDialogContent-root': {
            backgroundColor: COLORS.dialogBg
          },
          '& .MuiDialogActions-root': {
            backgroundColor: COLORS.dialogBg
          },
          '& .MuiDialogTitle-root': {
            backgroundColor: COLORS.dialogBg
          }
        }
      }}
      sx={{
        [`& .${backdropClasses.root}`]: {
          backgroundColor: COLORS.backdropColor
        }
      }}
    >
      <DialogTitle sx={{ 
        color: COLORS.text,
        display: 'flex',
        alignItems: 'center',
        gap: 1.5
      }}>
        <CreateNewFolderIcon sx={{ color: COLORS.text }} />
        New Project
      </DialogTitle>
      <DialogContent>
        <TextField
          label="Project Name"
          fullWidth
          margin="dense"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          autoFocus
          inputProps={{ maxLength: 50 }}
          InputLabelProps={{ sx: { color: COLORS.lightText } }}
          sx={{ 
            mb: 1.5,
            '& .MuiOutlinedInput-root': {
              '&.Mui-focused fieldset': {
                borderColor: COLORS.focusBorder
              },
              backgroundColor: COLORS.inputBg
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: COLORS.focusBorder
            },
            '& .MuiInputBase-input': {
              color: COLORS.text
            },
            '& .MuiInput-underline:after': {
              borderBottomColor: COLORS.focusBorder
            }
          }}
        />
        <TextField
          label="Description (Optional)"
          fullWidth
          margin="dense"
          multiline
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          inputProps={{ maxLength: 500 }}
          InputLabelProps={{ sx: { color: COLORS.lightText } }}
          sx={{ 
            '& .MuiOutlinedInput-root': {
              '&.Mui-focused fieldset': {
                borderColor: COLORS.focusBorder
              },
              backgroundColor: COLORS.inputBg
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: COLORS.focusBorder
            },
            '& .MuiInputBase-input': {
              color: COLORS.text
            },
            '& .MuiInput-underline:after': {
              borderBottomColor: COLORS.focusBorder
            }
          }}
        />
      </DialogContent>
      <DialogActions sx={{ px: 2, pb: 2 }}>
        <Button 
          onClick={onClose}
          startIcon={<CloseIcon />}
          sx={{ 
            color: COLORS.text,
            mr: 1
          }}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleCreate} 
          disabled={!projectName.trim() || isSubmitting} 
          variant="contained"
          startIcon={<AddIcon />}
          sx={{ 
            backgroundColor: COLORS.buttonBg,
            '&:hover': {
              backgroundColor: COLORS.buttonHoverBg,
            },
            color: 'white'
          }}
        >
          {isSubmitting ? 'Creating...' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
} 