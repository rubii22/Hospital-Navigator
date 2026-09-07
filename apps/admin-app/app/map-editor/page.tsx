"use client";

import React, { useEffect, useState } from "react";
import {
  Compass,
  Plus,
  Save,
  Trash2,
  Maximize2,
  ZoomIn,
  ZoomOut,
  MousePointer,
  GitCommit,
  Network,
  DoorOpen,
  MapPin,
  Ruler,
} from "lucide-react";
import { Button } from "../../src/components/ui/Button";
import { Input } from "../../src/components/ui/Input";
import { Select } from "../../src/components/ui/Select";
import { Switch } from "../../src/components/ui/Switch";
import { Breadcrumbs } from "../../src/components/ui/Breadcrumbs";
import { HospitalApi } from "../../src/api/hospital.api";
import { NavigationApi } from "../../src/api/navigation.api";
import {
  Hospital,
  Building,
  Floor,
  NavigationNode,
  NavigationEdge,
  VectorMapData,
} from "../../src/api/types";

export default function MapEditorPage() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [selectedHospitalId, setSelectedHospitalId] = useState<number | null>(
    null,
  );
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [selectedBuildingId, setSelectedBuildingId] = useState<number | null>(
    null,
  );
  const [floors, setFloors] = useState<Floor[]>([]);
  const [selectedFloorId, setSelectedFloorId] = useState<number | null>(null);

  const [mapData, setMapData] = useState<VectorMapData>({
    schema_version: "1.0",
    session_id: 1,
    floor_id: 1,
    nodes: [],
    edges: [],
    rooms: [],
    doors: [],
  });

  const [activeTool, setActiveTool] = useState<
    "select" | "node" | "edge" | "room" | "measure"
  >("select");
  const [selectedNode, setSelectedNode] = useState<NavigationNode | null>(null);
  const [edgeStartNode, setEdgeStartNode] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchInit = async () => {
      try {
        const hospList = await HospitalApi.getHospitals();
        setHospitals(hospList);
        if (hospList.length > 0) setSelectedHospitalId(hospList[0].id);
      } catch {
        setHospitals([]);
      }
    };
    fetchInit();
  }, []);

  useEffect(() => {
    if (!selectedHospitalId) return;
    const fetchBuildings = async () => {
      try {
        const bList = await HospitalApi.getBuildings(selectedHospitalId);
        setBuildings(bList);
        if (bList.length > 0) setSelectedBuildingId(bList[0].id);
      } catch {
        setBuildings([]);
      }
    };
    fetchBuildings();
  }, [selectedHospitalId]);

  useEffect(() => {
    if (!selectedBuildingId) return;
    const fetchFloors = async () => {
      try {
        const fList = await HospitalApi.getFloors(selectedBuildingId);
        setFloors(fList);
        if (fList.length > 0) setSelectedFloorId(fList[0].id);
      } catch {
        setFloors([]);
      }
    };
    fetchFloors();
  }, [selectedBuildingId]);

  useEffect(() => {
    if (!selectedFloorId) return;
    const fetchMap = async () => {
      try {
        const data = await NavigationApi.getMapData(selectedFloorId);
        setMapData(data);
        if (data.nodes.length > 0) setSelectedNode(data.nodes[0]);
      } catch {
        setMapData({
          schema_version: "1.0",
          session_id: selectedFloorId,
          floor_id: selectedFloorId,
          nodes: [],
          edges: [],
          rooms: [],
          doors: [],
        });
        setSelectedNode(null);
      }
    };
    fetchMap();
  }, [selectedFloorId]);

  const handleCanvasClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round((e.clientX - rect.left) / zoom);
    const y = Math.round((e.clientY - rect.top) / zoom);

    if (activeTool === "node") {
      const newNodeId = `node_${Date.now()}`;
      const newNode: NavigationNode = {
        id: newNodeId,
        label: `Node #${newNodeId.slice(-4)}`,
        type: "corridor",
        x,
        y,
        z: 0,
        accessible: true,
      };
      setMapData((prev) => ({
        ...prev,
        nodes: [...prev.nodes, newNode],
      }));
      setSelectedNode(newNode);
    }
  };

  const handleNodeClick = (node: NavigationNode, e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeTool === "edge") {
      if (!edgeStartNode) {
        setEdgeStartNode(node.id);
      } else if (edgeStartNode !== node.id) {
        const start = mapData.nodes.find((n) => n.id === edgeStartNode);
        const dist = start
          ? Math.round(
              Math.sqrt(
                Math.pow(node.x - start.x, 2) + Math.pow(node.y - start.y, 2),
              ),
            )
          : 50;

        const newEdge: NavigationEdge = {
          id: `edge_${Date.now()}`,
          from_node: edgeStartNode,
          to_node: node.id,
          distance: dist,
          accessible: true,
          edge_type: "corridor",
        };
        setMapData((prev) => ({
          ...prev,
          edges: [...prev.edges, newEdge],
        }));
        setEdgeStartNode(null);
      }
    } else {
      setSelectedNode(node);
    }
  };

  const handleSave = async () => {
    if (!selectedFloorId) return;
    try {
      setIsSaving(true);
      await NavigationApi.saveMapData(selectedFloorId, mapData);
      alert("Map layout saved successfully!");
    } catch (err: any) {
      alert(err?.message || "Failed to save map data");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSelectedNode = () => {
    if (!selectedNode) return;
    setMapData((prev) => ({
      ...prev,
      nodes: prev.nodes.filter((n) => n.id !== selectedNode.id),
      edges: prev.edges.filter(
        (e) => e.from_node !== selectedNode.id && e.to_node !== selectedNode.id,
      ),
    }));
    setSelectedNode(null);
  };

  const currentHospital = hospitals.find((h) => h.id === selectedHospitalId);
  const currentBuilding = buildings.find((b) => b.id === selectedBuildingId);
  const currentFloor = floors.find((f) => f.id === selectedFloorId);

  return (
    <div className="space-y-4">
      <Breadcrumbs
        items={[
          { label: "Hospitals", href: "/hospitals" },
          { label: currentHospital?.name || "Hospital" },
          { label: currentBuilding?.name || "Building" },
          { label: currentFloor?.name || "Floor" },
          { label: "Map Editor" },
        ]}
      />

      <div className="flex sm:flex-row flex-col justify-between sm:items-center gap-4">
        <div>
          <h1 className="font-bold text-[var(--color-text-heading)] text-xl">
            Map Editor
          </h1>
          <p className="text-[var(--color-text-secondary)] text-xs">
            Graph geometry, indoor topological nodes, corridors, and room
            polygons.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-40">
            <Select
              options={hospitals.map((h) => ({ label: h.name, value: h.id }))}
              value={selectedHospitalId || ""}
              onChange={(e) => setSelectedHospitalId(Number(e.target.value))}
            />
          </div>
          <div className="w-40">
            <Select
              options={floors.map((f) => ({ label: f.name, value: f.id }))}
              value={selectedFloorId || ""}
              onChange={(e) => setSelectedFloorId(Number(e.target.value))}
            />
          </div>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            icon={<Save size={16} />}
          >
            {isSaving ? "Saving..." : "Save Map"}
          </Button>
        </div>
      </div>

      <div className="gap-4 grid grid-cols-1 lg:grid-cols-12">
        {/* Canvas & Tools */}
        <div className="flex flex-col gap-3 lg:col-span-9 bg-[var(--color-bg-card)] p-3 border border-border-subtle rounded-xl">
          {/* Toolbar */}
          <div className="flex justify-between items-center bg-[var(--color-bg-surface)] px-2 py-1.5 border border-border-subtle rounded-lg">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveTool("select")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  activeTool === "select"
                    ? "bg-[var(--color-accent-primary)] text-white"
                    : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-surface-hover)] hover:text-[var(--color-text-primary)]"
                }`}
              >
                <MousePointer size={14} /> Select
              </button>
              <button
                onClick={() => setActiveTool("node")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  activeTool === "node"
                    ? "bg-[var(--color-accent-primary)] text-white"
                    : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-surface-hover)] hover:text-[var(--color-text-primary)]"
                }`}
              >
                <GitCommit size={14} /> Add Node
              </button>
              <button
                onClick={() => {
                  setActiveTool("edge");
                  setEdgeStartNode(null);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  activeTool === "edge"
                    ? "bg-[var(--color-accent-primary)] text-white"
                    : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-surface-hover)] hover:text-[var(--color-text-primary)]"
                }`}
              >
                <Network size={14} /> Add Edge
              </button>
              <button
                onClick={() => setActiveTool("measure")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  activeTool === "measure"
                    ? "bg-[var(--color-accent-primary)] text-white"
                    : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-surface-hover)] hover:text-[var(--color-text-primary)]"
                }`}
              >
                <Ruler size={14} /> Measure
              </button>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setZoom((prev) => Math.max(0.5, prev - 0.2))}
                className="hover:bg-[var(--color-bg-surface-hover)] p-1.5 rounded-md text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] cursor-pointer"
              >
                <ZoomOut size={14} />
              </button>
              <span className="px-1 font-mono text-[var(--color-text-muted)] text-xs">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={() => setZoom((prev) => Math.min(2.5, prev + 0.2))}
                className="hover:bg-[var(--color-bg-surface-hover)] p-1.5 rounded-md text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] cursor-pointer"
              >
                <ZoomIn size={14} />
              </button>
            </div>
          </div>

          {/* SVG Canvas */}
          <div className="relative flex justify-center items-center bg-[var(--color-bg-app)] border border-border-subtle rounded-lg w-full h-[520px] overflow-hidden select-none">
            <svg
              className="w-full h-full cursor-crosshair"
              onClick={handleCanvasClick}
            >
              {/* Grid definitions */}
              <defs>
                <pattern
                  id="grid"
                  width={30 * zoom}
                  height={30 * zoom}
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d={`M ${30 * zoom} 0 L 0 0 0 ${30 * zoom}`}
                    fill="none"
                    stroke="var(--border-subtle)"
                    strokeWidth="1"
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />

              {/* Edges */}
              {mapData.edges.map((edge) => {
                const from = mapData.nodes.find((n) => n.id === edge.from_node);
                const to = mapData.nodes.find((n) => n.id === edge.to_node);
                if (!from || !to) return null;
                return (
                  <line
                    key={edge.id}
                    x1={from.x * zoom}
                    y1={from.y * zoom}
                    x2={to.x * zoom}
                    y2={to.y * zoom}
                    stroke="var(--color-accent-primary)"
                    strokeWidth={2 * zoom}
                    strokeDasharray={
                      edge.edge_type === "stairs" ? "4" : undefined
                    }
                  />
                );
              })}

              {/* Nodes */}
              {mapData.nodes.map((node) => {
                const isSelected = selectedNode?.id === node.id;
                const isEdgeStart = edgeStartNode === node.id;
                return (
                  <g
                    key={node.id}
                    transform={`translate(${node.x * zoom}, ${node.y * zoom})`}
                    onClick={(e) => handleNodeClick(node, e)}
                    className="cursor-pointer"
                  >
                    <circle
                      r={(isSelected ? 8 : 6) * zoom}
                      fill={
                        isEdgeStart
                          ? "var(--color-status-warning-text)"
                          : isSelected
                            ? "var(--color-accent-cyan)"
                            : node.type === "elevator"
                              ? "var(--color-accent-purple)"
                              : "var(--color-accent-primary)"
                      }
                      stroke="var(--color-text-heading)"
                      strokeWidth={1.5 * zoom}
                    />
                    <text
                      y={-10 * zoom}
                      textAnchor="middle"
                      fill="var(--color-text-primary)"
                      fontSize={10 * zoom}
                      className="font-medium pointer-events-none"
                    >
                      {node.label || node.id}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Right Properties Inspector */}
        <div className="flex flex-col justify-between lg:col-span-3 bg-[var(--color-bg-card)] p-4 border border-border-subtle rounded-xl">
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-3 border-border-subtle border-b">
              <h3 className="font-semibold text-[var(--color-text-secondary)] text-xs uppercase">
                Properties
              </h3>
              {selectedNode && (
                <span className="font-mono text-xs text-[var(--color-accent-cyan)]">
                  {selectedNode.id}
                </span>
              )}
            </div>

            {selectedNode ? (
              <div className="space-y-3">
                <Input
                  label="Node Name"
                  value={selectedNode.label || ""}
                  onChange={(e) => {
                    const label = e.target.value;
                    setSelectedNode({ ...selectedNode, label });
                    setMapData((prev) => ({
                      ...prev,
                      nodes: prev.nodes.map((n) =>
                        n.id === selectedNode.id ? { ...n, label } : n,
                      ),
                    }));
                  }}
                />
                <Select
                  label="Node Type"
                  value={selectedNode.type}
                  onChange={(e) => {
                    const type = e.target.value;
                    setSelectedNode({ ...selectedNode, type });
                    setMapData((prev) => ({
                      ...prev,
                      nodes: prev.nodes.map((n) =>
                        n.id === selectedNode.id ? { ...n, type } : n,
                      ),
                    }));
                  }}
                  options={[
                    { label: "Corridor / Pathway", value: "corridor" },
                    { label: "Intersection", value: "intersection" },
                    { label: "Door / Entrance", value: "entrance" },
                    { label: "Elevator", value: "elevator" },
                    { label: "Stairs", value: "stairs" },
                    { label: "Ramp", value: "ramp" },
                  ]}
                />
                <div className="gap-2 grid grid-cols-2">
                  <Input
                    label="Pos X"
                    type="number"
                    value={selectedNode.x}
                    onChange={(e) => {
                      const x = parseFloat(e.target.value) || 0;
                      setSelectedNode({ ...selectedNode, x });
                      setMapData((prev) => ({
                        ...prev,
                        nodes: prev.nodes.map((n) =>
                          n.id === selectedNode.id ? { ...n, x } : n,
                        ),
                      }));
                    }}
                  />
                  <Input
                    label="Pos Y"
                    type="number"
                    value={selectedNode.y}
                    onChange={(e) => {
                      const y = parseFloat(e.target.value) || 0;
                      setSelectedNode({ ...selectedNode, y });
                      setMapData((prev) => ({
                        ...prev,
                        nodes: prev.nodes.map((n) =>
                          n.id === selectedNode.id ? { ...n, y } : n,
                        ),
                      }));
                    }}
                  />
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-[var(--color-text-secondary)] text-xs">
                    Wheelchair Accessible
                  </span>
                  <Switch
                    checked={selectedNode.accessible ?? true}
                    onChange={(checked) => {
                      setSelectedNode({ ...selectedNode, accessible: checked });
                      setMapData((prev) => ({
                        ...prev,
                        nodes: prev.nodes.map((n) =>
                          n.id === selectedNode.id
                            ? { ...n, accessible: checked }
                            : n,
                        ),
                      }));
                    }}
                  />
                </div>
              </div>
            ) : (
              <p className="py-12 text-[var(--color-text-muted)] text-xs text-center">
                Select a node or click Add Node to place on the canvas.
              </p>
            )}
          </div>

          {selectedNode && (
            <Button
              variant="danger"
              size="sm"
              onClick={handleDeleteSelectedNode}
              icon={<Trash2 size={14} />}
              className="mt-6"
            >
              Delete Node
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
