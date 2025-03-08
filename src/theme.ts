import { createTheme } from '@mui/material/styles';

// Define custom colors for node types
declare module '@mui/material/styles' {
  interface Palette {
    incident?: {
      main: string;
    };
    event?: {
      main: string;
    };
    condition?: {
      main: string;
    };
    assumption?: {
      main: string;
    };
    damage?: {
      main: string;
    };
  }
  interface PaletteOptions {
    incident?: {
      main: string;
    };
    event?: {
      main: string;
    };
    condition?: {
      main: string;
    };
    assumption?: {
      main: string;
    };
    damage?: {
      main: string;
    };
  }
}

// Define colors used throughout the application
const COLORS = {
  // Node types
  incident: '#2196f3',      // Blue
  event: '#4caf50',         // Green
  condition: '#ff9800',     // Orange
  assumption: '#03a9f4',    // Light blue
  damage: '#e91e63',        // Pink
  
  // UI Colors
  activeTab: '#666666',     // Darker gray for active tab
  inactiveTab: '#bbbbbb',   // Lighter gray for inactive tab
  iconColor: '#999999',     // Icon color
  text: '#666666',          // Text color
  lightText: '#999999',     // Light text color
  background: '#ffffff',    // White background
  border: 'rgba(0, 0, 0, 0.12)'   // Border color
};

// Create the theme
const theme = createTheme({
  palette: {
    primary: {
      main: COLORS.incident,
    },
    secondary: {
      main: COLORS.event,
    },
    background: {
      default: '#fafafa',
      paper: '#ffffff',
    },
    text: {
      primary: COLORS.text,
      secondary: COLORS.lightText,
    },
    // Custom node type colors
    incident: {
      main: COLORS.incident,
    },
    event: {
      main: COLORS.event,
    },
    condition: {
      main: COLORS.condition,
    },
    assumption: {
      main: COLORS.assumption,
    },
    damage: {
      main: COLORS.damage,
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: COLORS.background,
          color: COLORS.text,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: COLORS.background,
          border: 'none',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          minWidth: 'unset',
          color: COLORS.inactiveTab,
          '&.Mui-selected': {
            color: COLORS.activeTab,
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          backgroundColor: COLORS.activeTab,
        },
      },
    },
    MuiToolbar: {
      styleOverrides: {
        root: {
          minHeight: '48px',
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: COLORS.iconColor,
        },
      },
    },
    MuiAccordion: {
      styleOverrides: {
        root: {
          border: 'none',
          boxShadow: 'none',
          '&:before': {
            display: 'none',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: COLORS.border,
            },
            '&:hover fieldset': {
              borderColor: COLORS.border,
            },
            '&.Mui-focused fieldset': {
              borderColor: COLORS.border,
              borderWidth: '1px',
            },
          },
        },
      },
    },
    MuiFormControl: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: COLORS.border,
            },
            '&:hover fieldset': {
              borderColor: COLORS.border,
            },
            '&.Mui-focused fieldset': {
              borderColor: COLORS.border,
              borderWidth: '1px',
            },
          },
        },
      }
    }
  },
});

export default theme; 