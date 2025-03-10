import { createContext, useState, useContext, ReactNode } from 'react';

// Enum for different editor modes
export enum EditorMode {
  SELECT = 'select',
  ADD_NODE = 'add_node',
  ADD_EDGE = 'add_edge',
  DELETE = 'delete'
}

// Interface for the toolbar context
interface ToolbarContextType {
  editorMode: EditorMode;
  setEditorMode: (mode: EditorMode) => void;
  toggleEditorMode: (mode: EditorMode) => void;
}

// Create context with default values
const ToolbarContext = createContext<ToolbarContextType | undefined>(undefined);

// Provider component
export function ToolbarProvider({ children }: { children: ReactNode }) {
  // State for the current editor mode
  const [editorMode, setEditorMode] = useState<EditorMode>(EditorMode.SELECT);

  // Toggle editor mode (set if different, reset to SELECT if already active)
  const toggleEditorMode = (mode: EditorMode) => {
    setEditorMode(currentMode => 
      currentMode === mode ? EditorMode.SELECT : mode
    );
  };

  // Context value
  const contextValue: ToolbarContextType = {
    editorMode,
    setEditorMode,
    toggleEditorMode
  };

  return (
    <ToolbarContext.Provider value={contextValue}>
      {children}
    </ToolbarContext.Provider>
  );
}

// Custom hook for using the toolbar context
export function useToolbar() {
  const context = useContext(ToolbarContext);
  if (context === undefined) {
    throw new Error('useToolbar must be used within a ToolbarProvider');
  }
  return context;
} 