import { useCallback, useRef, useMemo, useState, useEffect } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  Panel,
  useReactFlow,
  ReactFlowInstance,
  Node,
  Edge,
  Viewport,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useTheme } from '../contexts/ThemeContext';
import { useGraph } from '../contexts/GraphContext';
import { useToolbar, EditorMode } from '../contexts/ToolbarContext';
import CausalNode from './CausalNode';
import CausalEdge from './CausalEdge';

// Get colors based on current theme
const getGraphColors = (isDarkMode: boolean) => {
  return {
    bg: isDarkMode ? '#121212' : '#f5f5f5',
    nodeBg: isDarkMode ? '#2a2a2a' : '#ffffff',
    text: isDarkMode ? '#e0e0e0' : '#444444',
    minimapMaskBg: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
    controlsBg: isDarkMode ? '#1e1e1e' : '#ffffff',
    controlsBorder: isDarkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
    controlsColor: isDarkMode ? '#e0e0e0' : '#555555',
  };
};

// Component for defining the defs for our graph elements
const Defs = () => {
  const { isDarkMode } = useTheme();
  const arrowColor = isDarkMode ? '#ffffff' : '#000000';
  
  return (
    <svg>
      <defs>
        <marker
          id="arrow"
          viewBox="0 0 10 10"
          refX="5"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto"
        >
          <path
            d="M 0 0 L 10 5 L 0 10 z"
            fill={arrowColor}
            strokeWidth="0"
          />
        </marker>
      </defs>
    </svg>
  );
};

// The CausalGraph component
function CausalGraphContent() {
  const { isDarkMode } = useTheme();
  const { editorMode, setEditorMode } = useToolbar();
  const { 
    nodes, 
    edges, 
    onNodesChange, 
    onEdgesChange, 
    onConnect,
    addNode,
    setSelectedElements,
    viewport,
    onViewportChange,
    setReactFlowInstance,
    isLoading
  } = useGraph();
  
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { project } = useReactFlow();
  
  // Initialize ReactFlow instance
  const handleInit = (instance: ReactFlowInstance) => {
    setReactFlowInstance(instance);
    
    // If we have a saved viewport, apply it
    if (viewport) {
      instance.setViewport(viewport);
    }
  };
  
  const COLORS = getGraphColors(isDarkMode);

  // Properly memoize nodeTypes and edgeTypes
  const nodeTypes = useMemo(() => ({
    causalNode: CausalNode
  }), []);

  const edgeTypes = useMemo(() => ({
    causalEdge: CausalEdge
  }), []);
  
  // Set the cursor based on the current editor mode
  const [cursor, setCursor] = useState<string>('default');
  
  useEffect(() => {
    switch (editorMode) {
      case EditorMode.ADD_NODE:
        setCursor('cell');
        break;
      case EditorMode.ADD_EDGE:
        setCursor('crosshair');
        break;
      case EditorMode.DELETE:
        setCursor('not-allowed');
        break;
      default:
        setCursor('default');
    }
  }, [editorMode]);

  // Handle selection changes
  const onSelectionChange = useCallback(({ nodes, edges }: { nodes: Node[], edges: Edge[] }) => {
    setSelectedElements({
      nodes: nodes.map((node) => node.id),
      edges: edges.map((edge) => edge.id)
    });
  }, [setSelectedElements]);
  
  // Handle adding a node on background click
  const onBackgroundClick = useCallback(
    (event: React.MouseEvent) => {
      if (editorMode === EditorMode.ADD_NODE) {
        if (reactFlowWrapper.current && project) {
          // Get the bounding rectangle of the flow container
          const boundingRect = reactFlowWrapper.current.getBoundingClientRect();
          
          // Calculate position in the flow coordinates
          const position = project({
            x: event.clientX - boundingRect.left,
            y: event.clientY - boundingRect.top,
          });
          
          addNode(position);
          
          // Reset editor mode to select after placing a node
          setEditorMode(EditorMode.SELECT);
        }
      }
    },
    [project, addNode, editorMode, setEditorMode]
  );

  // Handle viewport changes when move ends
  const handleMoveEnd = useCallback(
    (_: any, viewport: Viewport) => {
      onViewportChange(viewport);
    },
    [onViewportChange]
  );

  // CSS style for the react flow container
  const flowStyles = useMemo(() => ({
    background: COLORS.bg,
    cursor: cursor
  }), [COLORS.bg, cursor]);

  if (isLoading) {
    return (
      <div style={{ 
        width: '100%', 
        height: '100%', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        background: COLORS.bg
      }}>
        <div>Loading graph...</div>
      </div>
    );
  }

  return (
    <div ref={reactFlowWrapper} style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={handleInit}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onSelectionChange={onSelectionChange}
        onPaneClick={onBackgroundClick}
        onMoveEnd={handleMoveEnd}
        snapToGrid={true}
        defaultViewport={viewport}
        fitView={!viewport}
        style={flowStyles}
        attributionPosition="bottom-right"
        defaultEdgeOptions={{
          type: 'causalEdge',
          animated: true
        }}
        connectOnClick={editorMode === EditorMode.ADD_EDGE}
      >
        <Background color={isDarkMode ? '#555555' : '#aaaaaa'} gap={16} />
        <Controls
          style={{
            backgroundColor: COLORS.controlsBg,
            border: `1px solid ${COLORS.controlsBorder}`,
            borderRadius: '4px',
            color: COLORS.controlsColor
          }}
        />
        <MiniMap
          nodeColor={COLORS.nodeBg}
          maskColor={COLORS.minimapMaskBg}
          style={{
            backgroundColor: COLORS.controlsBg,
            border: `1px solid ${COLORS.controlsBorder}`,
            borderRadius: '4px'
          }}
        />
        <Panel position="top-left">
          <Defs />
        </Panel>
      </ReactFlow>
    </div>
  );
}

// Wrapped with the ReactFlowProvider
export default function CausalGraph() {
  return (
    <ReactFlowProvider>
      <CausalGraphContent />
    </ReactFlowProvider>
  );
} 