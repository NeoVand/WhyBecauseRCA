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
  isPanMode: boolean;
  onNodeAdded: () => void;
}

export function DiagramView({ activeNodeType, isSelectMode, isPanMode, onNodeAdded }: DiagramViewProps) {
  const { isDarkMode } = useTheme();
  const { currentProject } = useProject();
  const COLORS = getViewColors(isDarkMode);
  
  const [nodes, setNodes] = useState<CausalNode[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // Panning state
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0 });
  // Store diagram viewport position rather than scroll
  const [diagramPosition, setDiagramPosition] = useState({ x: 0, y: 0 });
  
  const diagramRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Update data attribute when pan mode changes
  useEffect(() => {
    if (diagramRef.current) {
      diagramRef.current.setAttribute('data-pan-mode', isPanMode ? 'true' : 'false');
      
      // Force the cursor style directly
      diagramRef.current.style.cursor = isPanMode ? 'grab' : (isSelectMode ? 'default' : 'crosshair');
    }
  }, [isPanMode, isSelectMode]);
  
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
  
  // Setup global handlers for panning
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isPanning) return;
      
      // Calculate movement
      const deltaX = e.clientX - panStartRef.current.x;
      const deltaY = e.clientY - panStartRef.current.y;
      
      // Update the diagram position (move in the direction of mouse movement)
      setDiagramPosition(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));
      
      // Update the reference point for next move
      panStartRef.current = { x: e.clientX, y: e.clientY };
    };
    
    const onMouseUp = () => {
      if (isPanning) {
        setIsPanning(false);
        
        // Reset cursor
        if (diagramRef.current && isPanMode) {
          diagramRef.current.style.cursor = 'grab';
        }
      }
    };
    
    if (isPanning) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
      
      return () => {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
      };
    }
  }, [isPanning, isPanMode, diagramPosition]);
  
  // Handle mouse down for panning
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Make sure panning is only activated in pan mode
    if (!isPanMode) return;
    
    // If we're clicking directly on a node, don't initiate panning from here
    const isNodeClick = (e.target as HTMLElement).closest('.node-item') !== null;
    
    // Only proceed if we're clicking on the diagram background (not a node)
    if (isNodeClick) return;
    
    // Prevent default behavior
    e.preventDefault();
    
    // Store starting position
    panStartRef.current = { x: e.clientX, y: e.clientY };
    
    // Set cursor to grabbing
    if (diagramRef.current) {
      diagramRef.current.style.cursor = 'grabbing';
    }
    
    setIsPanning(true);
  };
  
  // Handle click on the diagram background
  const handleDiagramClick = async (e: React.MouseEvent<HTMLDivElement>) => {
    // If we're panning or the click isn't directly on the content box, ignore
    if (isPanning) return;
    
    // Only process clicks directly on the diagram content (not on nodes)
    // Check if contentRef contains the target and it's not a node
    const isContentClick = contentRef.current?.contains(e.target as Node) && 
                         !(e.target as HTMLElement).closest('.node-item');
    
    if (!isContentClick) return;
    
    // Don't create nodes when in select/pan mode or if dragging
    if (isSelectMode || isPanMode || isDragging || !activeNodeType || !currentProject) {
      // Clear selection if in select mode and clicking background
      if (isSelectMode && !isDragging && !isPanMode) {
        setSelectedNodeId(null);
      }
      return;
    }
    
    // Get click position relative to the content container, accounting for the translation
    const contentRect = contentRef.current?.getBoundingClientRect();
    if (!contentRect) return;
    
    // Calculate position in the diagram's coordinate system
    // We need to account for the current transform/translation
    const x = e.clientX - contentRect.left - diagramPosition.x;
    const y = e.clientY - contentRect.top - diagramPosition.y;
    
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
      data-pan-mode={isPanMode ? 'true' : 'false'}
      sx={{ 
        height: '100%', 
        width: '100%',
        position: 'relative',
        overflow: 'hidden', // Change to hidden so we can control positioning
        backgroundColor: COLORS.diagramBg,
        userSelect: 'none', // Prevent text selection during panning
      }}
      onClick={handleDiagramClick}
      onMouseDown={handleMouseDown}
    >
      {/* Content container that can be moved for panning */}
      <Box
        ref={contentRef}
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '3000px',  // Make this larger than viewport to ensure we can pan
          height: '3000px', // Make this larger than viewport to ensure we can pan
          transform: `translate(${diagramPosition.x}px, ${diagramPosition.y}px)`,
          backgroundImage: `
            radial-gradient(${COLORS.gridDot} 1px, transparent 1px),
            radial-gradient(${COLORS.gridDot} 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px',
          // Use will-change for better performance during transformations
          willChange: 'transform',
        }}
      >
        {/* Nodes */}
        {nodes.map(node => (
          <NodeItem
            key={node.id}
            node={{
              ...node,
              // Adjust node position based on diagram position (for proper rendering)
              x: node.x,
              y: node.y,
            }}
            isSelected={node.id === selectedNodeId}
            onSelect={handleNodeSelect}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={() => {
              // Delay to avoid triggering click
              setTimeout(() => setIsDragging(false), 100);
            }}
            className="node-item"
          />
        ))}
        
        {/* Empty state / placeholder (show only when no nodes) */}
        {nodes.length === 0 && (
          <Box 
            sx={{ 
              position: 'fixed', // Fix to viewport
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
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
    </Box>
  );
} 