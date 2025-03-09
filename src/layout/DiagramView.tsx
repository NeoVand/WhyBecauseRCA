import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Box, Typography } from '@mui/material';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import { useTheme } from '../contexts/ThemeContext';
import { useProject } from '../contexts/ProjectContext';
import { CausalNode, NodeType, ConnectionPort, Connection } from '../models/types';
import { NodeItem } from '../components/NodeItem';
import NodeService from '../services/nodeService';
import ConnectionService from '../services/connectionService';

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
    diagramBg: isDarkMode ? '#121212' : '#ffffff',               // Diagram background
    connectionLine: isDarkMode ? '#b0b0b0' : '#999999',            // Connection line color
    connectionDraft: isDarkMode ? '#e0e0e0' : '#666666'           // Connection draft color
  };
};

// Interface for the DiagramView component
interface DiagramViewProps {
  activeNodeType: NodeType | null;
  isSelectMode: boolean;
  isPanMode: boolean;
  onNodeAdded: () => void;
  pathCurviness?: number; // Optional prop to control the curviness of connection paths
}

// Helper function to calculate smooth curved path between ports using cubic Bezier curves
const calculateSmoothPath = (
  sourceX: number, 
  sourceY: number, 
  targetX: number, 
  targetY: number,
  sourcePort: ConnectionPort,
  targetPort: ConnectionPort,
  curvinessFactor: number = 0.3 // Default curviness factor (0.1 = subtle, 1.0 = very curved)
): string => {
  // Determine direction based on port types
  const sourceDirection = sourcePort === 'top' ? -1 : 1;
  const targetDirection = targetPort === 'top' ? -1 : 1;
  
  // Vertical offsets to maintain same entry/exit angles
  const sourceOffset = 15 * sourceDirection;
  const targetOffset = 15 * targetDirection;
  
  // Calculate first segment points (exiting the source)
  const sourceExitX = sourceX;
  const sourceExitY = sourceY + sourceOffset;
  
  // Calculate last segment points (entering the target)
  const targetEntryX = targetX;
  const targetEntryY = targetY + targetOffset;
  
  // Calculate horizontal distance between nodes
  const horizontalDistance = Math.abs(targetX - sourceX);
  
  // Calculate control point distances - these determine the "bulge" of the curve
  // Adjust with curvinessFactor to control how curved the paths are
  const maxCurveDistance = 250; // Maximum curve distance to prevent excessive curves
  const controlPointDistance = Math.max(
    horizontalDistance * curvinessFactor, 
    Math.min(horizontalDistance, maxCurveDistance * curvinessFactor)
  );
  
  // Calculate control points for the cubic Bezier curve
  // First control point extends from source in vertical direction
  const cp1x = sourceX;
  const cp1y = sourceY + sourceOffset + (controlPointDistance * sourceDirection);
  
  // Second control point extends from target in vertical direction
  const cp2x = targetX;
  const cp2y = targetY + targetOffset + (controlPointDistance * targetDirection);
  
  // Generate path string using cubic Bezier curve
  return `M ${sourceX} ${sourceY} ` +                // Starting point
         `L ${sourceExitX} ${sourceExitY} ` +       // Short straight line out of node
         `C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ` +   // Cubic Bezier curve with control points
         `${targetEntryX} ${targetEntryY} ` +       // End point of curve
         `L ${targetX} ${targetY}`;                 // Short straight line into node
};

// Helper function to get exact port position from DOM
const getPortPosition = (
  nodeId: string,
  portType: ConnectionPort,
  nodesRef: React.RefObject<HTMLDivElement>
): [number, number] | null => {
  if (!nodesRef.current) {
    return null;
  }
  
  // Find the node element
  const nodeSelector = `[data-node-id="${nodeId}"]`;
  const nodeElement = nodesRef.current.querySelector(nodeSelector);
  if (!nodeElement) {
    return null;
  }
  
  // Find the port element (top or bottom)
  const portClass = portType === 'top' ? 'node-top-port' : 'node-bottom-port';
  const portSelector = `.${portClass}`;
  const portElement = nodeElement.querySelector(portSelector) as HTMLElement;
  if (!portElement) {
    return null;
  }
  
  // Get the port's position relative to the diagram
  const portRect = portElement.getBoundingClientRect();
  const containerRect = nodesRef.current.getBoundingClientRect();

  // Calculate the center of the port
  const portCenterX = portRect.left + portRect.width / 2 - containerRect.left + nodesRef.current.scrollLeft;
  const portCenterY = portRect.top + portRect.height / 2 - containerRect.top + nodesRef.current.scrollTop;
  
  return [portCenterX, portCenterY];
};

export function DiagramView({ 
  activeNodeType, 
  isSelectMode, 
  isPanMode, 
  onNodeAdded,
  pathCurviness = 0.2 // Default curviness if not provided
}: DiagramViewProps) {
  const { isDarkMode } = useTheme();
  const { currentProject } = useProject();
  const COLORS = getViewColors(isDarkMode);
  
  const [nodes, setNodes] = useState<CausalNode[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // Global mouse position state - track mouse position globally
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  // Use a ref to track the latest mouse position without triggering re-renders
  const mousePositionRef = useRef({ x: 0, y: 0 });
  
  // Connection creation state
  const [connectingState, setConnectingState] = useState<{
    sourceNodeId: string;
    sourcePort: ConnectionPort;
    sourceX: number;
    sourceY: number;
    targetX: number;
    targetY: number;
  } | null>(null);
  
  // Panning state
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0 });
  // Store diagram viewport position rather than scroll
  const [diagramPosition, setDiagramPosition] = useState({ x: 0, y: 0 });
  
  const diagramRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const nodesRef = useRef<HTMLDivElement>(null);
  
  // Update ref when state changes
  useEffect(() => {
    mousePositionRef.current = mousePosition;
  }, [mousePosition]);

  // Load nodes from database
  const loadNodes = useCallback(async () => {
    if (!currentProject) return;
    try {
      const projectNodes = await NodeService.getNodesByProject(currentProject.id);
      setNodes(projectNodes);
    } catch (err) {
      console.error("Error loading nodes:", err);
    }
  }, [currentProject]);
  
  // Load connections from database
  const loadConnections = useCallback(async () => {
    if (!currentProject) return;
    try {
      const projectConnections = await ConnectionService.getConnectionsByProject(currentProject.id);
      setConnections(projectConnections);
    } catch (err) {
      console.error("Error loading connections:", err);
    }
  }, [currentProject]);
  
  // Handle updating a node's position when it's dragged
  const updateNodePosition = useCallback(async (nodeId: string, x: number, y: number) => {
    try {
      // Update local state immediately for responsiveness
      setNodes(prevNodes => prevNodes.map(node => 
        node.id === nodeId ? { ...node, x, y } : node
      ));
      
      // Persist changes to database
      await NodeService.updateNodePosition(nodeId, x, y);
      
      // Refresh connections to ensure they follow the nodes
      if (currentProject) {
        await loadConnections();
      }
    } catch (err) {
      console.error("Error updating node position:", err);
    }
  }, [currentProject, loadConnections]);
  
  // Global mouse move handler - keep track of mouse position at all times
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (diagramRef.current) {
        const rect = diagramRef.current.getBoundingClientRect();
        const scrollLeft = diagramRef.current.scrollLeft;
        const scrollTop = diagramRef.current.scrollTop;
        
        const newX = e.clientX - rect.left + scrollLeft;
        const newY = e.clientY - rect.top + scrollTop;
        
        // Only update if position has actually changed - compare with ref
        if (newX !== mousePositionRef.current.x || newY !== mousePositionRef.current.y) {
          // Update global mouse position
          setMousePosition({
            x: newX,
            y: newY
          });
        }
      }
    };
    
    document.addEventListener('mousemove', handleGlobalMouseMove);
    
    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
    };
  }, []);

  // Prevent node dragging in DiagramView when NodeItem is handling it directly
  useEffect(() => {
    // Only update node position if we're dragging and have a selected node
    // and NodeItem is not handling the drag directly
    if (isDragging && selectedNodeId && contentRef.current) {
      // For real-time rendering updates of connections,
      // We just trigger a re-render of connections during drag
      // We don't update node positions here as NodeItem handles it
      const draggingNode = document.querySelector(`[data-node-id="${selectedNodeId}"]`) as HTMLElement | null;
      if (draggingNode && draggingNode.style.transform) {
        // Node is being dragged by NodeItem component, so we don't update position here
        // Just force a re-render of connections
        loadConnections();
      }
    }
  }, [isDragging, selectedNodeId, mousePosition, loadConnections]);
  
  // Handle panning based on mouse position
  useEffect(() => {
    if (isPanning && diagramRef.current) {
      // Calculate movement from previous position
      const dx = mousePosition.x - panStartRef.current.x;
      const dy = mousePosition.y - panStartRef.current.y;
      
      if (dx !== 0 || dy !== 0) {
        // Update diagram position
      setDiagramPosition(prev => ({
          x: prev.x + dx,
          y: prev.y + dy
        }));
        
        // Update reference point for next move
        panStartRef.current = { 
          x: mousePosition.x, 
          y: mousePosition.y 
        };
      }
    }
  }, [isPanning, mousePosition]);

  // Update connection target position based on mouse position
  useEffect(() => {
    // Only update if we're in connecting mode and mouse position has changed
    if (connectingState && 
        (mousePosition.x !== connectingState.targetX || 
         mousePosition.y !== connectingState.targetY)) {
      // Use functional update to avoid capturing stale state
      setConnectingState(prev => {
        if (prev) {
          // Only update if mouse position is different from current target
          if (mousePosition.x !== prev.targetX || mousePosition.y !== prev.targetY) {
            return {
              ...prev,
              targetX: mousePosition.x,
              targetY: mousePosition.y
            };
          }
        }
        return prev;
      });
    }
  }, [mousePosition]);
  
  // For mouse up during connection creation or panning
  const handleGlobalMouseUp = useCallback(async () => {
    // Remove the connecting class
    if (diagramRef.current) {
      diagramRef.current.classList.remove('connecting');
    }
    
    // End node dragging
    if (isDragging && selectedNodeId) {
      setIsDragging(false);
      
      // Get the current node position from local state
      const currentNode = nodes.find(n => n.id === selectedNodeId);
      if (currentNode) {
        // Persist position change to database
        await updateNodePosition(selectedNodeId, currentNode.x, currentNode.y);
      }
    }
    
    // End connection creation
    if (connectingState) {
      setConnectingState(null);
    }
    
    // End panning
      if (isPanning) {
        setIsPanning(false);
        
      // Reset cursor if in pan mode
        if (diagramRef.current && isPanMode) {
          diagramRef.current.style.cursor = 'grab';
        }
      }
  }, [connectingState, isPanning, isDragging, selectedNodeId, nodes, updateNodePosition, isPanMode]);

  useEffect(() => {
    document.addEventListener('mouseup', handleGlobalMouseUp);
    
    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [handleGlobalMouseUp]);
  
  // Update data attribute when pan mode changes
  useEffect(() => {
    if (diagramRef.current) {
      diagramRef.current.setAttribute('data-pan-mode', isPanMode.toString());
      diagramRef.current.setAttribute('data-select-mode', isSelectMode.toString());
      
      // Force the cursor style directly
      diagramRef.current.style.cursor = isPanMode 
        ? 'grab' 
        : (isSelectMode ? 'default' : 'crosshair');
    }
  }, [isPanMode, isSelectMode]);
  
  // Load nodes and connections when project changes
  useEffect(() => {
    if (currentProject) {
      loadNodes();
      loadConnections();
    }
  }, [currentProject, loadNodes, loadConnections]);
  
  // Handle mouse down for panning
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isPanMode) {
    e.preventDefault();
      setIsPanning(true);
    
      // Update the cursor style to "grabbing" during the pan operation
    if (diagramRef.current) {
      diagramRef.current.style.cursor = 'grabbing';
    }
    
      // Store the starting point for the pan using our global mouse position
      panStartRef.current = { x: mousePosition.x, y: mousePosition.y };
    }
  };
  
  // Handle click on the diagram background
  const handleDiagramClick = async (e: React.MouseEvent<HTMLDivElement>) => {
    // Don't create nodes if we're in pan mode or if we're dragging
    if (isPanMode || isDragging || connectingState) return;
    
    // Don't create nodes if we're clicking on an existing node
    if ((e.target as HTMLElement).closest('.node-item')) return;
    
    // Only create nodes in add mode (not select mode)
    if (isSelectMode) {
      // In select mode, clicking on the background deselects the current node
        setSelectedNodeId(null);
      return;
    }
    
    // If we have an active node type, create a new node
    if (activeNodeType && currentProject) {
      try {
        // Calculate position relative to the diagram content
    const contentRect = contentRef.current?.getBoundingClientRect();
    if (!contentRect) return;
    
        const diagramRect = diagramRef.current?.getBoundingClientRect();
        if (!diagramRect) return;
        
        // Calculate position relative to the diagram content
        const x = e.clientX - diagramRect.left + (diagramRef.current?.scrollLeft || 0) - diagramPosition.x;
        const y = e.clientY - diagramRect.top + (diagramRef.current?.scrollTop || 0) - diagramPosition.y;
        
        // Create the new node
        const newNode: Omit<CausalNode, 'id'> = {
        projectId: currentProject.id,
        type: activeNodeType,
        title: `New ${activeNodeType}`,
        description: '',
        x,
        y
        };
      
        const createdNode = await NodeService.createNode(newNode);
      
        // Add the new node to the local state
        setNodes(prevNodes => [...prevNodes, createdNode]);
      
        // Select the new node
        setSelectedNodeId(createdNode.id);
      
        // Notify parent that a node was added
      onNodeAdded();
      } catch (err) {
        console.error("Error creating node:", err);
      }
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
    if (!selectedNodeId) return;
    
      try {
      // Delete any connections associated with this node
      await ConnectionService.deleteConnectionsForNode(selectedNodeId);
      
      // Delete the node
        await NodeService.deleteNode(selectedNodeId);
      
      // Update local state
      setNodes(prevNodes => prevNodes.filter(node => node.id !== selectedNodeId));
      setConnections(prevConnections => 
        prevConnections.filter(conn => 
          conn.sourceNodeId !== selectedNodeId && conn.targetNodeId !== selectedNodeId
        )
      );
      
      // Clear selection
        setSelectedNodeId(null);
    } catch (err) {
      console.error("Error deleting node:", err);
    }
  };
  
  // Port mouse down handler - start connection
  const handlePortMouseDown = (nodeId: string, portType: ConnectionPort, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault(); // Prevent any default behavior
    
    if (!diagramRef.current || !nodesRef.current) {
      return;
    }
    
    // Add a class to the diagram to indicate we're connecting
    diagramRef.current.classList.add('connecting');
    
    // Get the exact port position
    const portPosition = getPortPosition(nodeId, portType, nodesRef as React.RefObject<HTMLDivElement>);
    if (!portPosition) {
      return;
    }
    
    const [sourceX, sourceY] = portPosition;
    
    // Start creating a connection - targetX and targetY start at the mouse position
    setConnectingState({
      sourceNodeId: nodeId,
      sourcePort: portType,
      sourceX,
      sourceY,
      targetX: mousePosition.x,
      targetY: mousePosition.y
    });
  };
  
  // Port mouse up handler - complete connection
  const handlePortMouseUp = async (nodeId: string, portType: ConnectionPort, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // If we're not creating a connection, do nothing
    if (!connectingState) {
      return;
    }
    
    // Don't connect to the same node
    if (connectingState.sourceNodeId === nodeId) {
      setConnectingState(null);
      return;
    }
    
    // Check valid port combinations
    // In most cases we want bottom→top, but allow top→bottom for reverse connections
    const isValidPortCombination = (
      (connectingState.sourcePort === 'bottom' && portType === 'top') ||
      (connectingState.sourcePort === 'top' && portType === 'bottom')
    );
    
    if (!isValidPortCombination) {
      setConnectingState(null);
      return;
    }
    
    // Check for cycles
    try {
      // For forward connections (bottom→top), check source→target
      // For backward connections (top→bottom), check target→source
      const checkSourceId = connectingState.sourcePort === 'bottom' 
        ? connectingState.sourceNodeId 
        : nodeId;
        
      const checkTargetId = connectingState.sourcePort === 'bottom'
        ? nodeId
        : connectingState.sourceNodeId;
      
      const wouldCreateCycle = await ConnectionService.wouldFormCycle(checkSourceId, checkTargetId);
      
      if (wouldCreateCycle) {
        alert('Cannot create connection: would form a cycle in the graph');
        setConnectingState(null);
        return;
      }
      
      // Create connection in correct direction
      let newConnection: Omit<Connection, 'id'>;
      
      if (connectingState.sourcePort === 'bottom') {
        // Forward connection: source bottom → target top
        newConnection = {
          projectId: currentProject!.id,
          sourceNodeId: connectingState.sourceNodeId,
          targetNodeId: nodeId,
          sourcePort: 'bottom',
          targetPort: 'top'
        };
      } else {
        // Backward connection: source top → target bottom
        newConnection = {
          projectId: currentProject!.id,
          sourceNodeId: nodeId,
          targetNodeId: connectingState.sourceNodeId,
          sourcePort: 'bottom',
          targetPort: 'top'
        };
      }
      
      const createdConnection = await ConnectionService.createConnection(newConnection);
      setConnections([...connections, createdConnection]);
      
    } catch (err) {
      console.error("Error creating connection:", err);
    }
    
    // Reset connection state
    setConnectingState(null);
  };
  
  // Handle node resize (expansion/collapse)
  const handleNodeResize = useCallback(() => {
    // Refresh connections to update arrow positions in real-time
    loadConnections();
  }, [loadConnections]);
  
  // Add references and state for JavaScript animation
  const animationRef = useRef<number | null>(null);
  const [dashOffset, setDashOffset] = useState(0);
  
  // Setup and handle the animation with direct DOM manipulation
  useEffect(() => {
    const dashLength = 7; // Total length of dash+gap (4+3)
    
    // Animation function using requestAnimationFrame
    const animateDashes = () => {
      // Update all path elements with the current offset
      const paths = document.querySelectorAll('.diagram-connection-path');
      paths.forEach(path => {
        if (path instanceof SVGPathElement) {
          path.style.strokeDashoffset = String(dashOffset);
        }
      });
      
      // Update the offset for the next frame
      setDashOffset((prevOffset) => (prevOffset + 0.5) % dashLength);
      
      // Continue the animation loop
      animationRef.current = requestAnimationFrame(animateDashes);
    };
    
    // Start animation
    animationRef.current = requestAnimationFrame(animateDashes);
    
    // Cleanup animation on unmount
    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);
  
  // Render the SVG connections layer
  const renderConnectionsLayer = () => {
    return (
      <svg 
        className="connections-layer"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 1
        }}
      >
        <defs>
          <marker 
            id="arrowhead" 
            markerWidth="10" 
            markerHeight="7" 
            refX="0" 
            refY="3.5" 
            orient="auto"
          >
            <polygon 
              points="0 0, 10 3.5, 0 7" 
              fill={COLORS.connectionLine} 
            />
          </marker>
          <marker 
            id="arrowhead-draft" 
            markerWidth="10" 
            markerHeight="7" 
            refX="0" 
            refY="3.5" 
            orient="auto"
          >
            <polygon 
              points="0 0, 10 3.5, 0 7" 
              fill={COLORS.connectionDraft} 
            />
          </marker>
        </defs>
        
        {/* Render existing connections */}
        {connections.map(connection => {
          // Get port positions for source and target
          const sourceNode = nodes.find(n => n.id === connection.sourceNodeId);
          const targetNode = nodes.find(n => n.id === connection.targetNodeId);
          
          // Skip rendering if either node doesn't exist
          if (!sourceNode || !targetNode) return null;
          
          // Use getPortPosition if nodes are rendered in the DOM
          const sourcePos = getPortPosition(
            connection.sourceNodeId, 
            connection.sourcePort, 
            nodesRef as React.RefObject<HTMLDivElement>
          );
          
          const targetPos = getPortPosition(
            connection.targetNodeId, 
            connection.targetPort, 
            nodesRef as React.RefObject<HTMLDivElement>
          );
          
          // If we can't get port positions from DOM (e.g., during initial render or if nodes are moving),
          // calculate approximate positions from node coordinates
          let sourceX, sourceY, targetX, targetY;
          
          if (sourcePos && targetPos) {
            [sourceX, sourceY] = sourcePos;
            [targetX, targetY] = targetPos;
          } else {
            // Approximate port positions based on node coordinates
            // These are rough estimates and might need tweaking
            sourceX = sourceNode.x + (connection.sourcePort === 'top' ? 0 : 0); // Adjust for center
            sourceY = sourceNode.y + (connection.sourcePort === 'top' ? -7 : 47); // Adjust based on node height
            
            targetX = targetNode.x + (connection.targetPort === 'top' ? 0 : 0); // Adjust for center
            targetY = targetNode.y + (connection.targetPort === 'top' ? -7 : 47); // Adjust based on node height
          }
          
          // Calculate smooth path with curviness factor
          const pathData = calculateSmoothPath(
            sourceX, 
            sourceY, 
            targetX, 
            targetY,
            connection.sourcePort,
            connection.targetPort,
            pathCurviness // Use the curviness prop
          );
          
          return (
            <path
              key={connection.id}
              d={pathData}
              fill="none"
              stroke={COLORS.connectionLine}
              strokeWidth={1.5}
              strokeDasharray="4 3"
              markerEnd="url(#arrowhead)"
              className="diagram-connection-path" // Changed class name
            />
          );
        })}
        
        {/* Render the connection being created */}
        {connectingState && (
          <path
            key="connection-preview"
            d={calculateSmoothPath(
              connectingState.sourceX,
              connectingState.sourceY,
              connectingState.targetX,
              connectingState.targetY,
              connectingState.sourcePort,
              connectingState.sourcePort === 'top' ? 'bottom' : 'top',
              pathCurviness
            )}
            fill="none"
            stroke={COLORS.connectionDraft}
            strokeWidth={2.5}
            strokeDasharray="5 3"
            markerEnd="url(#arrowhead-draft)"
            className="diagram-connection-path" // Changed class name
          />
        )}
      </svg>
    );
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
        {/* Render the connections layer first (below nodes) */}
        {renderConnectionsLayer()}
        
        {/* Then render the nodes on top */}
        <Box ref={nodesRef}>
          {nodes.map((node) => (
          <NodeItem
            key={node.id}
              node={node}
              isSelected={selectedNodeId === node.id}
            onSelect={handleNodeSelect}
            onDragStart={() => setIsDragging(true)}
              onDragEnd={() => setIsDragging(false)}
              onPortMouseDown={handlePortMouseDown}
              onPortMouseUp={handlePortMouseUp}
              onNodeResize={handleNodeResize}
              onPositionChange={updateNodePosition}
              className='node-item'
          />
        ))}
        </Box>
        
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