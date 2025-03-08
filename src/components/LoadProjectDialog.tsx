import { useEffect, Fragment, useState } from 'react';
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
  Divider,
  backdropClasses,
  IconButton,
  TextField,
  InputAdornment,
  ListItemSecondaryAction,
  Tooltip,
  DialogContentText
} from '@mui/material';
import { 
  FolderOpen as FolderOpenIcon,
  Close as CloseIcon,
  Download as DownloadIcon,
  ContentCopy as DuplicateIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { useProject } from '../contexts/ProjectContext';
import { db } from '../db/LocalDB';
import { v4 as uuidv4 } from 'uuid';

// Custom colors based on the design
const COLORS = {
  text: '#666666',            // Text color
  lightText: '#999999',       // Light text color
  background: '#ffffff',      // White background
  border: 'rgba(0, 0, 0, 0.12)', // Border color
  buttonBg: '#888888',        // Gray button background
  buttonHoverBg: '#666666',   // Darker gray on hover
  warningColor: '#d32f2f'     // For delete button/confirmation
};

interface LoadProjectDialogProps {
  open: boolean;
  onClose: () => void;
}

export function LoadProjectDialog({ open, onClose }: LoadProjectDialogProps) {
  const { userProjects, setCurrentProject, refreshProjects } = useProject();
  const [searchQuery, setSearchQuery] = useState('');
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [newProjectName, setNewProjectName] = useState('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

  // Filtered projects based on search
  const filteredProjects = userProjects.filter(project => 
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (project.description && project.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Refresh projects when dialog opens
  useEffect(() => {
    if (open) {
      refreshProjects();
    }
  }, [open, refreshProjects]);

  // Clear search when dialog closes
  useEffect(() => {
    if (!open) {
      setSearchQuery('');
      setEditingProjectId(null);
      setNewProjectName('');
      setDeleteConfirmOpen(false);
      setProjectToDelete(null);
    }
  }, [open]);

  const handleSelectProject = (projectId: string) => {
    // Only select if not in editing mode
    if (!editingProjectId) {
      const project = userProjects.find(p => p.id === projectId);
      if (project) {
        setCurrentProject(project);
        onClose();
      }
    }
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent project selection
    // Placeholder for future implementation
    alert('Download functionality will be implemented in a future update');
  };

  const handleDuplicate = async (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation(); // Prevent project selection
    
    const projectToDuplicate = userProjects.find(p => p.id === projectId);
    if (!projectToDuplicate) return;
    
    // Create a copy with a new ID
    const duplicateProject = {
      ...projectToDuplicate,
      id: uuidv4(),
      name: `${projectToDuplicate.name} - Copy`,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    // Add to database
    await db.projects.add(duplicateProject);
    
    // Refresh project list
    await refreshProjects();
    
    // Set the duplicated project for editing
    setEditingProjectId(duplicateProject.id);
    setNewProjectName(duplicateProject.name);
  };

  const handleDeleteClick = (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation(); // Prevent project selection
    setProjectToDelete(projectId);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!projectToDelete) return;
    
    try {
      await db.projects.delete(projectToDelete);
      await refreshProjects();
      setDeleteConfirmOpen(false);
      setProjectToDelete(null);
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
    setProjectToDelete(null);
  };

  const handleSaveRename = async (projectId: string) => {
    if (!newProjectName.trim()) return;
    
    try {
      await db.projects.update(projectId, { 
        name: newProjectName.trim(),
        updatedAt: Date.now()
      });
      
      await refreshProjects();
      setEditingProjectId(null);
      setNewProjectName('');
    } catch (error) {
      console.error('Error renaming project:', error);
    }
  };

  const handleCancelRename = () => {
    setEditingProjectId(null);
    setNewProjectName('');
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <>
      <Dialog 
        open={open} 
        onClose={onClose} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
            backdropFilter: 'blur(2px)',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            border: '1px solid rgba(255, 255, 255, 0.8)'
          }
        }}
        sx={{
          [`& .${backdropClasses.root}`]: {
            backdropFilter: 'blur(8px)',
            backgroundColor: 'rgba(0, 0, 0, 0.2)'
          }
        }}
      >
        <DialogTitle sx={{ 
          color: COLORS.text,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5
        }}>
          <FolderOpenIcon sx={{ color: COLORS.text }} />
          Open Project
        </DialogTitle>
        
        <DialogContent>
          {/* Search bar */}
          <TextField
            fullWidth
            placeholder="Search projects..."
            variant="outlined"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: COLORS.lightText }} />
                </InputAdornment>
              ),
              endAdornment: searchQuery ? (
                <InputAdornment position="end">
                  <IconButton 
                    size="small" 
                    onClick={() => setSearchQuery('')}
                    sx={{ color: COLORS.lightText }}
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : null,
              sx: { 
                backgroundColor: 'rgba(255, 255, 255, 0.7)',
                borderRadius: 1.5
              }
            }}
            sx={{ 
              mb: 2,
              mt: 1,
              '& .MuiOutlinedInput-root': {
                '&.Mui-focused fieldset': {
                  borderColor: COLORS.text
                }
              }
            }}
          />
        
          {filteredProjects.length === 0 ? (
            <Box sx={{ py: 3, textAlign: 'center' }}>
              <Typography variant="body1" sx={{ color: COLORS.lightText }}>
                {searchQuery 
                  ? 'No projects match your search criteria.' 
                  : 'You don\'t have any projects yet.'}
              </Typography>
            </Box>
          ) : (
            <List sx={{ pt: 0 }}>
              {filteredProjects.map((project, index) => (
                <Fragment key={project.id}>
                  <ListItemButton 
                    onClick={() => handleSelectProject(project.id)}
                    sx={{ 
                      py: 1.5,
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.7)'
                      },
                      // Disable hover effect when editing
                      ...(editingProjectId === project.id && {
                        '&:hover': {
                          backgroundColor: 'transparent'
                        },
                        cursor: 'default'
                      })
                    }}
                  >
                    <ListItemText 
                      primary={
                        editingProjectId === project.id ? (
                          <TextField
                            fullWidth
                            variant="outlined"
                            size="small"
                            value={newProjectName}
                            onChange={(e) => setNewProjectName(e.target.value)}
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleSaveRename(project.id);
                              } else if (e.key === 'Escape') {
                                handleCancelRename();
                              }
                            }}
                            InputProps={{
                              endAdornment: (
                                <Box sx={{ display: 'flex', gap: 0.5 }}>
                                  <Tooltip title="Cancel">
                                    <IconButton 
                                      size="small" 
                                      onClick={handleCancelRename}
                                      sx={{ color: COLORS.lightText }}
                                    >
                                      <CloseIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Save">
                                    <IconButton 
                                      size="small" 
                                      onClick={() => handleSaveRename(project.id)}
                                      sx={{ color: COLORS.text }}
                                      disabled={!newProjectName.trim()}
                                    >
                                      <DuplicateIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                </Box>
                              )
                            }}
                            sx={{
                              backgroundColor: 'rgba(255, 255, 255, 0.7)',
                              '& .MuiOutlinedInput-root': {
                                '&.Mui-focused fieldset': {
                                  borderColor: COLORS.text
                                }
                              }
                            }}
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          <Typography sx={{ color: COLORS.text, fontWeight: 500 }}>
                            {project.name}
                          </Typography>
                        )
                      }
                      secondary={
                        !editingProjectId && (
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
                        )
                      }
                    />
                    
                    {/* Project action buttons */}
                    {!editingProjectId && (
                      <ListItemSecondaryAction sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="Download">
                          <IconButton 
                            edge="end" 
                            size="small"
                            onClick={handleDownload}
                            sx={{ color: COLORS.lightText }}
                          >
                            <DownloadIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Duplicate">
                          <IconButton 
                            edge="end" 
                            size="small"
                            onClick={(e) => handleDuplicate(e, project.id)}
                            sx={{ color: COLORS.lightText }}
                          >
                            <DuplicateIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton 
                            edge="end" 
                            size="small"
                            onClick={(e) => handleDeleteClick(e, project.id)}
                            sx={{ color: COLORS.warningColor }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </ListItemSecondaryAction>
                    )}
                  </ListItemButton>
                  {index < filteredProjects.length - 1 && <Divider />}
                </Fragment>
              ))}
            </List>
          )}
        </DialogContent>
        
        <DialogActions sx={{ px: 2, pb: 2 }}>
          <Button 
            onClick={onClose}
            startIcon={<CloseIcon />}
            sx={{ color: COLORS.text }}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={handleDeleteCancel}
        PaperProps={{
          sx: {
            borderRadius: 2,
            backdropFilter: 'blur(2px)',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            border: '1px solid rgba(255, 255, 255, 0.8)'
          }
        }}
        maxWidth="xs"
      >
        <DialogTitle sx={{ color: COLORS.text }}>Delete Project</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: COLORS.text }}>
            Are you sure you want to delete this project? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={handleDeleteCancel} 
            sx={{ color: COLORS.text }}
            startIcon={<CloseIcon />}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            variant="contained"
            startIcon={<DeleteIcon />}
            sx={{ bgcolor: COLORS.warningColor, color: 'white' }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
} 