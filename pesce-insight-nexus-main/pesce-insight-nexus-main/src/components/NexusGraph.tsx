"use client";

import React, { useMemo, useEffect, useState, useRef, useCallback } from "react";
import ForceGraph2D from "react-force-graph-2d";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/lib/supabase"; // Use standardized client
import { Loader2, Zap, Share2, Maximize2 } from "lucide-react";
import { motion } from "framer-motion";

interface Node {
  id: string | number;
  name: string;
  val: number;
  category?: string;
  matchScore?: number;
  isTarget?: boolean;
}

interface Link {
  source: string | number;
  target: string | number;
  value: number;
}

interface NexusGraphProps {
  companyId: number;
  companyName: string;
}

export function NexusGraph({ companyId, companyName }: NexusGraphProps) {
  const navigate = useNavigate();
  const [data, setData] = useState<{ nodes: Node[]; links: Link[] }>({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const fgRef = useRef<any>(null);

  useEffect(() => {
    async function fetchEcosystem() {
      setLoading(true);
      try {
        // Fetch similarity via RPC
        const { data: similar, error: rpcError } = await supabase.rpc('match_similar_companies', { 
          target_id: companyId 
        });

        if (rpcError) throw rpcError;

        // Fetch categories for all similar companies to create cross-links
        const ids = (similar || []).map((s: any) => s.id);
        const { data: companies } = await supabase
          .from('companies')
          .select('company_id, category')
          .in('company_id', ids);

        const categoryMap = new Map((companies || []).map((c: any) => [c.company_id, c.category]));

        // Construct Nodes
        const nodes: Node[] = [
          { id: companyId, name: companyName, val: 30, isTarget: true, category: 'Target' },
          ...(similar || []).map((s: any) => ({
            id: s.id,
            name: s.name,
            val: 10 + (s.match_percentage / 10),
            matchScore: s.match_percentage,
            category: categoryMap.get(s.id) || 'General'
          }))
        ];

        // Construct Links
        const links: Link[] = [];
        
        // Primary links (Target to Similar)
        (similar || []).forEach((s: any) => {
          links.push({
            source: companyId,
            target: s.id,
            value: s.match_percentage / 100
          });
        });

        // Secondary links (Inter-connectivity based on category)
        // This creates the "web" look from the reference image
        for (let i = 0; i < nodes.length; i++) {
          for (let j = i + 1; j < nodes.length; j++) {
            const n1 = nodes[i];
            const n2 = nodes[j];
            if (n1.category === n2.category && n1.category !== 'Target') {
              links.push({
                source: n1.id,
                target: n2.id,
                value: 0.2 // Weaker connection for sub-links
              });
            }
          }
        }

        setData({ nodes, links });
      } catch (err) {
        console.error("[NexusGraph] Hydration failed:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchEcosystem();
  }, [companyId, companyName]);

  // Center and simulate
  useEffect(() => {
    if (fgRef.current && data.nodes.length > 0) {
      fgRef.current.d3Force("charge").strength(-200);
      fgRef.current.d3Force("link").distance(100);
      fgRef.current.zoomToFit(600, 100);
    }
  }, [data]);

  // High-fidelity node renderer
  const renderNode = useCallback((node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const label = node.name;
    const fontSize = 12 / globalScale;
    const r = node.val / Math.sqrt(globalScale);
    
    // Node Body
    ctx.beginPath();
    ctx.arc(node.x, node.y, r, 0, 2 * Math.PI, false);
    
    // Gradient fill based on type
    const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, r);
    if (node.isTarget) {
      gradient.addColorStop(0, '#818cf8');
      gradient.addColorStop(1, '#4f46e5');
      ctx.shadowColor = '#6366f1';
      ctx.shadowBlur = 15;
    } else {
      gradient.addColorStop(0, '#ffffff');
      gradient.addColorStop(1, '#a1a1aa');
      ctx.shadowBlur = 0;
    }
    
    ctx.fillStyle = gradient;
    ctx.fill();

    // Border
    ctx.strokeStyle = node.isTarget ? '#c7d2fe' : '#3f3f46';
    ctx.lineWidth = 1 / globalScale;
    ctx.stroke();

    // Label on hover or if important
    if (globalScale > 2 || node.isTarget) {
      ctx.font = `${fontSize}px Inter`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = node.isTarget ? '#ffffff' : '#d4d4d8';
      ctx.fillText(label, node.x, node.y + r + fontSize + 2);
    }
  }, []);

  if (loading) {
    return (
      <div className="h-[500px] w-full bg-zinc-950/80 border border-zinc-800 rounded-[2.5rem] flex flex-col items-center justify-center gap-6 backdrop-blur-xl">
        <div className="relative">
          <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
          <div className="absolute inset-0 blur-lg bg-indigo-500/20 animate-pulse" />
        </div>
        <div className="text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 mb-1">Nexus Core Synchronizing</p>
          <p className="text-[8px] font-medium text-zinc-500 uppercase tracking-widest">Mapping Intelligence Topology...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-[500px] w-full bg-zinc-950 border border-zinc-800 rounded-[2.5rem] overflow-hidden shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] group">
      {/* Cinematic HUD Overlays */}
      <div className="absolute top-8 left-8 z-20 pointer-events-none">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3 mb-2"
        >
          <div className="p-1.5 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
            <Zap className="h-4 w-4 text-indigo-500" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Neural Intelligence Nexus</span>
        </motion.div>
        <h3 className="text-xl font-bold text-white uppercase tracking-tighter leading-none mb-1">
          Ecosystem Topology
        </h3>
        <p className="text-[10px] font-medium text-zinc-600 uppercase tracking-widest">
          Node: {companyName} • Connectivity: High Density
        </p>
      </div>

      <div className="absolute bottom-8 right-8 z-20 pointer-events-none flex gap-4">
        <div className="text-right">
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-700">Dynamic Force Vectoring</p>
          <p className="text-[8px] font-bold text-zinc-800 uppercase">Live Sync: 143 Nodes</p>
        </div>
      </div>

      {/* Control Layer */}
      <div className="absolute top-8 right-8 z-20 flex gap-2">
        <button className="p-2 bg-zinc-900/50 border border-zinc-800 rounded-xl text-zinc-500 hover:text-white transition-colors backdrop-blur-md">
          <Maximize2 className="h-4 w-4" />
        </button>
        <button className="p-2 bg-zinc-900/50 border border-zinc-800 rounded-xl text-zinc-500 hover:text-white transition-colors backdrop-blur-md">
          <Share2 className="h-4 w-4" />
        </button>
      </div>

      <ForceGraph2D
        ref={fgRef}
        graphData={data}
        backgroundColor="#09090b"
        nodeCanvasObject={renderNode}
        nodePointerAreaPaint={(node, color, ctx) => {
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(node.x!, node.y!, node.val + 2, 0, 2 * Math.PI, false);
          ctx.fill();
        }}
        linkColor={() => "#27272a"}
        linkWidth={(link: any) => link.value * 2}
        linkDirectionalParticles={1}
        linkDirectionalParticleWidth={1.5}
        linkDirectionalParticleSpeed={0.005}
        linkDirectionalParticleColor={() => "#6366f1"}
        onNodeClick={(node: any) => {
          if (node.isTarget) return;
          navigate({ 
            to: "/companies/$id", 
            params: { id: node.id.toString() } 
          } as any);
        }}
        cooldownTicks={100}
        d3AlphaDecay={0.01}
        d3VelocityDecay={0.1}
      />

      {/* Glass Vignette */}
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.8)] rounded-[2.5rem]" />
    </div>
  );
}
