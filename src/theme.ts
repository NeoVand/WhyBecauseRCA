import { createTheme, Theme } from '@mui/material/styles';
import { ThemeMode } from './contexts/ThemeContext';
import { LIGHT_COLORS, DARK_COLORS, NODE_COLORS } from './constants/themeColors';

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
    mode: ThemeMode;
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
    mode?: ThemeMode;
  }
}

// Create theme factory function to generate theme based on mode
export const createAppTheme = (mode: ThemeMode): Theme => {
  const colors = mode === 'light' ? LIGHT_COLORS : DARK_COLORS;
  
  return createTheme({
    palette: {
      mode,
      primary: {
        main: NODE_COLORS.incident,
      },
      secondary: {
        main: NODE_COLORS.event,
      },
      background: {
        default: colors.mainBackground,
        paper: colors.background,
      },
      text: {
        primary: colors.text,
        secondary: colors.lightText,
      },
      divider: colors.divider,
      // Custom node type colors (stay consistent in both modes)
      incident: {
        main: NODE_COLORS.incident,
      },
      event: {
        main: NODE_COLORS.event,
      },
      condition: {
        main: NODE_COLORS.condition,
      },
      assumption: {
        main: NODE_COLORS.assumption,
      },
      damage: {
        main: NODE_COLORS.damage,
      },
    },
    components: {
      // AppBar styles
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: colors.background,
            color: colors.text,
          },
        },
        defaultProps: {
          elevation: 0,
        },
      },
      // Paper styles
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundColor: colors.background,
          },
        },
      },
      // Toolbar styles
      MuiToolbar: {
        styleOverrides: {
          root: {
            backgroundColor: colors.background,
          },
        },
      },
      // Dialog styles
      MuiDialog: {
        styleOverrides: {
          paper: {
            backgroundColor: colors.dialogBg,
          },
        },
      },
      // Button styles
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
          },
        },
      },
      // List item styles
      MuiListItem: {
        styleOverrides: {
          root: {
            '&:hover': {
              backgroundColor: colors.hoverBg,
            },
          },
        },
      },
      // Tab styles
      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            minWidth: 'auto',
            fontWeight: 400,
            fontSize: '0.875rem',
            '&.Mui-selected': {
              color: colors.activeTab,
              fontWeight: 500,
            },
            color: colors.inactiveTab,
          },
        },
      },
      // Menu styles
      MuiMenu: {
        styleOverrides: {
          paper: {
            backgroundColor: colors.background,
          },
        },
      },
      // Other components as needed
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
        '"Apple Color Emoji"',
        '"Segoe UI Emoji"',
        '"Segoe UI Symbol"',
      ].join(','),
      h1: {
        fontSize: '2rem',
        fontWeight: 500,
      },
      h2: {
        fontSize: '1.75rem',
        fontWeight: 500,
      },
      h3: {
        fontSize: '1.5rem',
        fontWeight: 500,
      },
      h4: {
        fontSize: '1.25rem',
        fontWeight: 500,
      },
      h5: {
        fontSize: '1.125rem',
        fontWeight: 500,
      },
      h6: {
        fontSize: '1rem',
        fontWeight: 500,
      },
      body1: {
        fontSize: '0.875rem',
      },
      body2: {
        fontSize: '0.75rem',
      },
    },
  });
};

// Create default light theme
const theme = createAppTheme('light');

export default theme; 