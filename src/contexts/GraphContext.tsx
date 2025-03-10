import { createContext, useState, useContext, useCallback, ReactNode, useEffect } from 'react';
import { 
  Edge, 
  Node, 
  OnConnect, 
  OnNodesChange, 
  OnEdgesChange,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  Connection,
  Viewport,
  ReactFlowInstance
} from 'reactflow';
import { v4 as uuidv4 } from 'uuid';
import { useProject } from './ProjectContext';
import { db } from '../db/LocalDB';
import { GraphData } from '../models/types';

// Define interface for the graph context
interface GraphContextType {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  addNode: (position: { x: number, y: number }, label?: string) => void;
  updateNodeLabel: (nodeId: string, label: string) => void;
  deleteNode: (nodeId: string) => void;
  deleteEdge: (edgeId: string) => void;
  selectedElements: {
    nodes: string[];
    edges: string[];
  };
  setSelectedElements: (elements: { nodes: string[], edges: string[] }) => void;
  viewport: Viewport | undefined;
  onViewportChange: (viewport: Viewport) => void;
  reactFlowInstance: ReactFlowInstance | null;
  setReactFlowInstance: (instance: ReactFlowInstance | null) => void;
  isLoading: boolean;
}

// Create context with default values
const GraphContext = createContext<GraphContextType | undefined>(undefined);

// Default viewport
const defaultViewport: Viewport = { x: 0, y: 0, zoom: 1 };

// Save throttle delay in ms
const SAVE_THROTTLE_DELAY = 1000;

// Provider component
export function GraphProvider({ children }: { children: ReactNode }) {
  // Project context
  const { currentProject } = useProject();

  // Flag to prevent saving during initial load
  const [isLoading, setIsLoading] = useState(true);
  
  // State for nodes and edges
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedElements, setSelectedElements] = useState<{ nodes: string[], edges: string[] }>({
    nodes: [],
    edges: []
  });
  
  // Viewport state
  const [viewport, setViewport] = useState<Viewport | undefined>(defaultViewport);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  
  // Throttle state
  const [pendingSave, setPendingSave] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState(0);

  // Load graph data when project changes
  useEffect(() => {
    const loadGraphData = async () => {
      if (!currentProject) {
        setNodes([]);
        setEdges([]);
        setViewport(defaultViewport);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const project = await db.projects.get(currentProject.id);
        
        if (project?.graphData) {
          setNodes(project.graphData.nodes);
          setEdges(project.graphData.edges);
          setViewport(project.graphData.viewport);
        } else {
          // No graph data yet, set to defaults
          setNodes([]);
          setEdges([]);
          setViewport(defaultViewport);
        }
      } catch (error) {
        console.error('Error loading graph data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadGraphData();
  }, [currentProject]);

  // Save graph data function
  const saveGraphData = useCallback(async () => {
    if (!currentProject || isLoading) return;

    const now = Date.now();
    // Check if we should throttle the save
    if (now - lastSaveTime < SAVE_THROTTLE_DELAY) {
      if (!pendingSave) {
        setPendingSave(true);
        setTimeout(() => {
          setPendingSave(false);
          setLastSaveTime(Date.now());
          saveGraphData();
        }, SAVE_THROTTLE_DELAY);
      }
      return;
    }

    setLastSaveTime(now);
    setPendingSave(false);

    const graphData: GraphData = {
      nodes,
      edges,
      viewport: viewport || defaultViewport
    };

    try {
      await db.updateProjectGraph(currentProject.id, graphData);
    } catch (error) {
      console.error('Error saving graph data:', error);
    }
  }, [currentProject, nodes, edges, viewport, isLoading, lastSaveTime, pendingSave]);

  // Save graph data when nodes, edges, or viewport changes
  useEffect(() => {
    if (!isLoading) {
      saveGraphData();
    }
  }, [nodes, edges, viewport, saveGraphData, isLoading]);

  // Handle node changes (position, selection)
  const onNodesChange: OnNodesChange = useCallback(
    (changes) => {
      setNodes((nds) => applyNodeChanges(changes, nds));
    },
    []
  );

  // Handle edge changes (selection)
  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => {
      setEdges((eds) => applyEdgeChanges(changes, eds));
    },
    []
  );

  // Handle new connections
  const onConnect: OnConnect = useCallback(
    (connection: Connection) => {
      // Prevent cycles by checking if this would create a cycle
      // (A simple check for direct back-connections for now)
      if (connection.source === connection.target) return;

      // Check if the edge already exists
      const edgeExists = edges.some(
        edge => edge.source === connection.source && edge.target === connection.target
      );

      if (edgeExists) return;

      // Make sure source and target are strings (not null)
      if (connection.source && connection.target) {
        const newEdge: Edge = {
          ...connection,
          id: `e-${uuidv4()}`,
          type: 'causalEdge',
          animated: true,
          source: connection.source,
          target: connection.target
        };
        
        setEdges((eds) => addEdge(newEdge, eds));
      }
    },
    [edges]
  );

  // Handle viewport changes
  const onViewportChange = useCallback((newViewport: Viewport) => {
    setViewport(newViewport);
  }, []);

  // Add a new node
  const addNode = useCallback((position: { x: number, y: number }, label = 'New Cause') => {
    const newNode: Node = {
      id: `node-${uuidv4()}`,
      position,
      data: { label },
      type: 'causalNode',
    };
    setNodes((nds) => [...nds, newNode]);
  }, []);

  // Update a node's label
  const updateNodeLabel = useCallback((nodeId: string, label: string) => {
    setNodes((nds) => 
      nds.map((node) => 
        node.id === nodeId ? { ...node, data: { ...node.data, label } } : node
      )
    );
  }, []);

  // Delete a node and its connected edges
  const deleteNode = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => 
      eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId)
    );
  }, []);

  // Delete an edge
  const deleteEdge = useCallback((edgeId: string) => {
    setEdges((eds) => eds.filter((edge) => edge.id !== edgeId));
  }, []);

  // Context value
  const contextValue: GraphContextType = {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    updateNodeLabel,
    deleteNode,
    deleteEdge,
    selectedElements,
    setSelectedElements,
    viewport,
    onViewportChange,
    reactFlowInstance,
    setReactFlowInstance,
    isLoading
  };

  return (
    <GraphContext.Provider value={contextValue}>
      {children}
    </GraphContext.Provider>
  );
}

// Custom hook for using the graph context
export function useGraph() {
  const context = useContext(GraphContext);
  if (context === undefined) {
    throw new Error('useGraph must be used within a GraphProvider');
  }
  return context;
} 