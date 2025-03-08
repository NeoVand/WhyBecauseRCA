import React, { useState, useRef, useEffect } from 'react';
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
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { NodeType } from '../models/types';

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
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import ZoomInOutlinedIcon from '@mui/icons-material/ZoomInOutlined';
import ZoomOutOutlinedIcon from '@mui/icons-material/ZoomOutOutlined';
import PanToolOutlinedIcon from '@mui/icons-material/PanToolOutlined';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import SummarizeOutlinedIcon from '@mui/icons-material/SummarizeOutlined';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import CodeIcon from '@mui/icons-material/Code';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import CropFreeOutlinedIcon from '@mui/icons-material/CropFreeOutlined';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import MouseOutlinedIcon from '@mui/icons-material/MouseOutlined';

// Import components
import { DiagramView } from './DiagramView';
import { ReportView } from './ReportView';
import { SummaryView } from './SummaryView';
import { ProjectSettings } from './ProjectSettings';
import { AISettings } from './AISettings';
import { NewProjectDialog } from '../components/NewProjectDialog';
import { LoadProjectDialog } from '../components/LoadProjectDialog';
import { NodeTypeTray } from '../components/NodeTypeTray';
import { useProject } from '../contexts/ProjectContext';
import { useUser } from '../contexts/UserContext';
import { useTheme } from '../contexts/ThemeContext';

// Default drawer width and minimum width
const DEFAULT_DRAWER_WIDTH = 300;
const MIN_DRAWER_WIDTH = 260;
const HEADER_HEIGHT = 44; // Slightly reduce header height
const LOGO_SECTION_WIDTH = 180; // Width for logo + toggle when sidebar is collapsed
const RIGHT_TOOLBAR_WIDTH = 48; // Matching navbar height for consistency

// Function to get colors based on current theme
const getThemeColors = (isDarkMode: boolean) => {
  return {
    activeTab: isDarkMode ? '#e0e0e0' : '#666666',         // Active tab color
    inactiveTab: isDarkMode ? '#777777' : '#bbbbbb',       // Inactive tab color
    iconColor: isDarkMode ? '#b0b0b0' : '#999999',         // Icon color
    text: isDarkMode ? '#e0e0e0' : '#666666',              // Text color
    lightText: isDarkMode ? '#a0a0a0' : '#999999',         // Light text color
    background: isDarkMode ? '#1e1e1e' : '#ffffff',        // Background color
    mainBackground: isDarkMode ? '#121212' : '#fafafa',    // Main background
    headerBackground: isDarkMode ? '#1e1e1e' : '#ffffff',  // Header background
    sidebarBackground: isDarkMode ? '#1e1e1e' : '#ffffff', // Sidebar background
    border: isDarkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)', // Border color
    divider: isDarkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)' // Divider color
  };
};

// Function to get border style based on theme
const getBorderStyle = (isDarkMode: boolean) => {
  return `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'}`;
};

// Create a custom AltRouteRotated component to display the icon correctly
const AltRouteRotated = ({ iconColor }: { iconColor: string }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      height="20px" 
      viewBox="0 -960 960 960" 
      width="20px" 
      fill="currentColor"
      style={{ 
        color: iconColor,
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
  const { currentProject, userProjects, refreshProjects, loading } = useProject();
  
  // Resizable drawer
  const [isResizing, setIsResizing] = useState(false);
  const resizeHandleRef = useRef(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Common transition settings for synchronized animations (only for toggle, not for resize)
  const transitionCSS = 'width 225ms cubic-bezier(0.4, 0, 0.2, 1)';

  // Add theme context
  const { isDarkMode, toggleTheme } = useTheme();
  
  // Get theme-specific colors and border style
  const COLORS = getThemeColors(isDarkMode);
  const BORDER_STYLE = getBorderStyle(isDarkMode);

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
    // Only show the New Project dialog if:
    // 1. User is logged in
    // 2. User has no projects
    // 3. We have already loaded projects (not just initializing)
    // 4. We're not still loading the user
    if (currentUser && 
        userProjects.length === 0 && 
        !loading) {
      // Add a slight delay to make sure it doesn't conflict with the sign-in dialog
      const timer = setTimeout(() => {
        setNewProjectDialogOpen(true);
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [currentUser, userProjects.length, loading]);

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

  // Node type tray state
  const [editorMode, setEditorMode] = useState<'select' | 'addNode' | 'pan'>('select');
  const [nodeTypeTrayOpen, setNodeTypeTrayOpen] = useState(false);
  const [activeNodeType, setActiveNodeType] = useState<NodeType | null>(null);
  const [isPanActive, setIsPanActive] = useState(false);
  // Store previous mode for spacebar pan
  const [previousMode, setPreviousMode] = useState<'select' | 'addNode' | null>(null);

  // Handle node added - switch to select mode
  const handleNodeAdded = () => {
    setEditorMode('select');
  };

  // Delete selected node - This will be handled by the DiagramView component
  const deleteSelectedNode = () => {
    // Just a placeholder, actual deletion happens in DiagramView
  };

  // Toggle pan mode (button click)
  const togglePanMode = () => {
    // If already in pan mode, switch back to select mode
    if (editorMode === 'pan') {
      setEditorMode('select');
      setIsPanActive(false);
      setPreviousMode(null);
    } else {
      // Switch to pan mode (permanent)
      setPreviousMode(editorMode as 'select' | 'addNode');
      setEditorMode('pan');
      setIsPanActive(true);
    }
  };

  // Set select mode and ensure pan mode is deactivated
  const setSelectMode = () => {
    setEditorMode('select');
    setIsPanActive(false);
    setPreviousMode(null);
  };

  // Set add node mode
  const setAddNodeMode = () => {
    if (editorMode === 'addNode') {
      // If already in add node mode, switch to select mode
      setEditorMode('select');
      setNodeTypeTrayOpen(false);
    } else {
      // Just open tray but stay in select mode until node type is selected
      setNodeTypeTrayOpen(true);
    }
  };

  // Space key handler for temporary pan mode
  useEffect(() => {
    // Only add the listener if we're in the diagram tab
    if (mainTabIndex !== 0) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Only activate pan mode with space if not editing text
      // Check if the active element is a text input or contentEditable
      const activeElement = document.activeElement;
      const isTextInput = activeElement?.tagName === 'INPUT' 
        || activeElement?.tagName === 'TEXTAREA'
        || activeElement?.getAttribute('contenteditable') === 'true'
        || activeElement?.tagName === 'SELECT';

      if (e.code === 'Space' && !isTextInput && !isPanActive) {
        e.preventDefault(); // Prevent scrolling
        // Save current mode but don't change it
        if (editorMode !== 'pan') {
          setPreviousMode(editorMode as 'select' | 'addNode');
        }
        // Only set isPanActive - don't change editorMode
        setIsPanActive(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        // Only deactivate if we're not in permanent pan mode (button-activated)
        if (editorMode !== 'pan') {
          setIsPanActive(false);
        }
      }
    };

    // Use capture phase to ensure we get the events before other handlers
    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('keyup', handleKeyUp, true);

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('keyup', handleKeyUp, true);
    };
  }, [mainTabIndex, isPanActive, editorMode, previousMode]);

  // Update tab change to reset pan mode
  useEffect(() => {
    // Reset pan mode when changing tabs
    if (mainTabIndex !== 0) {
      setIsPanActive(false);
      if (editorMode === 'pan') {
        setEditorMode('select');
      }
    }
  }, [mainTabIndex]);

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
              <AltRouteRotated iconColor={COLORS.iconColor} />
              
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
                <AltRouteRotated iconColor={COLORS.iconColor} />
                
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
            
            {/* Project name to the right of the tabs */}
            <Typography 
              variant="subtitle1" 
              component="div" 
              sx={{ 
                color: COLORS.text,
                fontSize: '1rem',
                fontWeight: 'medium',
                ml: 3,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '200px'
              }}
            >
              {currentProject ? currentProject.name : 'No Project Selected'}
            </Typography>
          </Box>

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

            <Tooltip title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}>
              <IconButton 
                size="small" 
                sx={{ color: COLORS.iconColor }}
                onClick={toggleTheme}
              >
                {isDarkMode ? <LightModeOutlinedIcon fontSize="small" /> : <DarkModeOutlinedIcon fontSize="small" />}
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
            {mainTabIndex === 0 && (
              <DiagramView 
                activeNodeType={editorMode === 'addNode' ? activeNodeType : null}
                isSelectMode={editorMode === 'select'}
                isPanMode={editorMode === 'pan' || isPanActive}
                onNodeAdded={handleNodeAdded}
              />
            )}
            {mainTabIndex === 1 && <ReportView />}
            {mainTabIndex === 2 && <SummaryView />}
          </Box>

          {/* RIGHT SIDEBAR (TOOLBAR) - Only visible in diagram view */}
          {mainTabIndex === 0 && (
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
                {/* Add Node button - opens node type tray */}
                <Tooltip title={editorMode === 'addNode' ? 'Add Node Mode (active)' : 'Add Node'} placement="left">
                  <IconButton 
                    size="small" 
                    sx={{ 
                      color: editorMode === 'addNode' ? '#1976d2' : COLORS.iconColor,
                      backgroundColor: editorMode === 'addNode' ? 'rgba(25, 118, 210, 0.1)' : 'transparent',
                      '&:hover': {
                        backgroundColor: editorMode === 'addNode' ? 'rgba(25, 118, 210, 0.2)' : 'rgba(0, 0, 0, 0.04)'
                      }
                    }}
                    onClick={setAddNodeMode}
                  >
                    <AddOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                
                {/* Duplicate */}
                <Tooltip title="Duplicate" placement="left">
                  <IconButton 
                    size="small" 
                    disabled={editorMode !== 'select'} 
                    sx={{ 
                      color: COLORS.iconColor,
                      opacity: editorMode !== 'select' ? 0.5 : 1
                    }}
                  >
                    <ContentCopyOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                
                {/* Delete */}
                <Tooltip title="Delete" placement="left">
                  <IconButton 
                    size="small" 
                    disabled={editorMode !== 'select'} 
                    sx={{ 
                      color: COLORS.iconColor,
                      opacity: editorMode !== 'select' ? 0.5 : 1
                    }}
                    onClick={deleteSelectedNode}
                  >
                    <DeleteOutlineOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                
                <Divider sx={{ width: '70%', my: 0.5 }} />
                
                {/* VIEW CONTROLS - With Select as first button */}
                {/* Select Mode button */}
                <Tooltip title={editorMode === 'select' ? 'Select Mode (active)' : 'Select Mode'} placement="left">
                  <IconButton 
                    size="small" 
                    sx={{ 
                      color: editorMode === 'select' ? '#1976d2' : COLORS.iconColor,
                      backgroundColor: editorMode === 'select' ? 'rgba(25, 118, 210, 0.1)' : 'transparent',
                      '&:hover': {
                        backgroundColor: editorMode === 'select' ? 'rgba(25, 118, 210, 0.2)' : 'rgba(0, 0, 0, 0.04)'
                      }
                    }}
                    onClick={setSelectMode}
                  >
                    <MouseOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title={editorMode === 'pan' ? 'Pan Mode (active)' : 'Pan Mode'} placement="left">
                  <IconButton 
                    size="small" 
                    sx={{ 
                      color: editorMode === 'pan' ? '#1976d2' : COLORS.iconColor,
                      backgroundColor: editorMode === 'pan' ? 'rgba(25, 118, 210, 0.1)' : 'transparent',
                      '&:hover': {
                        backgroundColor: editorMode === 'pan' ? 'rgba(25, 118, 210, 0.2)' : 'rgba(0, 0, 0, 0.04)'
                      }
                    }}
                    onClick={togglePanMode}
                  >
                    <PanToolOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Zoom In" placement="left">
                  <IconButton size="small" sx={{ color: COLORS.iconColor }}>
                    <ZoomInOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Zoom Out" placement="left">
                  <IconButton size="small" sx={{ color: COLORS.iconColor }}>
                    <ZoomOutOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Fit to Screen" placement="left">
                  <IconButton size="small" sx={{ color: COLORS.iconColor }}>
                    <CropFreeOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>
              
              {/* Node Type Tray */}
              <NodeTypeTray 
                open={nodeTypeTrayOpen} 
                onClose={() => setNodeTypeTrayOpen(false)}
                onSelectNodeType={(type) => {
                  setActiveNodeType(type);
                  setEditorMode('addNode');
                  setNodeTypeTrayOpen(false);
                }}
              />
            </Box>
          )}
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