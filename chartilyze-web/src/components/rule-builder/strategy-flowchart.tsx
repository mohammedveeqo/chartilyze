'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { StrategyComponent } from '@/types/strategy'
import { 
  TrendingUp, 
  TrendingDown, 
  Shield, 
  Target, 
  AlertTriangle, 
  Settings,
  Edit,
  Plus
} from 'lucide-react'

interface FlowNode {
  id: string
  component: StrategyComponent
  position: { x: number; y: number }
  connections: string[]
}

interface StrategyFlowchartProps {
  strategyComponents: StrategyComponent[]
  onComponentEdit?: (component: StrategyComponent) => void
  onComponentAdd?: () => void
}

const getNodeColor = (type: string) => {
  switch (type.toLowerCase()) {
    case 'rule':
      return 'bg-blue-600 border-blue-500'
    case 'condition':
      return 'bg-green-600 border-green-500'
    case 'action':
      return 'bg-red-600 border-red-500'
    case 'indicator_check':
      return 'bg-purple-600 border-purple-500'
    case 'pattern_match':
      return 'bg-orange-600 border-orange-500'
    default:
      return 'bg-gray-600 border-gray-500'
  }
}

const getNodeIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'rule':
      return <Settings className="h-4 w-4" />
    case 'condition':
      return <Target className="h-4 w-4" />
    case 'action':
      return <TrendingUp className="h-4 w-4" />
    case 'indicator_check':
      return <AlertTriangle className="h-4 w-4" />
    case 'pattern_match':
      return <Shield className="h-4 w-4" />
    default:
      return <Settings className="h-4 w-4" />
  }
}

export function StrategyFlowchart({ 
  strategyComponents, 
  onComponentEdit,
  onComponentAdd 
}: StrategyFlowchartProps) {
  const [nodes, setNodes] = useState<FlowNode[]>([])
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const canvasRef = useRef<HTMLDivElement>(null)

  // Initialize nodes from strategy components
  useEffect(() => {
    const initialNodes: FlowNode[] = strategyComponents.map((component, index) => ({
      id: component.id,
      component,
      position: {
        x: 100 + (index % 3) * 250,
        y: 100 + Math.floor(index / 3) * 150
      },
      connections: []
    }))

    // Set up connections based on rule logic
    initialNodes.forEach(node => {
      const component = node.component
      
      // Connect rule components to their related conditions and actions
      if (component.type === 'rule') {
        const relatedNodes = initialNodes.filter(n => 
          (n.component.type === 'condition' || n.component.type === 'action') &&
          n.component.description?.includes(component.name)
        )
        node.connections = relatedNodes.map(n => n.id)
      }
      
      // Connect indicator_check components to condition nodes
      if (component.type === 'indicator_check') {
        const conditionNodes = initialNodes.filter(n => 
          n.component.type === 'condition' && 
          n.component.description?.toLowerCase().includes('indicator')
        )
        node.connections = conditionNodes.map(n => n.id)
      }
      
      // Connect condition nodes to action nodes
      if (component.type === 'condition') {
        const actionNodes = initialNodes.filter(n => n.component.type === 'action')
        node.connections = actionNodes.map(n => n.id)
      }
    })
    
    setNodes(initialNodes)
  }, [strategyComponents])

  const handleNodeDragStart = useCallback((e: React.MouseEvent, nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId)
    if (!node) return
    
    setIsDragging(true)
    setSelectedNode(nodeId)
    setDragOffset({
      x: e.clientX - node.position.x,
      y: e.clientY - node.position.y
    })
  }, [nodes])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !selectedNode) return
    
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    
    setNodes(prev => prev.map(node => 
      node.id === selectedNode
        ? {
            ...node,
            position: {
              x: e.clientX - rect.left - dragOffset.x,
              y: e.clientY - rect.top - dragOffset.y
            }
          }
        : node
    ))
  }, [isDragging, selectedNode, dragOffset])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    setSelectedNode(null)
  }, [])

  const renderConnection = (fromNode: FlowNode, toNodeId: string) => {
    const toNode = nodes.find(n => n.id === toNodeId)
    if (!toNode) return null
    
    const fromX = fromNode.position.x + 100 // Node width / 2
    const fromY = fromNode.position.y + 30  // Node height / 2
    const toX = toNode.position.x + 100
    const toY = toNode.position.y + 30
    
    return (
      <line
        key={`${fromNode.id}-${toNodeId}`}
        x1={fromX}
        y1={fromY}
        x2={toX}
        y2={toY}
        stroke="#6B7280"
        strokeWidth="2"
        markerEnd="url(#arrowhead)"
      />
    )
  }

  return (
    <div className="h-full bg-gray-900 relative overflow-hidden">
      {/* Canvas */}
      <div
        ref={canvasRef}
        className="w-full h-full relative"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* SVG for connections */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon
                points="0 0, 10 3.5, 0 7"
                fill="#6B7280"
              />
            </marker>
          </defs>
          {nodes.map(node => 
            node.connections.map(connectionId => 
              renderConnection(node, connectionId)
            )
          )}
        </svg>
        
        {/* Nodes */}
        {nodes.map(node => (
          <div
            key={node.id}
            className={`absolute w-48 bg-gray-800 border-2 rounded-lg p-3 cursor-move transition-all hover:shadow-lg ${
              getNodeColor(node.component.type)
            } ${
              selectedNode === node.id ? 'ring-2 ring-blue-400' : ''
            }`}
            style={{
              left: node.position.x,
              top: node.position.y,
              zIndex: selectedNode === node.id ? 10 : 1
            }}
            onMouseDown={(e) => handleNodeDragStart(e, node.id)}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="text-white">
                  {getNodeIcon(node.component.type)}
                </div>
                <span className="text-white font-medium text-sm truncate">
                  {node.component.name}
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onComponentEdit?.(node.component)
                }}
                className="p-1 text-gray-300 hover:text-white transition-colors"
              >
                <Edit className="h-3 w-3" />
              </button>
            </div>
            
            // Replace the indicators section with rule logic display
            // Fix the node rendering (around line 240-270)
            <div className="text-xs text-gray-300 space-y-1">
              <div className="truncate">{node.component.description}</div>
              
              {/* Show rule type and priority */}
              <div className="flex items-center gap-2">
                <span className="px-1 py-0.5 bg-blue-600/20 text-blue-300 rounded text-xs">
                  {node.component.type.replace('_', ' ')}
                </span>
                <span className="px-1 py-0.5 bg-gray-600/20 text-gray-300 rounded text-xs">
                  {node.component.priority}
                </span>
              </div>
              
              {node.component.confidence && (
                <div className="flex items-center justify-between">
                  <span>Confidence:</span>
                  <span className={`font-medium ${
                    node.component.confidence > 0.7 ? 'text-green-400' :
                    node.component.confidence > 0.4 ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {(node.component.confidence * 100).toFixed(0)}%
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {/* Add Component Button */}
        <button
          onClick={onComponentAdd}
          className="absolute bottom-6 right-6 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-500 transition-colors shadow-lg"
        >
          <Plus className="h-6 w-6" />
        </button>
      </div>
      
      {/* Legend */}
      <div className="absolute top-4 left-4 bg-gray-800 border border-gray-700 rounded-lg p-3">
        <h3 className="text-white font-medium mb-2 text-sm">Component Types</h3>
        <div className="space-y-1 text-xs">
          {[
            { type: 'rule', label: 'Trading Rules' },
            { type: 'condition', label: 'Conditions' },
            { type: 'action', label: 'Actions' },
            { type: 'indicator_check', label: 'Indicator Checks' },
            { type: 'pattern_match', label: 'Pattern Matching' }
          ].map(({ type, label }) => (
            <div key={type} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded border ${getNodeColor(type)}`} />
              <span className="text-gray-300">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}