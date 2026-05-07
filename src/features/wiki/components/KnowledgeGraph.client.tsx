import { useEffect, useRef } from 'react';
import type { GraphData, GraphNode } from '../types';

interface KnowledgeGraphProps {
  graphData: GraphData;
  nodeHrefBase?: string;
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

export default function KnowledgeGraph({
  graphData,
  nodeHrefBase = '/zh/wiki',
}: KnowledgeGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hoveredRef = useRef<GraphNode | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

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
    interface SimNode {
      node: GraphNode;
      x: number;
      y: number;
      vx: number;
      vy: number;
    }
    const nodeMap = new Map<string, SimNode>();

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

      for (const pos of positions) {
        pos.vx += (cx - pos.x) * centerForce;
        pos.vy += (cy - pos.y) * centerForce;
        pos.vx *= damping;
        pos.vy *= damping;
        pos.x += pos.vx;
        pos.y += pos.vy;
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
      const hovered = hoveredRef.current;
      const hoveredId = hovered?.id ?? null;
      const relatedIds = hoveredId ? adjacency.get(hoveredId) || new Set() : new Set<string>();

      for (const edge of edges) {
        const a = nodeMap.get(edge.source);
        const b = nodeMap.get(edge.target);
        if (!a || !b) continue;

        const isHighlighted = hoveredId && (edge.source === hoveredId || edge.target === hoveredId);

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

    function getNodeAt(mx: number, my: number) {
      for (const pos of nodeMap.values()) {
        const dx = pos.x - mx;
        const dy = pos.y - my;
        if (dx * dx + dy * dy < 400) return pos.node;
      }
      return null;
    }

    function updateTooltip(node: GraphNode | null) {
      const tooltip = tooltipRef.current;
      if (!tooltip) return;
      if (node) {
        tooltip.style.display = 'block';
        tooltip.innerHTML = `<span class="font-medium text-zinc-900 dark:text-zinc-100">${node.title}</span><span class="text-zinc-400 ml-2">${typeLabels[node.type]}</span>`;
      } else {
        tooltip.style.display = 'none';
      }
    }

    function handleMouseMove(e: MouseEvent) {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const node = getNodeAt(mx, my);
      hoveredRef.current = node;
      canvas.style.cursor = node ? 'pointer' : 'default';
      updateTooltip(node);
      if (!simulationRunning) draw();
    }

    function handleClick(e: MouseEvent) {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const node = getNodeAt(mx, my);
      if (node) {
        window.location.href = `${nodeHrefBase.replace(/\/$/, '')}/${node.id}/`;
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
  }, [graphData, nodeHrefBase]);

  return (
    <div ref={containerRef} className="relative w-full">
      <canvas
        ref={canvasRef}
        className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950"
      />
      <div className="flex flex-wrap gap-4 mt-4 justify-center">
        {Object.entries(typeLabels).map(([type, label]) => (
          <div
            key={type}
            className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400"
          >
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: typeColors[type] }}
            />
            {label}
          </div>
        ))}
      </div>
      <div
        ref={tooltipRef}
        className="absolute top-3 left-3 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs shadow-lg hidden"
      />
    </div>
  );
}
