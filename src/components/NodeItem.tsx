import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  IconButton, 
  TextField,
  Tab,
  Tabs,
  Dialog,
  DialogTitle,
  DialogContent,
  Stack
} from '@mui/material';
import { useTheme } from '../contexts/ThemeContext';
import { CausalNode, NODE_TYPES, NodeType } from '../models/types';
import NodeService from '../services/nodeService';
import EditIcon from '@mui/icons-material/Edit';
import DescriptionIcon from '@mui/icons-material/Description';
import ChatIcon from '@mui/icons-material/Chat';
import SearchIcon from '@mui/icons-material/Search';
import { getThemeColors } from '../constants/themeColors';

interface NodeItemProps {
  node: CausalNode;
  isSelected: boolean;
  onSelect: (nodeId: string) => void;
  onDragStart: () => void;
  onDragEnd: () => void;
  className?: string;
}

export function NodeItem({ node, isSelected, onSelect, onDragStart, onDragEnd, className }: NodeItemProps) {
  const { isDarkMode } = useTheme();
  const THEME_COLORS = getThemeColors(isDarkMode);
  const [position, setPosition] = useState({ x: node.x, y: node.y });
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  
  // Node history for undo
  const [nodeHistory, setNodeHistory] = useState<CausalNode[]>([]);
  const [currentNode, setCurrentNode] = useState<CausalNode>(node);
  
  // Use refs to track state without re-renders
  const nodeRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const dragStartPosRef = useRef({ x: 0, y: 0 });
  const initialNodePosRef = useRef({ x: 0, y: 0 });
  const hasMovedRef = useRef(false);
  const clickOutsideHandlerRef = useRef<(e: MouseEvent) => void | null>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  
  // Add new state for the node type modal
  const [nodeTypeModalOpen, setNodeTypeModalOpen] = useState(false);
  const [nodeTypeSearch, setNodeTypeSearch] = useState('');
  const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });
  
  // Add redo state and functionality
  const [redoHistory, setRedoHistory] = useState<CausalNode[]>([]);
  
  // Keep position in sync with props
  useEffect(() => {
    setPosition({ x: node.x, y: node.y });
    // Also update the style directly for smooth transitions
    if (nodeRef.current && !isDraggingRef.current) {
      nodeRef.current.style.transform = `translate3d(${node.x}px, ${node.y}px, 0)`;
    }
  }, [node.x, node.y]);
  
  // Update current node when node changes
  useEffect(() => {
    setCurrentNode(node);
  }, [node]);
  
  // Focus title input when editing starts
  useEffect(() => {
    if (isEditing && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [isEditing]);
  
  // Move handleClickOutside inside the useEffect to properly handle dependencies
  useEffect(() => {
    // Define handleClickOutside inside useEffect to properly capture dependencies
    const handleClickOutside = (e: MouseEvent) => {
      if (
        isExpanded && 
        nodeRef.current && 
        !nodeRef.current.contains(e.target as Node) &&
        !document.querySelector('.MuiDialog-root')?.contains(e.target as Node) // Don't collapse if clicking on dialog
      ) {
        setIsExpanded(false);
        setIsEditing(false);
      }
    };
    
    // Save the handler to the ref for cleanup
    clickOutsideHandlerRef.current = handleClickOutside;
    
    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    // Cleanup on unmount
    return () => {
      if (clickOutsideHandlerRef.current) {
        document.removeEventListener('mousedown', clickOutsideHandlerRef.current);
        clickOutsideHandlerRef.current = null;
      }
    };
  }, [isExpanded]); // Only re-run when expanded state changes
  
  // Improve the toggleExpanded function
  const toggleExpanded = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Toggle expanded state and edit mode
    const newExpandedState = !isExpanded;
    setIsExpanded(newExpandedState);
    setIsEditing(newExpandedState);
  };
  
  const nodeTypeInfo = NODE_TYPES[currentNode.type];
  
  // Colors based on theme - true darkness for dark mode
  const getColors = (isDark: boolean) => {
    return {
      // Card backgrounds - true dark in dark mode
      cardBg: isDark ? '#1a1a1a' : '#ffffff',
      expandedBg: isDark ? '#1a1a1a' : '#ffffff',
      
      // Text colors with strong contrast
      textPrimary: isDark ? '#ffffff' : '#272727',
      textSecondary: isDark ? '#cccccc' : '#666666',
      
      // Borders - thinner with better contrast
      border: nodeTypeInfo.color,
      borderOpacity: isSelected ? 0.9 : 0.5,
      borderWidth: isSelected ? 1.5 : 1,
      
      // Divider with 50% opacity
      divider: isDark 
        ? `rgba(255, 255, 255, 0.1)` 
        : `rgba(0, 0, 0, 0.1)`,
      
      // Ports
      portBg: isDark ? '#333333' : '#f8f8f8',
      
      // Effects
      shadowNormal: isDark 
        ? '0 2px 6px rgba(0, 0, 0, 0.4)' 
        : '0 2px 5px rgba(0, 0, 0, 0.08)',
      shadowSelected: isDark 
        ? `0 0 5px ${nodeTypeInfo.color}80, 0 2px 8px rgba(0, 0, 0, 0.6)` 
        : `0 0 5px ${nodeTypeInfo.color}50, 0 2px 10px rgba(0, 0, 0, 0.1)`,
      shadowExpanded: isDark 
        ? `0 0 10px ${nodeTypeInfo.color}40, 0 10px 25px rgba(0, 0, 0, 0.5)` 
        : `0 0 10px ${nodeTypeInfo.color}25, 0 10px 25px rgba(0, 0, 0, 0.15)`,
    };
  };
  
  const COLORS = getColors(isDarkMode);
  
  // Save changes to the node
  const saveChanges = async (updatedNode: Partial<CausalNode>) => {
    // Add current node to history before updating
    setNodeHistory(prev => [...prev, currentNode]);
    
    // Create the updated node
    const newNode = {
      ...currentNode,
      ...updatedNode
    };
    
    // Update local state immediately
    setCurrentNode(newNode);
    
    try {
      // Update in database
      await NodeService.updateNode(currentNode.id, updatedNode);
    } catch (error) {
      console.error('Error updating node:', error);
      // If there's an error, revert to previous state
      setCurrentNode(currentNode);
    }
  };
  
  // Add new functions for the node type modal
  const openNodeTypeModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Get the position of the node element
    if (nodeRef.current) {
      const nodeRect = nodeRef.current.getBoundingClientRect();
      setModalPosition({
        top: nodeRect.top - 50, // Position above the node
        left: nodeRect.left
      });
    }
    
    setNodeTypeModalOpen(true);
  }

  const closeNodeTypeModal = () => {
    setNodeTypeModalOpen(false);
    setNodeTypeSearch('');
  }

  const handleNodeTypeSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNodeTypeSearch(e.target.value.toLowerCase());
  }

  const handleNodeTypeSearchKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation();
  }

  const selectNodeType = (newType: NodeType) => {
    setRedoHistory([]);
    setCurrentNode(prev => ({
      ...prev,
      type: newType
    }));
    saveChanges({ type: newType });
    closeNodeTypeModal();
  }

  // Filter node types based on search
  const filteredNodeTypes = Object.values(NODE_TYPES).filter(nodeType => 
    nodeType.name.toLowerCase().includes(nodeTypeSearch.toLowerCase()) ||
    nodeType.type.toLowerCase().includes(nodeTypeSearch.toLowerCase())
  );
  
  // Update handleUndo to push to redoHistory
  const handleUndo = () => {
    if (nodeHistory.length > 0) {
      // Get the last node from history
      const previousNode = nodeHistory[nodeHistory.length - 1];
      
      // Add current node to redo history
      setRedoHistory(prev => [...prev, currentNode]);
      
      // Remove it from history
      setNodeHistory(prev => prev.slice(0, -1));
      
      // Update current node
      setCurrentNode(previousNode);
      
      // Update in database
      NodeService.updateNode(previousNode.id, {
        title: previousNode.title,
        description: previousNode.description,
        type: previousNode.type
      }).catch(error => {
        console.error('Error undoing node changes:', error);
      });
    }
  };
  
  // Add handleRedo function
  const handleRedo = () => {
    if (redoHistory.length > 0) {
      // Get the last node from redo history
      const nextNode = redoHistory[redoHistory.length - 1];
      
      // Add current node to history
      setNodeHistory(prev => [...prev, currentNode]);
      
      // Remove it from redo history
      setRedoHistory(prev => prev.slice(0, -1));
      
      // Update current node
      setCurrentNode(nextNode);
      
      // Update in database
      NodeService.updateNode(nextNode.id, {
        title: nextNode.title,
        description: nextNode.description,
        type: nextNode.type
      }).catch(error => {
        console.error('Error redoing node changes:', error);
      });
    }
  };
  
  // Clear redo history when making new changes
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRedoHistory([]);
    saveChanges({ title: e.target.value });
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setRedoHistory([]);
    saveChanges({ description: e.target.value });
  };
  
  // Handle tab changes
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };
  
  // Delete the node
  const handleDelete = async () => {
    try {
      await NodeService.deleteNode(currentNode.id);
    } catch (error) {
      console.error('Error deleting node:', error);
    }
  };
  
  // Handle clicks without dragging
  const handleClick = (e: React.MouseEvent) => {
    // If we've moved, don't trigger a click
    if (hasMovedRef.current) return;
    
    // Toggle selection on click
    onSelect(node.id);
    
    // Prevent event from bubbling up to diagram
    e.stopPropagation();
  };
  
  // Check if the app is in pan mode
  const isPanMode = () => {
    // Get the diagram element
    const diagramEl = document.getElementById('diagram-container');
    // Check if it has a 'data-pan-mode' attribute set to true
    return diagramEl?.getAttribute('data-pan-mode') === 'true';
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    // Don't allow node dragging when in pan mode
    if (isPanMode()) {
      e.stopPropagation(); // Allow event to propagate to the diagram for panning
      return;
    }
    
    if ((e.target as HTMLElement).tagName === 'INPUT' || 
        (e.target as HTMLElement).tagName === 'TEXTAREA' || 
        (e.target as HTMLElement).tagName === 'BUTTON' ||
        (e.target as HTMLElement).closest('.MuiFormControl-root') ||
        (e.target as HTMLElement).closest('.MuiTabs-root') ||
        (e.target as HTMLElement).closest('.MuiSelect-root') ||
        (e.target as HTMLElement).closest('.MuiMenuItem-root') ||
        (e.target as HTMLElement).closest('.MuiPopover-root')) {
      return;
    }

    e.preventDefault();

    const diagramEl = document.getElementById('diagram-container');
    if (!diagramEl || !nodeRef.current) return;

    hasMovedRef.current = false;

    dragStartPosRef.current = {
      x: e.clientX,
      y: e.clientY
    };

    initialNodePosRef.current = {
      x: position.x,
      y: position.y
    };

    isDraggingRef.current = true;

    onDragStart();

    if (nodeRef.current) {
      nodeRef.current.style.zIndex = '100';
      nodeRef.current.style.opacity = '0.95';
      nodeRef.current.style.cursor = 'grabbing';
    }

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };
  
  const handleMouseMove = (e: MouseEvent) => {
    // If not dragging, ignore
    if (!isDraggingRef.current || !nodeRef.current) return;
    
    // Calculate how far the mouse has moved since the drag started
    const dx = e.clientX - dragStartPosRef.current.x;
    const dy = e.clientY - dragStartPosRef.current.y;
    
    // Consider it a move if distance is over 3 pixels (avoids accidental small movements)
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      hasMovedRef.current = true;
    }
    
    // Calculate new position by adding the movement delta to the initial position
    const newX = initialNodePosRef.current.x + dx;
    const newY = initialNodePosRef.current.y + dy;
    
    // Update the DOM directly for smoother dragging (no React re-renders)
    nodeRef.current.style.transform = `translate3d(${newX}px, ${newY}px, 0)`;
  };
  
  const handleMouseUp = async (e?: MouseEvent) => {
    // If not dragging, ignore
    if (!isDraggingRef.current) return;
    
    // Remove event listeners
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    
    // Reset dragging state
    isDraggingRef.current = false;
    
    // Get current element position from its transform style
    const transformStyle = nodeRef.current?.style.transform || '';
    const translateMatch = transformStyle.match(/translate3d\((\d+)px, (\d+)px/i);
    
    // Calculate final position
    let finalX = position.x;
    let finalY = position.y;
    
    if (translateMatch && translateMatch.length >= 3) {
      finalX = parseInt(translateMatch[1], 10);
      finalY = parseInt(translateMatch[2], 10);
    } else if (e) {
      // Fallback to calculating position from mouse movement
      const dx = e.clientX - dragStartPosRef.current.x;
      const dy = e.clientY - dragStartPosRef.current.y;
      finalX = initialNodePosRef.current.x + dx;
      finalY = initialNodePosRef.current.y + dy;
    }
    
    // Reset node styling
    if (nodeRef.current) {
      nodeRef.current.style.zIndex = isSelected ? '10' : '1';
      nodeRef.current.style.opacity = '1';
      nodeRef.current.style.cursor = 'grab';
    }
    
    // Only update position in React state and database if we actually moved
    if (hasMovedRef.current) {
      // Update React state
      setPosition({ x: finalX, y: finalY });
      
      try {
        // Update in database
        await NodeService.updateNodePosition(node.id, finalX, finalY);
      } catch (error) {
        console.error('Error updating node position:', error);
        // Revert to original position on error
        setPosition({ x: node.x, y: node.y });
        if (nodeRef.current) {
          nodeRef.current.style.transform = `translate3d(${node.x}px, ${node.y}px, 0)`;
        }
      }
    }
    
    // Notify parent that dragging has ended
    onDragEnd();
  };
  
  // Clean up event listeners when component unmounts
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      if (clickOutsideHandlerRef.current) {
        document.removeEventListener('mousedown', clickOutsideHandlerRef.current);
      }
    };
  }, []);
  
  // Render ports with subtle cross/dot indicators for causality direction
  const renderTopPort = () => (
    <Box 
      sx={{
        position: 'absolute',
        top: -8,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 14,
        height: 14,
        borderRadius: '50%',
        backgroundColor: COLORS.portBg,
        border: `1.5px solid ${COLORS.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2,
        boxShadow: `0 0 3px ${COLORS.shadowNormal}`,
        '&::after': {
          content: '""',
          width: 5,
          height: 5,
          borderRadius: '50%',
          backgroundColor: COLORS.border,
          opacity: 0.8
        },
        transition: 'transform 0.15s ease',
        '&:hover': {
          transform: 'translateX(-50%) scale(1.2)',
        }
      }}
    />
  );
  
  const renderBottomPort = () => (
    <Box 
      sx={{
        position: 'absolute',
        bottom: -8,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 14,
        height: 14,
        borderRadius: '50%',
        backgroundColor: COLORS.portBg,
        border: `1.5px solid ${COLORS.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2,
        boxShadow: `0 0 3px ${COLORS.shadowNormal}`,
        '&::after': {
          content: '""',
          width: 7,
          height: 7,
          backgroundImage: `linear-gradient(to bottom right, transparent 45%, ${COLORS.border} 45%, ${COLORS.border} 55%, transparent 55%), 
                           linear-gradient(to bottom left, transparent 45%, ${COLORS.border} 45%, ${COLORS.border} 55%, transparent 55%)`,
          opacity: 0.8
        },
        transition: 'transform 0.15s ease',
        '&:hover': {
          transform: 'translateX(-50%) scale(1.2)',
        }
      }}
    />
  );
  
  // Render the evidence tab content
  const renderEvidenceContent = () => (
    <Box sx={{ p: 1.5, pt: 0.5, color: COLORS.textSecondary }}>
      Evidence panel will be implemented in a future update.
    </Box>
  );
  
  // Render the chat tab content
  const renderChatContent = () => (
    <Box sx={{ p: 1.5, pt: 0.5, color: COLORS.textSecondary }}>
      Chat panel will be implemented in a future update.
    </Box>
  );
  
  // Calculate dimensions based on expanded state - reduce expanded width and improve spacing
  const nodeWidth = isExpanded ? 280 : 180; // Reduced from 320 to 280 for expanded mode
  const titleContainerWidth = isExpanded ? 170 : 130; // Wider title container in expanded mode
  const buttonContainerWidth = 70; // Fixed width for button container
  
  const handleTextFieldKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Delete' || e.key === 'Backspace') {
      e.stopPropagation();
    }
  };
  
  return (
    <Paper
      ref={nodeRef}
      elevation={0}
      className={`${className || ''}`}
      sx={{
        position: 'absolute',
        left: 0, 
        top: 0,
        width: nodeWidth,
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
        backgroundColor: COLORS.cardBg,
        border: `${COLORS.borderWidth}px solid ${COLORS.border}`,
        borderRadius: 2,
        zIndex: isSelected || isExpanded ? 10 : 1,
        boxShadow: isExpanded 
          ? COLORS.shadowExpanded 
          : (isSelected ? COLORS.shadowSelected : COLORS.shadowNormal),
        transition: `
          width 0.3s cubic-bezier(0.4, 0, 0.2, 1), 
          box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1), 
          border 0.3s cubic-bezier(0.4, 0, 0.2, 1), 
          transform 0.05s ease,
          background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1)
        `,
        transformOrigin: 'center center',
        cursor: isDraggingRef.current ? 'grabbing' : 'grab',
        userSelect: 'none',
        overflow: 'visible',
        height: 'auto', // Allow height to adjust with content
        minHeight: isExpanded ? 'none' : 'auto', // Remove minimum height restriction in collapsed mode
      }}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onDoubleClick={toggleExpanded}
    >
      {/* Main container with relative positioning for absolute elements */}
      <Box sx={{ position: 'relative' }}>
        {/* Tabs - absolutely positioned above content */}
        <Box sx={{ 
          position: 'absolute',
          top: isExpanded ? '-36px' : 0,
          left: 0,
          right: 0,
          zIndex: 2,
          height: '36px', 
          opacity: isExpanded ? 1 : 0,
          pointerEvents: isExpanded ? 'auto' : 'none',
          visibility: isExpanded ? 'visible' : 'hidden',
          backgroundColor: `${NODE_TYPES[currentNode.type].color}${isDarkMode ? '20' : '10'}`,
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          borderLeft: 'none',
          borderRight: 'none',
          borderTop: 'none',
          transition: 'top 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1), visibility 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{
              minHeight: '36px',
              borderBottom: `1px solid ${COLORS.divider}`,
              '& .MuiTabs-indicator': {
                backgroundColor: COLORS.border
              }
            }}
          >
            <Tab 
              icon={<EditIcon sx={{ fontSize: '16px' }} />} 
              disableRipple
              sx={{ 
                minHeight: '36px',
                color: COLORS.textSecondary,
                '&.Mui-selected': {
                  color: COLORS.border
                }
              }}
            />
            <Tab 
              icon={<DescriptionIcon sx={{ fontSize: '16px' }} />} 
              disableRipple
              sx={{ 
                minHeight: '36px',
                color: COLORS.textSecondary,
                '&.Mui-selected': {
                  color: COLORS.border
                }
              }}
            />
            <Tab 
              icon={<ChatIcon sx={{ fontSize: '16px' }} />} 
              disableRipple
              sx={{ 
                minHeight: '36px',
                color: COLORS.textSecondary,
                '&.Mui-selected': {
                  color: COLORS.border
                }
              }}
            />
          </Tabs>
        </Box>
        
        {/* Content section - maintains same position regardless of tabs */}
        <Box sx={{ 
          marginTop: isExpanded ? '36px' : 0,
          transition: 'margin-top 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}>
          {/* Header with title */}
          <Box
            sx={{
              p: isExpanded ? 1.5 : 1.25,
              pl: isExpanded ? 1.5 : 1.1, // Slightly reduced left padding in collapsed mode
              pr: isExpanded ? 1.5 : 1.1, // Slightly reduced right padding in collapsed mode
              borderBottom: `1px solid ${COLORS.divider}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: `${NODE_TYPES[currentNode.type].color}${isDarkMode ? '20' : '10'}`,
              borderRadius: isExpanded ? 0 : '8px 8px 0 0',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            {/* Left side container with type icon and fixed width */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              width: nodeWidth - buttonContainerWidth - (isExpanded ? 32 : 32), // Consistent calculation with adjusted padding
              position: 'relative'
            }}>
              {/* Type/icon selector */}
              {isEditing ? (
                <Box 
                  onClick={openNodeTypeModal}
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    mr: 1,
                    minWidth: 22,
                    width: 22,
                    height: 22,
                    bgcolor: `${NODE_TYPES[currentNode.type].color}22`,
                    borderRadius: '4px',
                    '&:hover': {
                      bgcolor: `${NODE_TYPES[currentNode.type].color}33`,
                    }
                  }}
                >
                  <span 
                    className="material-icons" 
                    style={{ 
                      color: NODE_TYPES[currentNode.type].color,
                      fontSize: '14px' 
                    }}
                  >
                    {NODE_TYPES[currentNode.type].icon}
                  </span>
                </Box>
              ) : (
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: 1,
                  minWidth: 22,
                  width: 22,
                  height: 22
                }}>
                  <span 
                    className="material-icons" 
                    style={{ 
                      color: NODE_TYPES[currentNode.type].color, 
                      fontSize: '14px',
                      filter: isDarkMode ? 'brightness(1.2)' : 'none'
                    }}
                  >
                    {NODE_TYPES[currentNode.type].icon}
                  </span>
                </Box>
              )}

              {/* Title - with fixed width container */}
              <Box sx={{ 
                width: titleContainerWidth, 
                flexShrink: 0,
                overflow: 'hidden'
              }}> 
                {isEditing ? (
                  <TextField
                    inputRef={titleInputRef}
                    variant="standard"
                    placeholder="Title"
                    value={currentNode.title}
                    onChange={handleTitleChange}
                    onKeyDown={handleTextFieldKeyDown}
                    multiline
                    maxRows={10}
                    sx={{ 
                      '& .MuiInput-underline:before': { borderBottom: 'none' },
                      '& .MuiInput-underline:hover:not(.Mui-disabled):before': { borderBottom: 'none' },
                      '& .MuiInput-underline:after': { borderBottom: 'none' },
                      '& .MuiInputBase-input': {
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: COLORS.textPrimary,
                        padding: 0,
                        whiteSpace: 'pre-wrap',
                        textAlign: 'left',
                        overflowWrap: 'break-word',
                        lineHeight: 1.3
                      },
                      '& .MuiInputBase-root': {
                        display: 'block',
                        height: 'auto',
                        width: '100%'
                      }
                    }}
                  />
                ) : (
                  <Typography 
                    variant="subtitle2"
                    sx={{ 
                      color: COLORS.textPrimary,
                      fontWeight: 600,
                      fontSize: '0.75rem',
                      overflow: 'visible',
                      textAlign: 'left',
                      whiteSpace: 'normal',
                      wordBreak: 'break-word',
                      maxHeight: 'none',
                      lineHeight: 1.3,
                      width: '100%' // Ensure consistent width with edit mode
                    }}
                  >
                    {currentNode.title}
                  </Typography>
                )}
              </Box>
            </Box>

            {/* Right side container for action buttons - fixed width even when empty */}
            <Box sx={{ 
              width: buttonContainerWidth, 
              display: 'flex', 
              justifyContent: 'flex-end',
              visibility: isEditing ? 'visible' : 'hidden',
              opacity: isEditing ? 1 : 0,
              transition: 'opacity 0.2s ease'
            }}>
              {isEditing && (
                <>
                  <IconButton
                    size="small"
                    disabled={redoHistory.length === 0}
                    onClick={handleRedo}
                    sx={{ 
                      opacity: redoHistory.length === 0 ? 0.3 : 0.7, 
                      '&:hover': { opacity: redoHistory.length === 0 ? 0.3 : 1 },
                      color: COLORS.textPrimary,
                      p: 0,
                      ml: 0.4,
                      width: 22,
                      height: 22
                    }}
                  >
                    <span className="material-icons" style={{ fontSize: '12px' }}>redo</span>
                  </IconButton>
                  <IconButton
                    size="small"
                    disabled={nodeHistory.length === 0}
                    onClick={handleUndo}
                    sx={{ 
                      opacity: nodeHistory.length === 0 ? 0.3 : 0.7, 
                      '&:hover': { opacity: nodeHistory.length === 0 ? 0.3 : 1 },
                      color: COLORS.textPrimary,
                      p: 0,
                      ml: 0.4,
                      width: 22,
                      height: 22
                    }}
                  >
                    <span className="material-icons" style={{ fontSize: '12px' }}>undo</span>
                  </IconButton>
                  <IconButton 
                    size="small"
                    onClick={handleDelete}
                    sx={{ 
                      opacity: 0.7, 
                      '&:hover': { opacity: 1 },
                      color: isDarkMode ? '#ff6b6b' : '#d32f2f',
                      p: 0,
                      ml: 0.4,
                      width: 22,
                      height: 22
                    }}
                  >
                    <span className="material-icons" style={{ fontSize: '12px' }}>delete</span>
                  </IconButton>
                </>
              )}
            </Box>
          </Box>
          
          {/* Tab content and description */}
          <Box>
            {/* Edit tab / description view */}
            <Box
              sx={{ 
                display: (!isExpanded || activeTab === 0) ? 'block' : 'none',
                p: 1.25,
                backgroundColor: COLORS.cardBg,
                borderRadius: '0 0 8px 8px',
                height: 'auto',
                transition: 'height 0.3s cubic-bezier(0.4, 0, 0.2, 1), padding 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              {isEditing ? (
                <TextField
                  fullWidth
                  multiline
                  variant="standard"
                  placeholder="Description"
                  minRows={2}
                  maxRows={isExpanded ? 8 : 4}
                  value={currentNode.description}
                  onChange={handleDescriptionChange}
                  onKeyDown={handleTextFieldKeyDown}
                  sx={{ 
                    '& .MuiInput-underline:before': { 
                      borderBottom: 'none'
                    },
                    '& .MuiInput-underline:hover:not(.Mui-disabled):before': { 
                      borderBottom: 'none'
                    },
                    '& .MuiInput-underline:after': { 
                      borderBottom: 'none'
                    },
                    '& .MuiInputBase-root': {
                      fontSize: '0.75rem',
                      color: COLORS.textSecondary,
                      display: 'block',
                      height: 'auto',
                      width: '100%'
                    },
                    '& .MuiInputBase-input': {
                      whiteSpace: 'pre-wrap',
                      overflowWrap: 'break-word',
                      textAlign: 'left',
                      lineHeight: 1.3,
                      padding: 0
                    }
                  }}
                />
              ) : (
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: COLORS.textSecondary,
                    fontSize: '0.75rem',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    lineHeight: 1.3,
                    maxHeight: isExpanded ? 'none' : '3.9em',
                    overflow: isExpanded ? 'visible' : 'hidden',
                    textAlign: 'left'
                  }}
                >
                  {currentNode.description || 'No description'}
                </Typography>
              )}
            </Box>

            {/* Evidence tab content */}
            <Box sx={{ 
              display: isExpanded && activeTab === 1 ? 'block' : 'none',
              height: isExpanded && activeTab === 1 ? 'auto' : 0,
              transition: 'height 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              overflow: 'hidden'
            }}>
              {renderEvidenceContent()}
            </Box>
            
            {/* Chat tab content */}
            <Box sx={{ 
              display: isExpanded && activeTab === 2 ? 'block' : 'none',
              height: isExpanded && activeTab === 2 ? 'auto' : 0,
              transition: 'height 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              overflow: 'hidden'
            }}>
              {renderChatContent()}
            </Box>
          </Box>
        </Box>
      </Box>
      
      {/* Ports for connections - only show in collapsed mode */}
      {!isExpanded && (
        <>
          {renderTopPort()}
          {renderBottomPort()}
        </>
      )}

      {/* Node Type Selection Modal */}
      <Dialog 
        open={nodeTypeModalOpen} 
        onClose={closeNodeTypeModal}
        maxWidth="xs"
        fullWidth
        onClick={(e) => e.stopPropagation()}
        BackdropProps={{
          style: { backgroundColor: 'transparent' }
        }}
        sx={{ 
          '& .MuiDialog-paper': { 
            overflow: 'visible',
            backgroundColor: `${THEME_COLORS.dialogBg} !important`,
            color: THEME_COLORS.text,
            borderRadius: '12px',
            maxWidth: '280px', // A bit wider than before
            position: 'absolute',
            top: `${modalPosition.top}px`,
            left: `${modalPosition.left}px`,
            margin: 0,
          },
        }}
      >
        <DialogTitle 
          sx={{ 
            pb: 1,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            color: THEME_COLORS.text,
            backgroundColor: `${THEME_COLORS.dialogBg} !important`,
          }}
        >
          <Typography variant="h6" sx={{ fontSize: '1rem' }}>
            Select Node Type
          </Typography>
          {/* Close button removed */}
        </DialogTitle>
        <DialogContent 
          sx={{ 
            pt: 1,
            backgroundColor: `${THEME_COLORS.dialogBg} !important`,
            color: THEME_COLORS.text
          }}
        >
          <Box sx={{ position: 'relative', mb: 2 }}>
            <Box sx={{ 
              position: 'absolute',
              left: 8,
              top: '50%',
              transform: 'translateY(-50%)',
              display: 'flex',
              alignItems: 'center',
              pointerEvents: 'none'
            }}>
              <SearchIcon fontSize="small" sx={{ color: THEME_COLORS.iconColor }} />
            </Box>
            <TextField
              fullWidth
              placeholder="Search node types..."
              value={nodeTypeSearch}
              onChange={handleNodeTypeSearchChange}
              onKeyDown={handleNodeTypeSearchKeyDown}
              variant="outlined"
              size="small"
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  paddingLeft: '36px',
                  '& fieldset': {
                    borderColor: THEME_COLORS.border,
                  },
                  '&:hover fieldset': {
                    borderColor: THEME_COLORS.focusBorder,
                  },
                },
                '& .MuiInputBase-input': {
                  color: THEME_COLORS.text
                },
                '& .MuiInputBase-input::placeholder': {
                  color: THEME_COLORS.lightText,
                  opacity: 1
                }
              }}
            />
          </Box>
          <Stack spacing={0.5} sx={{ maxHeight: '300px', overflow: 'auto' }}>
            {filteredNodeTypes.map((nodeType) => (
              <Box
                key={nodeType.type}
                onClick={(e) => {
                  e.stopPropagation();
                  selectNodeType(nodeType.type);
                }}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  p: 1,
                  borderRadius: 1,
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  '&:hover': {
                    backgroundColor: THEME_COLORS.hoverBg
                  },
                  backgroundColor: currentNode.type === nodeType.type 
                    ? THEME_COLORS.listItemHover
                    : 'transparent'
                }}
              >
                <Box
                  sx={{
                    width: 32, 
                    height: 32, 
                    borderRadius: '50%', 
                    backgroundColor: `${nodeType.color}22`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 2
                  }}
                >
                  <span className="material-icons" style={{ color: nodeType.color }}>
                    {nodeType.icon}
                  </span>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: THEME_COLORS.text }}>
                    {nodeType.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: THEME_COLORS.lightText }}>
                    {nodeType.type === 'problem' || nodeType.type === 'incident' 
                      ? 'Mishap type' 
                      : nodeType.type === 'event' || nodeType.type === 'condition' 
                        ? 'Cause type' 
                        : 'Basic type'}
                  </Typography>
                </Box>
              </Box>
            ))}
            
            {filteredNodeTypes.length === 0 && (
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="body2" sx={{ color: THEME_COLORS.lightText }}>
                  No node types match your search
                </Typography>
              </Box>
            )}
          </Stack>
        </DialogContent>
      </Dialog>
    </Paper>
  );
} 