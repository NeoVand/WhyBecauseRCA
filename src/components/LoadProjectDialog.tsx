import { useEffect, Fragment } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button,
  List,
  ListItemButton,
  ListItemText,
  Typography,
  Box,
  Divider
} from '@mui/material';
import { useProject } from '../contexts/ProjectContext';

// Custom colors based on the design
const COLORS = {
  text: '#666666',            // Text color
  lightText: '#999999',       // Light text color
  background: '#ffffff',      // White background
  border: 'rgba(0, 0, 0, 0.12)', // Border color
  buttonBg: '#888888',        // Gray button background
  buttonHoverBg: '#666666'    // Darker gray on hover
};

interface LoadProjectDialogProps {
  open: boolean;
  onClose: () => void;
}

export function LoadProjectDialog({ open, onClose }: LoadProjectDialogProps) {
  const { userProjects, setCurrentProject, refreshProjects } = useProject();

  // Refresh projects when dialog opens
  useEffect(() => {
    if (open) {
      refreshProjects();
    }
  }, [open, refreshProjects]);

  const handleSelectProject = (projectId: string) => {
    const project = userProjects.find(p => p.id === projectId);
    if (project) {
      setCurrentProject(project);
      onClose();
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
    >
      <DialogTitle sx={{ color: COLORS.text }}>Open Project</DialogTitle>
      <DialogContent>
        {userProjects.length === 0 ? (
          <Box sx={{ py: 2, textAlign: 'center' }}>
            <Typography variant="body1" sx={{ color: COLORS.lightText }}>
              You don't have any projects yet.
            </Typography>
          </Box>
        ) : (
          <List sx={{ pt: 0 }}>
            {userProjects.map((project, index) => (
              <Fragment key={project.id}>
                <ListItemButton 
                  onClick={() => handleSelectProject(project.id)}
                  sx={{ py: 1.5 }}
                >
                  <ListItemText 
                    primary={
                      <Typography sx={{ color: COLORS.text, fontWeight: 500 }}>
                        {project.name}
                      </Typography>
                    }
                    secondary={
                      <Fragment>
                        {project.description && (
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              color: COLORS.lightText, 
                              mb: 0.5, 
                              display: '-webkit-box', 
                              WebkitLineClamp: 2, 
                              WebkitBoxOrient: 'vertical', 
                              overflow: 'hidden' 
                            }}
                          >
                            {project.description}
                          </Typography>
                        )}
                        <Typography 
                          variant="caption" 
                          sx={{ color: COLORS.lightText }}
                        >
                          Last modified: {formatDate(project.updatedAt)}
                        </Typography>
                      </Fragment>
                    }
                  />
                </ListItemButton>
                {index < userProjects.length - 1 && <Divider />}
              </Fragment>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 2, pb: 2 }}>
        <Button 
          onClick={onClose}
          sx={{ 
            color: COLORS.text
          }}
        >
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
} 