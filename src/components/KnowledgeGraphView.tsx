import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { 
  Network, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Play, 
  Pause, 
  Search, 
  SlidersHorizontal,
  ExternalLink, 
  Sparkles, 
  Quote, 
  Sigma, 
  ArrowRight,
  Info,
  Maximize2,
  CheckCircle2,
  BookOpen
} from 'lucide-react';
import { PaperData, GraphNode, GraphLink } from '../types';
import { buildPaperKnowledgeGraph } from '../utils/graphBuilder';

interface KnowledgeGraphViewProps {
  paper: PaperData;
  onNavigateToTab?: (tab: string, itemId?: string) => void;
  isFocusMode?: boolean;
}

const GROUP_COLORS: Record<string, { fill: string; stroke: string; text: string; bg: string }> = {
  core: { fill: '#6259E8', stroke: '#493DCE', text: '#FFFFFF', bg: '#F0EEFF' },
  concept: { fill: '#5247D7', stroke: '#3929BF', text: '#FFFFFF', bg: '#F0EEFF' },
  formula: { fill: '#3929BF', stroke: '#110068', text: '#FFFFFF', bg: '#E0DEEF' },
  methodology: { fill: '#5D5D6B', stroke: '#454653', text: '#FFFFFF', bg: '#E2E1F1' },
  finding: { fill: '#198754', stroke: '#00522F', text: '#FFFFFF', bg: '#E8F5E9' },
  challenge: { fill: '#BA1A1A', stroke: '#93000A', text: '#FFFFFF', bg: '#FFDAD6' },
};

const GROUP_LABELS: Record<string, string> = {
  core: 'Core Innovation',
  concept: 'Concept Node',
  formula: 'Mathematical Formula',
  methodology: 'Methodology Phase',
  finding: 'Empirical Benchmark',
  challenge: 'Problem / Bottleneck',
};

export const KnowledgeGraphView: React.FC<KnowledgeGraphViewProps> = ({
  paper,
  onNavigateToTab,
  isFocusMode,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterGroup, setFilterGroup] = useState<string>('all');
  const [isPhysicsRunning, setIsPhysicsRunning] = useState<boolean>(true);

  // Build the graph data for current paper
  const graphData = useMemo(() => {
    return buildPaperKnowledgeGraph(paper);
  }, [paper]);

  const simulationRef = useRef<d3.Simulation<GraphNode, GraphLink> | null>(null);
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  // Connected nodes map for highlighting
  const connectedNodeIds = useMemo(() => {
    const target = selectedNode || hoveredNode;
    if (!target) return null;
    const set = new Set<string>();
    set.add(target.id);
    graphData.links.forEach((link: any) => {
      const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
      const targetId = typeof link.target === 'object' ? link.target.id : link.target;
      if (sourceId === target.id) set.add(targetId);
      if (targetId === target.id) set.add(sourceId);
    });
    return set;
  }, [selectedNode, hoveredNode, graphData]);

  // Connected links map
  const connectedLinks = useMemo(() => {
    if (!selectedNode) return [];
    return graphData.links.filter((link: any) => {
      const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
      const targetId = typeof link.target === 'object' ? link.target.id : link.target;
      return sourceId === selectedNode.id || targetId === selectedNode.id;
    });
  }, [selectedNode, graphData]);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth || 800;
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
    const isTablet = typeof window !== 'undefined' && window.innerWidth < 1024;
    const height = isMobile ? 380 : isTablet ? 480 : 580;

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height]);

    svg.selectAll('*').remove();

    // Defs for arrow markers & drop-shadow filters
    const defs = svg.append('defs');

    // Arrow markers
    defs.append('marker')
      .attr('id', 'arrow-default')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 28)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#D6DAE1');

    defs.append('marker')
      .attr('id', 'arrow-active')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 30)
      .attr('refY', 0)
      .attr('markerWidth', 7)
      .attr('markerHeight', 7)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#6259E8');

    // Node drop shadow
    const filter = defs.append('filter')
      .attr('id', 'node-shadow')
      .attr('x', '-20%')
      .attr('y', '-20%')
      .attr('width', '140%')
      .attr('height', '140%');
    filter.append('feDropShadow')
      .attr('dx', '0')
      .attr('dy', '2')
      .attr('stdDeviation', '3')
      .attr('flood-color', '#172033')
      .attr('flood-opacity', '0.12');

    const g = svg.append('g').attr('class', 'main-graph-group');

    // Zoom setup
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);
    zoomBehaviorRef.current = zoom;

    // Deep clones to preserve original data
    const nodes: GraphNode[] = graphData.nodes.map(d => ({ ...d }));
    const links: GraphLink[] = graphData.links.map(d => ({ ...d }));

    // Force simulation
    const simulation = d3.forceSimulation<GraphNode>(nodes)
      .force('link', d3.forceLink<GraphNode, any>(links).id(d => d.id).distance(120).strength(0.6))
      .force('charge', d3.forceManyBody().strength(-380))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collide', d3.forceCollide<GraphNode>().radius(d => (d.importance * 6 + 18)).iterations(2));

    simulationRef.current = simulation;

    // Draw Links
    const linkGroup = g.append('g').attr('class', 'links');
    const linkLines = linkGroup.selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('stroke', '#E7EAF0')
      .attr('stroke-width', 1.5)
      .attr('marker-end', 'url(#arrow-default)');

    // Link Relationship Text Labels
    const linkLabels = linkGroup.selectAll('text')
      .data(links)
      .enter()
      .append('text')
      .attr('font-size', '9px')
      .attr('font-family', 'var(--font-geist)')
      .attr('fill', '#9AA2B1')
      .attr('text-anchor', 'middle')
      .attr('dy', -4)
      .text((d: any) => d.relationship || '');

    // Draw Nodes
    const nodeGroup = g.append('g').attr('class', 'nodes');
    const nodeElements = nodeGroup.selectAll('g.node')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('cursor', 'pointer')
      .call(
        d3.drag<any, GraphNode>()
          .on('start', (event, d) => {
            if (!event.active && isPhysicsRunning) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on('drag', (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on('end', (event, d) => {
            if (!event.active && isPhysicsRunning) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          })
      );

    // Pulse outer ring for core node
    nodeElements.filter(d => d.group === 'core')
      .append('circle')
      .attr('r', 32)
      .attr('fill', 'none')
      .attr('stroke', '#6259E8')
      .attr('stroke-opacity', 0.25)
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '3 3');

    // Outer circle
    nodeElements.append('circle')
      .attr('r', d => d.importance * 4.5 + 10)
      .attr('fill', d => GROUP_COLORS[d.group]?.fill || '#6259E8')
      .attr('stroke', '#FFFFFF')
      .attr('stroke-width', 2.5)
      .attr('filter', 'url(#node-shadow)')
      .attr('class', 'node-circle')
      .transition()
      .duration(300);

    // Icon or Inner Glyphs
    nodeElements.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('fill', '#FFFFFF')
      .attr('font-size', d => d.importance >= 4 ? '11px' : '9px')
      .attr('font-weight', '700')
      .attr('pointer-events', 'none')
      .text(d => {
        if (d.group === 'core') return '★';
        if (d.group === 'formula') return '∑';
        if (d.group === 'finding') return '✓';
        if (d.group === 'challenge') return '!';
        return d.label.charAt(0);
      });

    // Label under node
    nodeElements.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', d => d.importance * 4.5 + 24)
      .attr('font-size', '11px')
      .attr('font-weight', '600')
      .attr('font-family', 'var(--font-geist)')
      .attr('fill', '#172033')
      .attr('class', 'node-label')
      .text(d => d.label.length > 20 ? d.label.slice(0, 18) + '...' : d.label);

    // Click handler to select node and highlight related content
    nodeElements.on('click', (event, d) => {
      event.stopPropagation();
      setSelectedNode(d);
    });

    nodeElements.on('mouseenter', (event, d) => {
      setHoveredNode(d);
    });

    nodeElements.on('mouseleave', () => {
      setHoveredNode(null);
    });

    // Background click resets selection
    svg.on('click', () => {
      setSelectedNode(null);
    });

    // Simulation tick loop
    simulation.on('tick', () => {
      linkLines
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      linkLabels
        .attr('x', (d: any) => (d.source.x + d.target.x) / 2)
        .attr('y', (d: any) => (d.source.y + d.target.y) / 2);

      nodeElements.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });

    // Automatically select the Core node initially
    const coreNode = nodes.find(n => n.group === 'core');
    if (coreNode) setSelectedNode(coreNode);

    return () => {
      simulation.stop();
    };
  }, [graphData]);

  // Dynamic visual updates on highlight/selection/filtering
  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);

    const activeTarget = selectedNode || hoveredNode;

    // Filter matching IDs
    const matchedIds = new Set<string>();
    graphData.nodes.forEach(n => {
      const matchSearch = !searchQuery || n.label.toLowerCase().includes(searchQuery.toLowerCase()) || n.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchGroup = filterGroup === 'all' || n.group === filterGroup;
      if (matchSearch && matchGroup) matchedIds.add(n.id);
    });

    // Update Nodes styling
    svg.selectAll('g.node').each(function(d: any) {
      const el = d3.select(this);
      const isSelected = selectedNode?.id === d.id;
      const isConnected = connectedNodeIds ? connectedNodeIds.has(d.id) : true;
      const isFilteredIn = matchedIds.has(d.id);

      const circle = el.select('.node-circle');

      if (!isFilteredIn) {
        el.attr('opacity', 0.15);
      } else if (activeTarget) {
        if (isSelected) {
          el.attr('opacity', 1);
          circle.attr('stroke', '#172033').attr('stroke-width', 3.5);
        } else if (isConnected) {
          el.attr('opacity', 0.95);
          circle.attr('stroke', '#6259E8').attr('stroke-width', 2);
        } else {
          el.attr('opacity', 0.22);
          circle.attr('stroke', '#FFFFFF').attr('stroke-width', 2);
        }
      } else {
        el.attr('opacity', 1);
        circle.attr('stroke', '#FFFFFF').attr('stroke-width', 2.5);
      }
    });

    // Update Links styling
    svg.selectAll('.links line').each(function(d: any) {
      const line = d3.select(this);
      const sourceId = typeof d.source === 'object' ? d.source.id : d.source;
      const targetId = typeof d.target === 'object' ? d.target.id : d.target;

      const isConnectedToActive = activeTarget && (sourceId === activeTarget.id || targetId === activeTarget.id);

      if (activeTarget) {
        if (isConnectedToActive) {
          line.attr('stroke', '#6259E8')
            .attr('stroke-width', 2.5)
            .attr('stroke-opacity', 1)
            .attr('marker-end', 'url(#arrow-active)');
        } else {
          line.attr('stroke', '#E7EAF0')
            .attr('stroke-width', 1)
            .attr('stroke-opacity', 0.15)
            .attr('marker-end', 'url(#arrow-default)');
        }
      } else {
        line.attr('stroke', '#E7EAF0')
          .attr('stroke-width', 1.5)
          .attr('stroke-opacity', 0.8)
          .attr('marker-end', 'url(#arrow-default)');
      }
    });

    // Update Link text labels
    svg.selectAll('.links text').each(function(d: any) {
      const text = d3.select(this);
      const sourceId = typeof d.source === 'object' ? d.source.id : d.source;
      const targetId = typeof d.target === 'object' ? d.target.id : d.target;
      const isConnectedToActive = activeTarget && (sourceId === activeTarget.id || targetId === activeTarget.id);

      if (activeTarget && isConnectedToActive) {
        text.attr('fill', '#6259E8')
          .attr('font-weight', '600')
          .attr('opacity', 1);
      } else {
        text.attr('fill', '#9AA2B1')
          .attr('font-weight', '400')
          .attr('opacity', activeTarget ? 0 : 0.8);
      }
    });

  }, [selectedNode, hoveredNode, connectedNodeIds, searchQuery, filterGroup, graphData]);

  // Zoom controls
  const handleZoomIn = () => {
    if (svgRef.current && zoomBehaviorRef.current) {
      d3.select(svgRef.current).transition().duration(250).call(zoomBehaviorRef.current.scaleBy, 1.3);
    }
  };

  const handleZoomOut = () => {
    if (svgRef.current && zoomBehaviorRef.current) {
      d3.select(svgRef.current).transition().duration(250).call(zoomBehaviorRef.current.scaleBy, 0.77);
    }
  };

  const handleResetZoom = () => {
    if (svgRef.current && zoomBehaviorRef.current) {
      d3.select(svgRef.current).transition().duration(350).call(zoomBehaviorRef.current.transform, d3.zoomIdentity);
    }
  };

  const togglePhysics = () => {
    if (!simulationRef.current) return;
    if (isPhysicsRunning) {
      simulationRef.current.stop();
      setIsPhysicsRunning(false);
    } else {
      simulationRef.current.restart();
      setIsPhysicsRunning(true);
    }
  };

  return (
    <div className={`space-y-4 ${isFocusMode ? 'max-w-[68ch] mx-auto' : 'max-w-6xl'}`}>
      
      {/* Top Controls & Filter Bar */}
      <div className="bg-white rounded-xl border border-[#E7EAF0] p-3 sm:p-3.5 shadow-xs flex flex-wrap items-center justify-between gap-2.5 sm:gap-3 max-w-full overflow-hidden">
        
        {/* Search within graph */}
        <div className="relative w-full sm:w-auto min-w-0 sm:min-w-[200px] flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#687386]" />
          <input
            type="text"
            placeholder="Search nodes in knowledge graph..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-[36px] pl-9 pr-3 text-[13px] bg-[#F8F9FC] border border-[#E7EAF0] rounded-md focus:outline-none focus:border-[#6259E8] text-[#172033]"
          />
        </div>

        {/* Group Filter pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar max-w-full text-[11px] font-semibold py-0.5">
          <button
            onClick={() => setFilterGroup('all')}
            className={`px-2.5 py-1 rounded-full uppercase tracking-wider whitespace-nowrap transition-all shrink-0 ${
              filterGroup === 'all'
                ? 'bg-[#6259E8] text-white shadow-xs'
                : 'bg-[#F8F9FC] text-[#687386] hover:text-[#172033] border border-[#E7EAF0]'
            }`}
          >
            All ({graphData.nodes.length})
          </button>
          {['core', 'concept', 'formula', 'methodology', 'finding', 'challenge'].map(grp => (
            <button
              key={grp}
              onClick={() => setFilterGroup(grp)}
              className={`px-2.5 py-1 rounded-full uppercase tracking-wider whitespace-nowrap transition-all shrink-0 ${
                filterGroup === grp
                  ? 'bg-[#6259E8] text-white shadow-xs'
                  : 'bg-[#F8F9FC] text-[#687386] hover:text-[#172033] border border-[#E7EAF0]'
              }`}
            >
              {grp}
            </button>
          ))}
        </div>

        {/* Canvas Toolbar Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={togglePhysics}
            title={isPhysicsRunning ? "Pause graph layout physics" : "Resume physics simulation"}
            className="p-1.5 rounded-md border border-[#E7EAF0] text-[#687386] hover:text-[#172033] hover:bg-[#F8F9FC] transition-colors"
          >
            {isPhysicsRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={handleZoomIn}
            title="Zoom In"
            className="p-1.5 rounded-md border border-[#E7EAF0] text-[#687386] hover:text-[#172033] hover:bg-[#F8F9FC] transition-colors"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleZoomOut}
            title="Zoom Out"
            className="p-1.5 rounded-md border border-[#E7EAF0] text-[#687386] hover:text-[#172033] hover:bg-[#F8F9FC] transition-colors"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleResetZoom}
            title="Reset View"
            className="p-1.5 rounded-md border border-[#E7EAF0] text-[#687386] hover:text-[#172033] hover:bg-[#F8F9FC] transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* Main Workspace Area: SVG Graph on left, Node Inspector panel on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start max-w-full">
        
        {/* D3 Graph Visualization Canvas */}
        <div 
          ref={containerRef}
          className="lg:col-span-8 bg-white rounded-xl border border-[#E7EAF0] shadow-xs relative overflow-hidden min-h-[380px] sm:min-h-[480px] lg:min-h-[580px] max-w-full"
        >
          {/* Subtle Canvas Watermark & Helper */}
          <div className="absolute top-3 left-3 sm:left-4 pointer-events-none flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-[12px] text-[#687386] bg-white/80 backdrop-blur-xs px-2 py-0.5 rounded-md border border-[#E7EAF0]/60 max-w-[calc(100%-24px)] truncate">
            <Network className="w-3.5 h-3.5 text-[#6259E8] shrink-0" />
            <span className="font-semibold text-[#172033] shrink-0">Topology</span>
            <span className="truncate hidden xs:inline">· Drag to pan, scroll to zoom, click node</span>
          </div>

          <svg 
            ref={svgRef} 
            className="w-full h-[380px] sm:h-[480px] lg:h-[580px] select-none"
          />

          {/* Legend strip at bottom of canvas */}
          <div className="absolute bottom-2 left-2 right-2 sm:bottom-3 sm:left-3 sm:right-3 bg-white/95 backdrop-blur-md py-1 px-2 sm:py-1.5 sm:px-3 rounded-lg border border-[#E7EAF0] flex items-center justify-between gap-2 text-[10px] sm:text-[11px] text-[#687386] overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#6259E8]" />
                <span>Hub</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#5247D7]" />
                <span>Concept</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#3929BF]" />
                <span>Formula</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#198754]" />
                <span>Metric</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#BA1A1A]" />
                <span>Bottleneck</span>
              </span>
            </div>
            <span className="shrink-0">{graphData.nodes.length} nodes · {graphData.links.length} links</span>
          </div>
        </div>

        {/* Node Knowledge Inspector (Side Drawer) */}
        <div className="lg:col-span-4 space-y-4">
          {selectedNode ? (
            <div className="bg-white rounded-xl border border-[#E7EAF0] p-5 shadow-xs space-y-4 animate-in fade-in duration-200">
              
              {/* Header */}
              <div className="flex items-center justify-between gap-2">
                <span 
                  className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                  style={{
                    backgroundColor: GROUP_COLORS[selectedNode.group]?.bg || '#F0EEFF',
                    color: GROUP_COLORS[selectedNode.group]?.fill || '#6259E8',
                  }}
                >
                  {GROUP_LABELS[selectedNode.group] || selectedNode.group}
                </span>

                {selectedNode.taxonomy && (
                  <span className="text-[11px] font-medium text-[#687386] bg-[#F8F9FC] px-2 py-0.5 rounded border border-[#E7EAF0]">
                    {selectedNode.taxonomy}
                  </span>
                )}
              </div>

              {/* Title */}
              <h3 className="text-[17px] font-bold text-[#172033] leading-snug">
                {selectedNode.label}
              </h3>

              {/* Description */}
              <div className="text-[13px] leading-relaxed text-[#464554]">
                {selectedNode.description}
              </div>

              {/* Paper Quote if present */}
              {selectedNode.quote && (
                <div className="p-3 bg-[#F8F9FC] border-l-[3px] border-[#6259E8] rounded-r-lg">
                  <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#6259E8] mb-1">
                    <Quote className="w-3 h-3" />
                    <span>Manuscript Citation</span>
                  </div>
                  <blockquote className="text-[12px] italic text-[#172033] font-serif leading-relaxed">
                    "{selectedNode.quote}"
                  </blockquote>
                </div>
              )}

              {/* Mathematical Formula if present */}
              {selectedNode.formula && (
                <div className="p-3 bg-[#F0EEFF] rounded-lg border border-[#6259E8]/15 space-y-1">
                  <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#6259E8]">
                    <Sigma className="w-3 h-3" />
                    <span>Mathematical Expression</span>
                  </div>
                  <code className="block font-mono text-[11px] text-[#493DCE] break-all whitespace-pre-wrap">
                    {selectedNode.formula}
                  </code>
                </div>
              )}

              {/* Connected Relationships List */}
              <div className="pt-2 border-t border-[#E7EAF0]">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[#687386] mb-2 flex items-center gap-1">
                  <Network className="w-3 h-3 text-[#6259E8]" />
                  <span>Mapped Relationships ({connectedLinks.length})</span>
                </div>

                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {connectedLinks.map((link: any, idx) => {
                    const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
                    const targetId = typeof link.target === 'object' ? link.target.id : link.target;
                    const otherId = sourceId === selectedNode.id ? targetId : sourceId;
                    const otherNode = graphData.nodes.find(n => n.id === otherId);

                    return (
                      <div 
                        key={idx}
                        onClick={() => otherNode && setSelectedNode(otherNode)}
                        className="p-2 rounded-lg bg-[#F8F9FC] hover:bg-[#F0EEFF] border border-[#E7EAF0] text-[12px] cursor-pointer transition-colors flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <span className="text-[10px] uppercase font-bold text-[#6259E8] block">
                            {link.relationship}
                          </span>
                          <span className="font-medium text-[#172033] truncate block">
                            {otherNode?.label || otherId}
                          </span>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-[#687386] shrink-0" />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Deep Link Navigation Action */}
              <div className="pt-2 border-t border-[#E7EAF0] flex items-center gap-2">
                {selectedNode.relatedConceptId && onNavigateToTab && (
                  <button
                    onClick={() => onNavigateToTab('concepts', selectedNode.relatedConceptId)}
                    className="w-full py-2 bg-[#6259E8] hover:bg-[#5147D8] text-white text-[12px] font-semibold rounded-md flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Open in Concept Deep Dives</span>
                  </button>
                )}
                {selectedNode.group === 'formula' && onNavigateToTab && (
                  <button
                    onClick={() => onNavigateToTab('vocabulary')}
                    className="w-full py-2 bg-[#F0EEFF] hover:bg-[#E0DEEF] text-[#6259E8] text-[12px] font-semibold rounded-md flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Sigma className="w-3.5 h-3.5" />
                    <span>View in Formula Matrix</span>
                  </button>
                )}
              </div>

            </div>
          ) : (
            <div className="bg-white rounded-xl border border-[#E7EAF0] p-6 shadow-xs text-center space-y-3 text-[#687386]">
              <div className="w-10 h-10 rounded-full bg-[#F0EEFF] text-[#6259E8] flex items-center justify-center mx-auto">
                <Network className="w-5 h-5" />
              </div>
              <h4 className="text-[14px] font-semibold text-[#172033]">
                Select a Concept Node
              </h4>
              <p className="text-[12px] leading-relaxed">
                Click on any node in the D3 graph to reveal its mathematical formulations, quotes, and structural dependencies.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
