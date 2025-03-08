// Central theme colors constants file to ensure consistency across the application

// Define light mode colors
export const LIGHT_COLORS = {
  text: '#666666',                   // Primary text
  lightText: '#999999',              // Secondary text
  background: '#ffffff',             // Primary background
  mainBackground: '#fafafa',         // Main area background
  headerBackground: '#ffffff',       // Header background
  sidebarBackground: '#ffffff',      // Sidebar background
  border: 'rgba(0, 0, 0, 0.12)',     // Borders
  divider: 'rgba(0, 0, 0, 0.12)',    // Dividers
  iconColor: '#999999',              // Icons
  activeTab: '#666666',              // Active tab
  inactiveTab: '#bbbbbb',            // Inactive tab
  buttonBg: '#888888',               // Button background
  buttonHoverBg: '#666666',          // Button hover
  focusBorder: '#666666',            // Focus border
  inputBg: '#ffffff',                // Input background
  selectBg: '#ffffff',               // Select background
  hoverBg: 'rgba(0, 0, 0, 0.02)',    // Hover background
  listItemHover: 'rgba(0, 0, 0, 0.04)', // List item hover
  backdropColor: 'rgba(0, 0, 0, 0.2)', // Modal backdrop
  dialogBg: '#ffffff',               // Dialog background
  gridDot: 'rgba(0, 0, 0, 0.05)',    // Grid dots
  warningColor: '#d32f2f',           // Warning/delete color
  paperBg: 'rgba(255, 255, 255, 0.9)' // Paper background
};

// Define dark mode colors (much darker than before)
export const DARK_COLORS = {
  text: '#e0e0e0',                   // Primary text
  lightText: '#a0a0a0',              // Secondary text
  background: '#121212',             // Primary background (nearly black)
  mainBackground: '#0a0a0a',         // Main area background
  headerBackground: '#121212',       // Header background
  sidebarBackground: '#121212',      // Sidebar background
  border: 'rgba(255, 255, 255, 0.08)', // Borders (very subtle)
  divider: 'rgba(255, 255, 255, 0.08)', // Dividers
  iconColor: '#b0b0b0',              // Icons
  activeTab: '#e0e0e0',              // Active tab
  inactiveTab: '#777777',            // Inactive tab
  buttonBg: '#333333',               // Button background
  buttonHoverBg: '#444444',          // Button hover
  focusBorder: '#a0a0a0',            // Focus border
  inputBg: '#1a1a1a',                // Input background
  selectBg: '#1a1a1a',               // Select background
  hoverBg: 'rgba(255, 255, 255, 0.03)', // Hover background
  listItemHover: 'rgba(255, 255, 255, 0.04)', // List item hover
  backdropColor: 'rgba(0, 0, 0, 0.8)', // Modal backdrop
  dialogBg: '#0f0f0f',               // Dialog background (extremely dark)
  gridDot: 'rgba(255, 255, 255, 0.05)', // Grid dots
  warningColor: '#f44336',           // Warning/delete color
  paperBg: 'rgba(16, 16, 16, 0.95)'  // Paper background
};

// Helper function to get the appropriate colors based on theme mode
export const getThemeColors = (isDarkMode: boolean) => {
  return isDarkMode ? DARK_COLORS : LIGHT_COLORS;
};

// Node colors that remain consistent across light and dark modes
export const NODE_COLORS = {
  incident: '#2196f3',      // Blue
  event: '#4caf50',         // Green
  condition: '#ff9800',     // Orange
  assumption: '#03a9f4',    // Light blue
  damage: '#e91e63',        // Pink
  agent5Whys: '#2196f3'     // Blue color for 5-Whys agent
}; 