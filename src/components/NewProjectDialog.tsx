import { useState } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  Button
} from '@mui/material';
import { 
  Add as AddIcon, 
  Close as CloseIcon, 
  CreateNewFolder as CreateNewFolderIcon 
} from '@mui/icons-material';
import { db } from '../db/LocalDB';
import { useUser } from '../contexts/UserContext';
import { useProject } from '../contexts/ProjectContext';
import { v4 as uuidv4 } from 'uuid';

// Custom colors based on the design
const COLORS = {
  text: '#666666',            // Text color
  lightText: '#999999',       // Light text color
  background: '#ffffff',      // White background
  border: 'rgba(0, 0, 0, 0.12)', // Border color
  buttonBg: '#888888',        // Gray button background
  buttonHoverBg: '#666666',   // Darker gray on hover
  activeInput: '#666666'      // Active input color (dark gray)
};

interface NewProjectDialogProps {
  open: boolean;
  onClose: () => void;
}

export function NewProjectDialog({ open, onClose }: NewProjectDialogProps) {
  const { currentUser } = useUser();
  const { setCurrentProject, refreshProjects } = useProject();
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)'
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
                borderColor: COLORS.activeInput
              }
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: COLORS.activeInput
            },
            '& .MuiInput-underline:after': {
              borderBottomColor: COLORS.activeInput
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
                borderColor: COLORS.activeInput
              }
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: COLORS.activeInput
            },
            '& .MuiInput-underline:after': {
              borderBottomColor: COLORS.activeInput
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