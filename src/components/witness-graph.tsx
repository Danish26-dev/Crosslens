import { useMemo } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  type Edge,
  type Node,
  MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";
import type { Evidence, Statement, Witness } from "@/lib/types/case";

export function WitnessGraph({
  witnesses,
  statements,
  evidence,
}: {
  witnesses: Witness[];
  statements: Statement[];
  evidence: Evidence[];
}) {
  const { nodes, edges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    witnesses.forEach((w, i) => {
      nodes.push({
        id: w.id,
        type: "default",
        position: { x: 60, y: 60 + i * 180 },
        data: {
          label: (
            <div className="px-1 text-left">
              <div className="text-[10px] font-medium uppercase tracking-wider text-primary">Witness</div>
              <div className="text-sm font-semibold text-foreground">{w.name}</div>
              <div className="text-[11px] text-muted-foreground">{w.role}</div>
            </div>
          ),
        },
        style: {
          background: "white",
          border: "1px solid oklch(0.52 0.18 258 / 0.35)",
          borderRadius: 10,
          padding: 10,
          width: 200,
          boxShadow: "0 6px 16px oklch(0.52 0.18 258 / 0.08)",
        },
      });
    });

    statements.forEach((s, i) => {
      nodes.push({
        id: s.id,
        position: { x: 380, y: 30 + i * 90 },
        data: {
          label: (
            <div className="px-1 text-left">
              <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Statement · {s.topic}
              </div>
              <div className="text-xs text-foreground line-clamp-2">"{s.text}"</div>
              <div className="text-[10px] text-muted-foreground">
                {s.document} · p.{s.page}
              </div>
            </div>
          ),
        },
        style: {
          background: "oklch(0.99 0.005 250)",
          border: "1px solid oklch(0.92 0.01 255)",
          borderRadius: 10,
          padding: 10,
          width: 240,
        },
      });
      edges.push({
        id: `${s.witnessId}-${s.id}`,
        source: s.witnessId,
        target: s.id,
        animated: true,
        style: { stroke: "oklch(0.52 0.18 258 / 0.45)" },
        markerEnd: { type: MarkerType.ArrowClosed, color: "oklch(0.52 0.18 258)" },
      });
    });

    evidence.forEach((e, i) => {
      nodes.push({
        id: e.id,
        position: { x: 750, y: 80 + i * 130 },
        data: {
          label: (
            <div className="px-1 text-left">
              <div className="text-[10px] font-medium uppercase tracking-wider" style={{ color: "oklch(0.55 0.15 155)" }}>
                Evidence · {e.kind}
              </div>
              <div className="text-sm font-semibold text-foreground">{e.label}</div>
              <div className="text-[11px] text-muted-foreground line-clamp-2">{e.description}</div>
            </div>
          ),
        },
        style: {
          background: "white",
          border: "1px solid oklch(0.62 0.14 155 / 0.35)",
          borderRadius: 10,
          padding: 10,
          width: 220,
          boxShadow: "0 6px 16px oklch(0.62 0.14 155 / 0.08)",
        },
      });
      e.linkedStatementIds.forEach((sid) => {
        edges.push({
          id: `${sid}-${e.id}`,
          source: sid,
          target: e.id,
          style: { stroke: "oklch(0.62 0.14 155 / 0.5)", strokeDasharray: "4 4" },
          markerEnd: { type: MarkerType.ArrowClosed, color: "oklch(0.62 0.14 155)" },
        });
      });
    });

    return { nodes, edges };
  }, [witnesses, statements, evidence]);

  return (
    <div className="h-[560px] w-full overflow-hidden rounded-xl border bg-card">
      <ReactFlow nodes={nodes} edges={edges} fitView proOptions={{ hideAttribution: true }}>
        <Background gap={20} color="oklch(0.92 0.01 255)" />
        <MiniMap pannable zoomable className="!bg-card !border" />
        <Controls className="!bg-card !border !rounded-md" />
      </ReactFlow>
    </div>
  );
}
