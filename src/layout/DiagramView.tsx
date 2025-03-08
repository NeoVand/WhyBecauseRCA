import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Box, Typography } from '@mui/material';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import { useTheme } from '../contexts/ThemeContext';
import { useProject } from '../contexts/ProjectContext';
import { CausalNode, NodeType } from '../models/types';
import { NodeItem } from '../components/NodeItem';
import NodeService from '../services/nodeService';

// Function to get colors based on current theme
const getViewColors = (isDarkMode: boolean) => {
  return {
    activeTab: isDarkMode ? '#e0e0e0' : '#666666',              // Active tab color
    inactiveTab: isDarkMode ? '#777777' : '#bbbbbb',            // Inactive tab color
    iconColor: isDarkMode ? '#b0b0b0' : '#999999',              // Icon color
    text: isDarkMode ? '#e0e0e0' : '#666666',                   // Text color
    lightText: isDarkMode ? '#a0a0a0' : '#999999',              // Light text color
    background: isDarkMode ? '#1e1e1e' : '#ffffff',             // Background color
    border: isDarkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)', // Border color
    gridDot: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)', // Grid dots
    diagramBg: isDarkMode ? '#121212' : '#ffffff'               // Diagram background
  };
};

// Interface for the DiagramView component
interface DiagramViewProps {
  activeNodeType: NodeType | null;
  isSelectMode: boolean;
  onNodeAdded: () => void;
}

export function DiagramView({ activeNodeType, isSelectMode, onNodeAdded }: DiagramViewProps) {
  const { isDarkMode } = useTheme();
  const { currentProject } = useProject();
  const COLORS = getViewColors(isDarkMode);
  
  const [nodes, setNodes] = useState<CausalNode[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const diagramRef = useRef<HTMLDivElement>(null);
  
  // Load nodes on component mount and when project changes
  useEffect(() => {
    let isMounted = true;
    
    const loadNodes = async () => {
      if (currentProject) {
        try {
          const projectNodes = await NodeService.getNodesByProject(currentProject.id);
          // Only update state if component is still mounted
          if (isMounted) {
            setNodes(projectNodes || []);
          }
        } catch (error) {
          console.error('Error loading nodes:', error);
          // If there's an error, set nodes to empty array to prevent further errors
          if (isMounted) {
            setNodes([]);
          }
        }
      }
    };
    
    loadNodes();
    
    // Cleanup function to prevent state updates on unmounted component
    return () => {
      isMounted = false;
    };
  }, [currentProject]);
  
  // Handle click on the diagram background
  const handleDiagramClick = async (e: React.MouseEvent<HTMLDivElement>) => {
    // Check if the click is directly on the diagram, not on a child element
    if (e.target !== e.currentTarget) return;
    
    // Don't create node if in select mode or dragging
    if (isSelectMode || isDragging || !activeNodeType || !currentProject) {
      // Clear selection if clicking on background in select mode
      if (isSelectMode && !isDragging) {
        setSelectedNodeId(null);
      }
      return;
    }
    
    // Get click position relative to the diagram, with scroll offset
    const diagramRect = diagramRef.current?.getBoundingClientRect();
    if (!diagramRect) return;
    
    const scrollLeft = diagramRef.current?.scrollLeft || 0;
    const scrollTop = diagramRef.current?.scrollTop || 0;
    
    const x = e.clientX - diagramRect.left + scrollLeft;
    const y = e.clientY - diagramRect.top + scrollTop;
    
    try {
      // Create a new node at the clicked position
      const newNode = await NodeService.createNode({
        projectId: currentProject.id,
        type: activeNodeType,
        title: `New ${activeNodeType}`,
        description: '',
        x,
        y
      });
      
      // Add new node to the local state
      setNodes(prev => [...prev, newNode]);
      
      // Select the newly created node
      setSelectedNodeId(newNode.id);
      
      // Notify parent that a node was added (to switch to select mode)
      onNodeAdded();
      
    } catch (error) {
      console.error('Error creating node:', error);
      
      // Even on error, switch to select mode as feedback to user that their click was processed
      onNodeAdded();
      
      // Show an error notification (implement this in the future if needed)
      // For now, just log to console
    }
  };
  
  // Handle node selection
  const handleNodeSelect = (nodeId: string) => {
    setSelectedNodeId(nodeId === selectedNodeId ? null : nodeId);
  };
  
  // Handle node delete with keyboard
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (selectedNodeId && (e.key === 'Delete' || e.key === 'Backspace')) {
      deleteSelectedNode();
    }
  }, [selectedNodeId]);
  
  // Add global keyboard handlers
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
  
  // Delete the selected node
  const deleteSelectedNode = async () => {
    if (selectedNodeId) {
      try {
        await NodeService.deleteNode(selectedNodeId);
        setNodes(prev => prev.filter(node => node.id !== selectedNodeId));
        setSelectedNodeId(null);
      } catch (error) {
        console.error('Error deleting node:', error);
      }
    }
  };
  
  return (
    <Box 
      ref={diagramRef}
      id="diagram-container"
      sx={{ 
        height: '100%', 
        width: '100%',
        position: 'relative',
        backgroundImage: `
          radial-gradient(${COLORS.gridDot} 1px, transparent 1px),
          radial-gradient(${COLORS.gridDot} 1px, transparent 1px)
        `,
        backgroundSize: '20px 20px',
        backgroundColor: COLORS.diagramBg,
        overflow: 'auto',
        flexGrow: 1,
        cursor: isSelectMode ? 'default' : 'crosshair',
      }}
      onClick={handleDiagramClick}
    >
      {/* Render nodes */}
      {nodes.map(node => (
        <NodeItem
          key={node.id}
          node={node}
          isSelected={node.id === selectedNodeId}
          onSelect={handleNodeSelect}
          onDragStart={() => setIsDragging(true)}
          onDragEnd={() => {
            // Delay to avoid triggering click
            setTimeout(() => setIsDragging(false), 100);
          }}
        />
      ))}
      
      {/* Empty state / placeholder (show only when no nodes) */}
      {nodes.length === 0 && (
        <Box 
          sx={{ 
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0.7,
            pointerEvents: 'none', // Allow clicks to pass through to background
          }}
        >
          <AccountTreeOutlinedIcon 
            sx={{ 
              fontSize: 64,
              color: COLORS.lightText,
              mb: 2
            }} 
          />
          <Typography variant="h6" sx={{ color: COLORS.lightText }}>
            Your RCA diagram will appear here
          </Typography>
          <Typography variant="body2" sx={{ color: COLORS.lightText, mt: 1 }}>
            {isSelectMode 
              ? 'Use the toolbar to add nodes and connections' 
              : `Click anywhere to add a ${activeNodeType || 'node'}`}
          </Typography>
        </Box>
      )}
    </Box>
  );
} 