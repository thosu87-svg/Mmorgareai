'use client';

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { ChunkData } from '@/lib/math-engine';

interface WorldMapProps {
  chunks: ChunkData[];
}

export default function WorldMap({ chunks }: WorldMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || chunks.length === 0) return;

    // Clear previous
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current);
    const width = 800;
    const height = 600;

    svg.attr('width', '100%').attr('height', height);

    const g = svg.append('g');

    // Zoom and Pan
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 10])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Initial positioning
    svg.call(zoom.transform, d3.zoomIdentity.translate(width / 2, height / 2).scale(0.5));

    // Render Chunks
    g.selectAll('rect')
      .data(chunks)
      .enter()
      .append('rect')
      .attr('x', d => d.x * 100)
      .attr('y', d => d.z * 100)
      .attr('width', 95)
      .attr('height', 95)
      .attr('rx', 8)
      .attr('fill', d => d.biome === 'forest' ? '#2d5a27' : '#d2b48c')
      .attr('stroke', 'rgba(255,255,255,0.1)')
      .on('mouseover', function() {
        d3.select(this).attr('stroke', '#60D4FF').attr('stroke-width', 3);
      })
      .on('mouseout', function() {
        d3.select(this).attr('stroke', 'rgba(255,255,255,0.1)').attr('stroke-width', 1);
      });

    // Render Labels
    g.selectAll('text')
      .data(chunks)
      .enter()
      .append('text')
      .attr('x', d => d.x * 100 + 10)
      .attr('y', d => d.z * 100 + 25)
      .attr('font-size', '10px')
      .attr('font-weight', 'bold')
      .attr('fill', 'white')
      .style('pointer-events', 'none')
      .text(d => d.id);

  }, [chunks]);

  return (
    <div className="border border-white/5 rounded-3xl overflow-hidden bg-black/40 backdrop-blur-xl shadow-2xl">
      <svg ref={svgRef} className="cursor-move" />
    </div>
  );
}
