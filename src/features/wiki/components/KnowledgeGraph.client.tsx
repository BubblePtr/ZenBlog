import { useEffect, useRef, useState } from 'react';
import type { GraphData, GraphNode, GraphEdge } from '../types';

interface KnowledgeGraphProps {
  graphData: GraphData;
}

const typeColors: Record<string, string> = {
  entity: '#3b82f6',
  concept: '#10b981',
  comparison: '#f59e0b',
  query: '#a855f7',
};

const typeLabels: Record<string, string> = {
  entity: '实体',
  concept: '概念',
  comparison: '对比',
  query: '查询',
};

export default function KnowledgeGraph({ graphData }: KnowledgeGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    let width = container.clientWidth;
    let height = Math.max(500, Math.min(700, width * 0.6));

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    const { nodes, edges } = graphData;

    // Physics simulation state
    const nodeMap = new Map<
      string,
      {
        node: GraphNode;
        x: number;
        y: number;
        vx: number;
        vy: number;
      }
    >();

    // Initialize positions in a circle
    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.min(width, height) * 0.35;
    nodes.forEach((node, i) => {
      const angle = (2 * Math.PI * i) / nodes.length;
      nodeMap.set(node.id, {
        node,
        x: cx + radius * Math.cos(angle),
        y: cy + radius * Math.sin(angle),
        vx: 0,
        vy: 0,
      });
    });

    // Build adjacency for highlighting
    const adjacency = new Map<string, Set<string>>();
    for (const edge of edges) {
      if (!adjacency.has(edge.source)) adjacency.set(edge.source, new Set());
      if (!adjacency.has(edge.target)) adjacency.set(edge.target, new Set());
      adjacency.get(edge.source)!.add(edge.target);
      adjacency.get(edge.target)!.add(edge.source);
    }

    let animFrame: number;
    let simulationRunning = true;
    let tick = 0;

    function simulate() {
      const positions = Array.from(nodeMap.values());
      const repulsion = 8000;
      const attraction = 0.005;
      const damping = 0.85;
      const centerForce = 0.01;

      // Repulsion between all nodes
      for (let i = 0; i < positions.length; i++) {
        for (let j = i + 1; j < positions.length; j++) {
          const a = positions[i];
          const b = positions[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = repulsion / (dist * dist);
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;
          a.vx += fx;
          a.vy += fy;
          b.vx -= fx;
          b.vy -= fy;
        }
      }

      // Attraction along edges
      for (const edge of edges) {
        const a = nodeMap.get(edge.source);
        const b = nodeMap.get(edge.target);
        if (!a || !b) continue;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = dist * attraction;
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        a.vx += fx;
        a.vy += fy;
        b.vx -= fx;
        b.vy -= fy;
      }

      // Center gravity + update
      for (const pos of positions) {
        pos.vx += (cx - pos.x) * centerForce;
        pos.vy += (cy - pos.y) * centerForce;
        pos.vx *= damping;
        pos.vy *= damping;
        pos.x += pos.vx;
        pos.y += pos.vy;
        // Clamp
        pos.x = Math.max(40, Math.min(width - 40, pos.x));
        pos.y = Math.max(40, Math.min(height - 40, pos.y));
      }

      tick++;
      if (tick < 300) {
        animFrame = requestAnimationFrame(simulate);
      } else {
        simulationRunning = false;
      }
      draw();
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);

      const isDark = document.documentElement.classList.contains('dark');
      const hoveredId = hoveredNode?.id || selectedNode?.id;
      const relatedIds = hoveredId ? adjacency.get(hoveredId) || new Set() : new Set();

      // Draw edges
      for (const edge of edges) {
        const a = nodeMap.get(edge.source);
        const b = nodeMap.get(edge.target);
        if (!a || !b) continue;

        const isHighlighted =
          hoveredId && (edge.source === hoveredId || edge.target === hoveredId);
        const isFaded = hoveredId && !isHighlighted;

        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = isHighlighted
          ? isDark
            ? 'rgba(255,255,255,0.4)'
            : 'rgba(0,0,0,0.3)'
          : isDark
            ? 'rgba(255,255,255,0.08)'
            : 'rgba(0,0,0,0.08)';
        ctx.lineWidth = isHighlighted ? 1.5 : 0.8;
        ctx.stroke();
      }

      // Draw nodes
      for (const pos of nodeMap.values()) {
        const isHovered = hoveredId === pos.node.id;
        const isRelated = relatedIds.has(pos.node.id);
        const isFaded = hoveredId && !isHovered && !isRelated;
        const color = typeColors[pos.node.type] || '#888';
        const r = isHovered ? 10 : isRelated ? 8 : 6;

        ctx.beginPath();
        ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2);
        ctx.globalAlpha = isFaded ? 0.15 : 1;
        ctx.fillStyle = color;
        ctx.fill();

        // Label
        ctx.font = `${isHovered ? 'bold ' : ''}${isHovered ? 13 : 11}px system-ui, -apple-system, sans-serif`;
        ctx.fillStyle = isDark
          ? isFaded
            ? 'rgba(255,255,255,0.15)'
            : 'rgba(255,255,255,0.85)'
          : isFaded
            ? 'rgba(0,0,0,0.15)'
            : 'rgba(0,0,0,0.75)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(pos.node.title, pos.x, pos.y + r + 4);
        ctx.globalAlpha = 1;
      }
    }

    // Mouse interaction
    function getNodeAt(mx: number, my: number) {
      for (const pos of nodeMap.values()) {
        const dx = pos.x - mx;
        const dy = pos.y - my;
        if (dx * dx + dy * dy < 400) return pos.node;
      }
      return null;
    }

    function handleMouseMove(e: MouseEvent) {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const node = getNodeAt(mx, my);
      setHoveredNode(node);
      canvas.style.cursor = node ? 'pointer' : 'default';
      if (!simulationRunning) draw();
    }

    function handleClick(e: MouseEvent) {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const node = getNodeAt(mx, my);
      if (node) {
        setSelectedNode(node);
        window.location.href = `/wiki/${node.id}`;
      }
    }

    function handleResize() {
      width = container.clientWidth;
      height = Math.max(500, Math.min(700, width * 0.6));
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
      if (!simulationRunning) draw();
    }

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('click', handleClick);
    window.addEventListener('resize', handleResize);

    simulate();

    return () => {
      cancelAnimationFrame(animFrame);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('click', handleClick);
      window.removeEventListener('resize', handleResize);
    };
  }, [graphData]);

  return (
    <div ref={containerRef} className="relative w-full">
      <canvas
        ref={canvasRef}
        className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950"
      />
      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-4 justify-center">
        {Object.entries(typeLabels).map(([type, label]) => (
          <div key={type} className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: typeColors[type] }}
            />
            {label}
          </div>
        ))}
      </div>
      {hoveredNode && (
        <div className="absolute top-3 left-3 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs shadow-lg">
          <span className="font-medium text-zinc-900 dark:text-zinc-100">{hoveredNode.title}</span>
          <span className="text-zinc-400 ml-2">{typeLabels[hoveredNode.type]}</span>
        </div>
      )}
    </div>
  );
}
