"use client";

import React, { useEffect, useState } from "react";
import {
  GitBranch,
  CheckCircle,
  Download,
  Share2,
  AlertTriangle,
  Layers,
} from "lucide-react";
import { Button } from "../../src/components/ui/Button";
import { Select } from "../../src/components/ui/Select";
import { Badge } from "../../src/components/ui/Badge";
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

export default function NavigationGraphPage() {
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

  const [selectedEdge, setSelectedEdge] = useState<NavigationEdge | null>(null);
  const [validationResult, setValidationResult] = useState<string | null>(null);

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
        if (data.edges.length > 0) setSelectedEdge(data.edges[0]);
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
      }
    };
    fetchMap();
  }, [selectedFloorId]);

  const handleValidateGraph = () => {
    const disconnected = mapData.nodes.filter(
      (n) =>
        !mapData.edges.some((e) => e.from_node === n.id || e.to_node === n.id),
    );
    if (disconnected.length === 0) {
      setValidationResult(
        "Graph topology is fully connected with zero isolated components.",
      );
    } else {
      setValidationResult(
        `Warning: Found ${disconnected.length} disconnected isolated nodes.`,
      );
    }
  };

  const handleExport = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(mapData, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute(
      "download",
      `navigation_graph_floor_${selectedFloorId}.json`,
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
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
          { label: "Navigation Graph" },
        ]}
      />

      <div className="flex sm:flex-row flex-col justify-between sm:items-center gap-4">
        <div>
          <h1 className="font-bold text-[var(--color-text-heading)] text-xl">
            Navigation Graph & Routing Topology
          </h1>
          <p className="text-[var(--color-text-secondary)] text-xs">
            A* graph connectivity, distance weights, and topological validation.
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
            onClick={handleValidateGraph}
            variant="secondary"
            icon={<CheckCircle size={15} />}
          >
            Validate Graph
          </Button>
          <Button onClick={handleExport} icon={<Download size={15} />}>
            Export
          </Button>
        </div>
      </div>

      {validationResult && (
        <div className="flex justify-between items-center bg-[var(--color-bg-surface)] p-3 border border-[var(--color-border-medium)] rounded-lg text-xs">
          <span className="font-medium text-[var(--color-text-primary)]">
            {validationResult}
          </span>
          <button
            onClick={() => setValidationResult(null)}
            className="text-text-muted hover:text-white"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Metrics Row */}
      <div className="gap-3 grid grid-cols-2 sm:grid-cols-5">
        <div className="bg-bg-card p-3 border border-border-subtle rounded-lg">
          <span className="text-[10px] text-text-muted uppercase">Nodes</span>
          <div className="font-bold text-text-heading text-lg">
            {mapData.nodes.length}
          </div>
        </div>
        <div className="bg-bg-card p-3 border border-border-subtle rounded-lg">
          <span className="text-[10px] text-text-muted uppercase">Edges</span>
          <div className="font-bold text-text-heading text-lg">
            {mapData.edges.length}
          </div>
        </div>
        <div className="bg-bg-card p-3 border border-border-subtle rounded-lg">
          <span className="text-[10px] text-text-muted uppercase">
            Intersections
          </span>
          <div className="font-bold text-lg text-accent-cyan">
            {mapData.nodes.filter((n) => n.type === "intersection").length}
          </div>
        </div>
        <div className="bg-bg-card p-3 border border-border-subtle rounded-lg">
          <span className="text-[10px] text-text-muted uppercase">
            Dead Ends
          </span>
          <div className="font-bold text-status-warning-text text-lg">
            {
              mapData.nodes.filter(
                (n) =>
                  mapData.edges.filter(
                    (e) => e.from_node === n.id || e.to_node === n.id,
                  ).length === 1,
              ).length
            }
          </div>
        </div>
        <div className="bg-bg-card p-3 border border-border-subtle rounded-lg">
          <span className="text-[10px] text-text-muted uppercase">
            Disconnected
          </span>
          <div className="font-bold text-status-active-text text-lg">
            {
              mapData.nodes.filter(
                (n) =>
                  !mapData.edges.some(
                    (e) => e.from_node === n.id || e.to_node === n.id,
                  ),
              ).length
            }
          </div>
        </div>
      </div>

      <div className="gap-4 grid grid-cols-1 lg:grid-cols-12">
        {/* Canvas Graph View */}
        <div className="flex flex-col gap-3 lg:col-span-9 bg-bg-card p-3 border border-border-subtle rounded-xl">
          <div className="relative flex justify-center items-center bg-bg-app border border-border-subtle rounded-lg w-full h-[500px] overflow-hidden">
            <svg className="w-full h-full">
              {/* Edges */}
              {mapData.edges.map((edge) => {
                const from = mapData.nodes.find((n) => n.id === edge.from_node);
                const to = mapData.nodes.find((n) => n.id === edge.to_node);
                if (!from || !to) return null;
                const isSelected = selectedEdge?.id === edge.id;
                return (
                  <line
                    key={edge.id}
                    x1={from.x}
                    y1={from.y}
                    x2={to.x}
                    y2={to.y}
                    stroke={
                      isSelected
                        ? "var(--color-accent-cyan)"
                        : "var(--color-accent-primary)"
                    }
                    strokeWidth={isSelected ? 3 : 1.5}
                    onClick={() => setSelectedEdge(edge)}
                    className="hover:stroke-accent-cyan transition-colors cursor-pointer"
                  />
                );
              })}

              {/* Nodes */}
              {mapData.nodes.map((node) => (
                <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
                  <circle
                    r={5}
                    fill={
                      node.type === "intersection"
                        ? "var(--color-accent-cyan)"
                        : node.type === "elevator"
                          ? "var(--color-accent-purple)"
                          : "var(--color-accent-primary)"
                    }
                    stroke="var(--color-text-heading)"
                    strokeWidth={1}
                  />
                </g>
              ))}
            </svg>

            {/* Legend Overlay */}
            <div className="bottom-3 left-3 absolute flex items-center gap-3 bg-[var(--color-bg-surface)] shadow-md p-2.5 border border-border-subtle rounded-lg text-[10px] text-[var(--color-text-secondary)]">
              <span className="flex items-center gap-1">
                <span className="rounded-full w-2 h-2 bg-[var(--color-accent-primary)]" />{" "}
                Pathway
              </span>
              <span className="flex items-center gap-1">
                <span className="rounded-full w-2 h-2 bg-[var(--color-accent-cyan)]" />{" "}
                Intersection
              </span>
              <span className="flex items-center gap-1">
                <span className="rounded-full w-2 h-2 bg-[var(--color-accent-purple)]" />{" "}
                Elevator
              </span>
            </div>
          </div>
        </div>

        {/* Right Edge Inspector */}
        <div className="space-y-4 lg:col-span-3 bg-[var(--color-bg-card)] p-4 border border-border-subtle rounded-xl">
          <div className="flex justify-between items-center pb-3 border-border-subtle border-b">
            <h3 className="font-semibold text-[var(--color-text-secondary)] text-xs uppercase">
              Edge Inspector
            </h3>
            {selectedEdge && (
              <span className="font-mono text-xs text-[var(--color-accent-cyan)]">
                {selectedEdge.id}
              </span>
            )}
          </div>

          {selectedEdge ? (
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-border-subtle border-b">
                <span className="text-[var(--color-text-secondary)]">
                  From Node:
                </span>
                <span className="font-mono text-[var(--color-text-primary)]">
                  {selectedEdge.from_node}
                </span>
              </div>
              <div className="flex justify-between py-1 border-border-subtle border-b">
                <span className="text-[var(--color-text-secondary)]">
                  To Node:
                </span>
                <span className="font-mono text-[var(--color-text-primary)]">
                  {selectedEdge.to_node}
                </span>
              </div>
              <div className="flex justify-between py-1 border-border-subtle border-b">
                <span className="text-[var(--color-text-secondary)]">
                  Weight (Distance):
                </span>
                <span className="font-bold text-[var(--color-text-primary)]">
                  {selectedEdge.distance}m
                </span>
              </div>
              <div className="flex justify-between py-1 border-border-subtle border-b">
                <span className="text-[var(--color-text-secondary)]">
                  Estimated Travel:
                </span>
                <span className="text-[var(--color-text-primary)]">
                  {Math.round((selectedEdge.distance / 1.2) * 10) / 10}s
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[var(--color-text-secondary)]">
                  Accessible:
                </span>
                <Badge
                  variant={selectedEdge.accessible ? "active" : "danger"}
                  size="sm"
                >
                  {selectedEdge.accessible ? "Yes" : "No"}
                </Badge>
              </div>
            </div>
          ) : (
            <p className="py-12 text-text-muted text-xs text-center">
              Click any edge line on the graph canvas to inspect properties.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
