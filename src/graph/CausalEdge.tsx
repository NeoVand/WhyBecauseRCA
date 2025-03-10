import { FC } from 'react';
import { EdgeProps, getBezierPath } from 'reactflow';
import { useTheme } from '../contexts/ThemeContext';

// Get colors based on current theme
const getEdgeColors = (isDarkMode: boolean) => {
  return {
    stroke: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
    selectedStroke: isDarkMode ? '#90caf9' : '#1976d2',
  };
};

const CausalEdge: FC<EdgeProps> = ({
  id,
  // source and target are unused
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  selected,
}) => {
  const { isDarkMode } = useTheme();
  const COLORS = getEdgeColors(isDarkMode);

  // Path for the edge
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <path
      id={id}
      className="react-flow__edge-path"
      d={edgePath}
      markerEnd="url(#arrow)"
      style={{
        stroke: selected ? COLORS.selectedStroke : COLORS.stroke,
        strokeWidth: selected ? 2 : 1.5,
        strokeDasharray: '5,5',
        animation: 'dashdraw 0.5s linear infinite',
      }}
    />
  );
};

export default CausalEdge; 