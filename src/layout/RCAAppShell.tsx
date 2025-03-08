import { useState, useRef, useEffect } from 'react';
import React from 'react';
import { 
  Box, 
  AppBar, 
  Toolbar, 
  Tabs, 
  Tab, 
  IconButton, 
  Tooltip,
  Typography,
  Divider,
  Stack,
  Paper,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';

// Import MUI icons - use outlined versions where possible
import UndoOutlinedIcon from '@mui/icons-material/UndoOutlined';
import RedoOutlinedIcon from '@mui/icons-material/RedoOutlined';
import CreateNewFolderOutlinedIcon from '@mui/icons-material/CreateNewFolderOutlined';
import FolderOpenOutlinedIcon from '@mui/icons-material/FolderOpenOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import KeyboardTabIcon from '@mui/icons-material/KeyboardTab';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import ZoomInOutlinedIcon from '@mui/icons-material/ZoomInOutlined';
import ZoomOutOutlinedIcon from '@mui/icons-material/ZoomOutOutlined';
import PanToolOutlinedIcon from '@mui/icons-material/PanToolOutlined';
import GridOnOutlinedIcon from '@mui/icons-material/GridOnOutlined';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import CableOutlinedIcon from '@mui/icons-material/CableOutlined'; // Cable icon for connections
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import SummarizeOutlinedIcon from '@mui/icons-material/SummarizeOutlined';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import CodeIcon from '@mui/icons-material/Code';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

// Import components
import { ProjectSettings } from './ProjectSettings';
import { AISettings } from './AISettings';
import { DiagramView } from './DiagramView';
import { ReportView } from './ReportView';
import { SummaryView } from './SummaryView';
import { NewProjectDialog } from '../components/NewProjectDialog';
import { LoadProjectDialog } from '../components/LoadProjectDialog';
import { useProject } from '../contexts/ProjectContext';
import { useUser } from '../contexts/UserContext';

// Default drawer width and minimum width
const DEFAULT_DRAWER_WIDTH = 300;
const MIN_DRAWER_WIDTH = 260;
const HEADER_HEIGHT = 44; // Slightly reduce header height
const LOGO_SECTION_WIDTH = 180; // Width for logo + toggle when sidebar is collapsed
const RIGHT_TOOLBAR_WIDTH = 48; // Matching navbar height for consistency

// Common border style for consistency
const BORDER_STYLE = '1px solid rgba(0, 0, 0, 0.12)';

// Custom colors based on the design screenshot
const COLORS = {
  activeTab: '#666666',       // Darker gray for active tab
  inactiveTab: '#bbbbbb',     // Lighter gray for inactive tab
  iconColor: '#999999',       // Icon color
  text: '#666666',            // Text color
  lightText: '#999999',       // Light text color
  background: '#ffffff',      // White background
  border: 'rgba(0, 0, 0, 0.12)' // Border color
};

// Create a custom AltRouteRotated component to display the icon correctly
const AltRouteRotated = () => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      height="20px" 
      viewBox="0 -960 960 960" 
      width="20px" 
      fill="currentColor"
      style={{ 
        color: COLORS.iconColor,
        flexShrink: 0 
      }}
    >
      <g transform="rotate(180 480 -480)">
        <path d="M440-80v-200q0-56-17-83t-45-53l57-57q12 11 23 23.5t22 26.5q14-19 28.5-33.5T538-485q38-35 69-81t33-161l-63 63-57-56 160-160 160 160-56 56-64-63q-2 143-44 203.5T592-425q-32 29-52 56.5T520-280v200h-80ZM248-633q-4-20-5.5-44t-2.5-50l-64 63-56-56 160-160 160 160-57 56-63-62q0 21 2 39.5t4 34.5l-78 19Zm86 176q-20-21-38.5-49T263-575l77-19q10 27 23 46t28 34l-57 57Z"/>
      </g>
    </svg>
  );
};

export function RCAAppShell() {
  // State management
  const [leftDrawerOpen, setLeftDrawerOpen] = useState(true);
  const [leftTabIndex, setLeftTabIndex] = useState(0);
  const [mainTabIndex, setMainTabIndex] = useState(0);
  const [drawerWidth, setDrawerWidth] = useState(DEFAULT_DRAWER_WIDTH);
  
  // Project dialogs
  const [newProjectDialogOpen, setNewProjectDialogOpen] = useState(false);
  const [loadProjectDialogOpen, setLoadProjectDialogOpen] = useState(false);
  
  // Add user menu state
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const userMenuOpen = Boolean(userMenuAnchor);
  
  // Context
  const { currentUser, setCurrentUser } = useUser();
  const { currentProject, userProjects, refreshProjects } = useProject();
  
  // Resizable drawer
  const [isResizing, setIsResizing] = useState(false);
  const resizeHandleRef = useRef(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Common transition settings for synchronized animations (only for toggle, not for resize)
  const transitionCSS = 'width 225ms cubic-bezier(0.4, 0, 0.2, 1)';

  // Apply element widths after React state changes or DOM manipulation
  const updateElementWidths = (open: boolean, width: number) => {
    if (headerRef.current && sidebarRef.current) {
      const headerWidth = open ? width : LOGO_SECTION_WIDTH;
      const sidebarWidth = open ? width : 0;
      
      // Apply correct styles
      headerRef.current.style.width = `${headerWidth}px`;
      sidebarRef.current.style.width = `${sidebarWidth}px`;
    }
  };

  // Sync state with DOM on drawer width changes
  useEffect(() => {
    if (!isResizing && leftDrawerOpen) {
      updateElementWidths(leftDrawerOpen, drawerWidth);
    }
  }, [drawerWidth, leftDrawerOpen, isResizing]);

  // Toggle sidebar
  const toggleDrawer = () => {
    const newState = !leftDrawerOpen;
    setLeftDrawerOpen(newState);
    
    // Set correct transitions before changing width
    if (headerRef.current && sidebarRef.current) {
      headerRef.current.style.transition = transitionCSS;
      sidebarRef.current.style.transition = transitionCSS;
    }
    
    // Update element widths to match new state
    updateElementWidths(newState, drawerWidth);
  };

  // Handle mouse events for resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      
      // Calculate new width and apply directly to both elements for synchronous movement
      const newWidth = Math.max(MIN_DRAWER_WIDTH, e.clientX);
      
      // Set React state for when dragging stops
      setDrawerWidth(newWidth);
      
      // Also directly update DOM for immediate visual feedback
      if (headerRef.current && sidebarRef.current) {
        // Remove transition during resize for immediate feedback
        headerRef.current.style.transition = 'none';
        sidebarRef.current.style.transition = 'none';
        
        // Update widths directly
        headerRef.current.style.width = `${newWidth}px`;
        sidebarRef.current.style.width = `${newWidth}px`;
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      
      // Apply proper transitions for future non-resize interactions
      if (headerRef.current && sidebarRef.current) {
        headerRef.current.style.transition = transitionCSS;
        sidebarRef.current.style.transition = transitionCSS;
      }
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      // Disable transitions during resize
      if (headerRef.current && sidebarRef.current) {
        headerRef.current.style.transition = 'none';
        sidebarRef.current.style.transition = 'none';
      }
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, transitionCSS]);

  // Handle resize start
  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  // Check if we need to open NewProjectDialog automatically
  useEffect(() => {
    if (currentUser && userProjects.length === 0) {
      // If user is logged in but has no projects, show the create project dialog
      setNewProjectDialogOpen(true);
    }
  }, [currentUser, userProjects.length]);

  // Refresh projects when user changes
  useEffect(() => {
    if (currentUser) {
      refreshProjects();
    }
  }, [currentUser, refreshProjects]);

  // Handle user menu open
  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  // Handle user menu close
  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  // Handle logout
  const handleLogout = () => {
    setCurrentUser(null);
    handleUserMenuClose();
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      height: '100vh',
      width: '100vw',
      overflow: 'hidden',
    }}>
      {/* TOP APP BAR - Full Width */}
      <AppBar 
        position="static" 
        elevation={0}
        sx={{ 
          width: '100%',
          zIndex: 1200,
          backgroundColor: COLORS.background,
          color: COLORS.text,
          borderBottom: BORDER_STYLE,
        }}
      >
        <Toolbar 
          variant="dense" 
          disableGutters 
          sx={{ 
            minHeight: HEADER_HEIGHT, 
            height: HEADER_HEIGHT,
            padding: 0, 
            m: 0,
            display: 'flex',
            flexDirection: 'row',
          }}
        >
          {/* Different layout for expanded vs collapsed state */}
          {leftDrawerOpen ? (
            // EXPANDED STATE - Logo and app name with toggle at right edge
            <Box 
              ref={headerRef}
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                width: drawerWidth,
                pl: 1.5,
                height: '100%',
                borderRight: BORDER_STYLE,
                overflow: 'hidden',
                boxSizing: 'border-box',
              }}
            >
              <AltRouteRotated />
              
              <Typography 
                variant="h6" 
                component="div" 
                noWrap
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  ml: 1,
                  flexShrink: 0,
                }}
              >
                <Box component="span" sx={{ color: COLORS.text }}>Why</Box>
                <Box component="span" sx={{ color: COLORS.lightText }}>Because</Box>
              </Typography>

              <Box sx={{ flexGrow: 1 }} />

              <IconButton 
                onClick={toggleDrawer}
                size="small"
                sx={{ 
                  color: COLORS.iconColor,
                  p: 1,
                  flexShrink: 0,
                  mr: 1,
                }}
              >
                <KeyboardTabIcon 
                  sx={{ 
                    transform: 'rotate(180deg)',
                    transition: 'transform 0.3s',
                    fontSize: 20,
                  }} 
                />
              </IconButton>
            </Box>
          ) : (
            // COLLAPSED STATE - Logo and toggle in a more compact layout
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              height: '100%',
            }}>
              <Box 
                ref={headerRef}
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  width: LOGO_SECTION_WIDTH,
                  pl: 1.5,
                  height: '100%',
                }}
              >
                <AltRouteRotated />
                
                <Typography 
                  variant="h6" 
                  component="div" 
                  noWrap
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    ml: 1,
                    flexShrink: 0,
                  }}
                >
                  <Box component="span" sx={{ color: COLORS.text }}>Why</Box>
                  <Box component="span" sx={{ color: COLORS.lightText }}>Because</Box>
                </Typography>
              </Box>

              <Box sx={{ 
                width: 48, 
                height: '100%', 
                display: 'flex', 
                alignItems: 'center',
                justifyContent: 'center',
                borderRight: BORDER_STYLE,
              }}>
                <IconButton 
                  onClick={toggleDrawer}
                  size="small"
                  sx={{ 
                    color: COLORS.iconColor,
                    p: 1,
                  }}
                >
                  <KeyboardTabIcon 
                    sx={{ 
                      transform: 'rotate(0deg)',
                      transition: 'transform 0.3s',
                      fontSize: 20,
                    }} 
                  />
                </IconButton>
              </Box>
            </Box>
          )}

          {/* Main tabs - position adjusts with sidebar */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            height: '100%',
            ml: 0,
          }}>
            <Tabs
              value={mainTabIndex}
              onChange={(_, newValue) => setMainTabIndex(newValue)}
              textColor="inherit"
              sx={{ 
                height: '100%',
                minHeight: HEADER_HEIGHT,
                '& .MuiTab-root': {
                  minWidth: 'auto',
                  minHeight: HEADER_HEIGHT,
                  height: HEADER_HEIGHT,
                  px: 2,
                  fontSize: '0.875rem',
                  textTransform: 'capitalize',
                  whiteSpace: 'nowrap', // Prevent text wrapping
                  color: COLORS.inactiveTab,
                },
                '& .Mui-selected': {
                  color: COLORS.activeTab,
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: COLORS.activeTab,
                },
              }}
            >
              <Tab 
                icon={<AccountTreeOutlinedIcon fontSize="small" sx={{ mr: 1 }} />} 
                iconPosition="start"
                label="Diagram" 
              />
              <Tab 
                icon={<ArticleOutlinedIcon fontSize="small" sx={{ mr: 1 }} />} 
                iconPosition="start"
                label="Report" 
              />
              <Tab 
                icon={<SummarizeOutlinedIcon fontSize="small" sx={{ mr: 1 }} />} 
                iconPosition="start"
                label="Summary" 
              />
            </Tabs>
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          {/* Spacer element that pushes the center title to be centered */}
          <Box sx={{ flexGrow: 1 }} />

          {/* Center content with app name and/or project name */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Typography 
              variant="subtitle1" 
              component="div" 
              sx={{ 
                fontWeight: 'medium',
                color: COLORS.text,
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              WhyBecause RCA
              {currentProject && (
                <>
                  <Box 
                    component="span" 
                    sx={{ 
                      mx: 1, 
                      color: COLORS.inactiveTab,
                      fontSize: '1rem'
                    }}
                  >
                    •
                  </Box>
                  <Box 
                    component="span" 
                    sx={{ 
                      color: COLORS.text,
                      fontWeight: 'normal'
                    }}
                  >
                    {currentProject.name}
                  </Box>
                </>
              )}
            </Typography>
          </Box>

          {/* Spacer element for symmetry */}
          <Box sx={{ flexGrow: 1 }} />

          {/* Right side of toolbar - Action buttons */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 0.5, 
            pr: 1
          }}>
            <Tooltip title="Undo">
              <IconButton size="small" sx={{ color: COLORS.iconColor }}>
                <UndoOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Redo">
              <IconButton size="small" sx={{ color: COLORS.iconColor }}>
                <RedoOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title="New Project">
              <IconButton 
                size="small" 
                sx={{ color: COLORS.iconColor }}
                onClick={() => setNewProjectDialogOpen(true)}
              >
                <CreateNewFolderOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Open Project">
              <IconButton 
                size="small" 
                sx={{ color: COLORS.iconColor }}
                onClick={() => setLoadProjectDialogOpen(true)}
              >
                <FolderOpenOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Save Project">
              <IconButton size="small" sx={{ color: COLORS.iconColor }}>
                <SaveOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title="Toggle Theme">
              <IconButton size="small" sx={{ color: COLORS.iconColor }}>
                <DarkModeOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Settings">
              <IconButton size="small" sx={{ color: COLORS.iconColor }}>
                <SettingsOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="User Account">
              <IconButton 
                size="small" 
                sx={{ color: COLORS.iconColor }}
                onClick={handleUserMenuOpen}
                aria-controls={userMenuOpen ? 'user-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={userMenuOpen ? 'true' : undefined}
              >
                <PersonOutlineOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      {/* MAIN CONTENT AREA - Contains Sidebar + Content */}
      <Box sx={{ 
        display: 'flex', 
        flexGrow: 1,
        overflow: 'hidden',
      }}>
        {/* LEFT SIDEBAR with synchronized transition */}
        <Box 
          ref={sidebarRef}
          sx={{ 
            width: leftDrawerOpen ? drawerWidth : 0,
            borderRight: BORDER_STYLE,
            overflow: 'hidden',
            visibility: leftDrawerOpen ? 'visible' : 'hidden',
            flexShrink: 0, // Prevent sidebar from shrinking
            display: 'flex',
            position: 'relative',
            backgroundColor: COLORS.background,
          }}
        >
          <Box sx={{ 
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            width: drawerWidth, // Keep constant width for inner content
            flexShrink: 0,
          }}>
            <Box sx={{ 
              borderBottom: BORDER_STYLE,
              borderTop: 'none', // Ensure no double border with navbar
            }}>
              <Tabs 
                value={leftTabIndex} 
                onChange={(_, newValue) => setLeftTabIndex(newValue)}
                variant="fullWidth"
                sx={{
                  minHeight: '40px', // Reduce minimum height
                  '& .MuiTab-root': {
                    py: 0.75, // Reduce padding top/bottom
                    minHeight: '40px', // Reduce minimum height
                    color: COLORS.inactiveTab,
                    fontSize: '0.875rem',
                    textTransform: 'capitalize',
                  },
                  '& .Mui-selected': {
                    color: COLORS.activeTab,
                  },
                  '& .MuiTabs-indicator': {
                    backgroundColor: COLORS.activeTab,
                  },
                }}
              >
                <Tab 
                  icon={<CodeIcon sx={{ fontSize: 18, mr: 1 }} />}
                  iconPosition="start" 
                  label="Project" 
                  sx={{ minHeight: '40px' }}
                />
                <Tab 
                  icon={<SmartToyOutlinedIcon fontSize="small" sx={{ mr: 1, fontSize: 18 }} />} 
                  iconPosition="start" 
                  label="AI" 
                  sx={{ minHeight: '40px' }} // Ensure consistent minimum height
                />
              </Tabs>
            </Box>
            <Box sx={{ 
              overflow: 'auto', 
              flexGrow: 1,
            }}>
              {leftTabIndex === 0 && <ProjectSettings />}
              {leftTabIndex === 1 && <AISettings />}
            </Box>
          </Box>
        </Box>

        {/* Resize handle - only visible when sidebar is open */}
        {leftDrawerOpen && (
          <Box
            ref={resizeHandleRef}
            onMouseDown={handleResizeStart}
            sx={{
              width: '6px',
              cursor: 'col-resize',
              height: '100%',
              backgroundColor: 'transparent',
              zIndex: 1200,
              flexShrink: 0,
              '&:hover': {
                backgroundColor: '#e0e0e0',
              },
              marginLeft: '-6px', // Move handle over the border
              position: 'relative',
            }}
          />
        )}

        {/* MAIN CONTENT + RIGHT SIDEBAR */}
        <Box sx={{ 
          flexGrow: 1, 
          height: '100%',
          display: 'flex',
          overflow: 'hidden',
        }}>
          {/* CONTENT AREA */}
          <Box sx={{ 
            flexGrow: 1, 
            position: 'relative',
            overflow: 'auto',
          }}>
            {/* Main view content */}
            {mainTabIndex === 0 && <DiagramView />}
            {mainTabIndex === 1 && <ReportView />}
            {mainTabIndex === 2 && <SummaryView />}

            {/* View Controls (only in diagram view) */}
            {mainTabIndex === 0 && (
              <Paper
                elevation={1}
                sx={{
                  position: 'absolute',
                  bottom: 16,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  display: 'flex',
                  alignItems: 'center',
                  p: 0.5,
                  borderRadius: 8,
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  zIndex: 1000,
                }}
              >
                <IconButton size="small" sx={{ mx: 0.5, color: COLORS.iconColor }}>
                  <ZoomInOutlinedIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" sx={{ mx: 0.5, color: COLORS.iconColor }}>
                  <ZoomOutOutlinedIcon fontSize="small" />
                </IconButton>
                <Divider orientation="vertical" flexItem sx={{ height: 20, mx: 0.5 }} />
                <IconButton size="small" sx={{ mx: 0.5, color: COLORS.iconColor }}>
                  <PanToolOutlinedIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" sx={{ mx: 0.5, color: COLORS.iconColor }}>
                  <GridOnOutlinedIcon fontSize="small" />
                </IconButton>
              </Paper>
            )}
          </Box>

          {/* RIGHT SIDEBAR (TOOLBAR) */}
          <Box sx={{
            width: RIGHT_TOOLBAR_WIDTH,
            borderLeft: BORDER_STYLE,
            display: 'flex',
            flexDirection: 'column',
            p: 0.5,
            pt: 3,
            alignItems: 'center',
            backgroundColor: COLORS.background,
            flexShrink: 0,
          }}>
            <Stack spacing={2} alignItems="center">
              <Tooltip title="Add Node" placement="left">
                <IconButton size="small" sx={{ color: COLORS.iconColor }}>
                  <AddOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Add Connection" placement="left">
                <IconButton size="small" sx={{ color: COLORS.iconColor }}>
                  <CableOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Duplicate" placement="left">
                <IconButton size="small" sx={{ color: COLORS.iconColor }}>
                  <ContentCopyOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete" placement="left">
                <IconButton size="small" sx={{ color: COLORS.iconColor }}>
                  <DeleteOutlineOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          </Box>
        </Box>
      </Box>

      {/* Project Dialogs */}
      <NewProjectDialog 
        open={newProjectDialogOpen} 
        onClose={() => setNewProjectDialogOpen(false)} 
      />
      <LoadProjectDialog 
        open={loadProjectDialogOpen} 
        onClose={() => setLoadProjectDialogOpen(false)} 
      />

      {/* User menu */}
      <Menu
        id="user-menu"
        anchorEl={userMenuAnchor}
        open={userMenuOpen}
        onClose={handleUserMenuClose}
        MenuListProps={{
          'aria-labelledby': 'user-button',
        }}
        PaperProps={{
          sx: {
            mt: 1,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            minWidth: 180,
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {currentUser && (
          <MenuItem disabled sx={{ opacity: 1 }}>
            <ListItemIcon>
              <AccountCircleIcon fontSize="small" sx={{ color: COLORS.iconColor }} />
            </ListItemIcon>
            <ListItemText 
              primary={currentUser.username} 
              primaryTypographyProps={{ 
                sx: { fontWeight: 'medium', color: COLORS.text } 
              }} 
            />
          </MenuItem>
        )}
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" sx={{ color: COLORS.iconColor }} />
          </ListItemIcon>
          <ListItemText 
            primary="Logout" 
            primaryTypographyProps={{ 
              sx: { color: COLORS.text } 
            }} 
          />
        </MenuItem>
      </Menu>
    </Box>
  );
} 