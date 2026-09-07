"use client";

import React, { useEffect, useState } from "react";
import { Sparkles, CheckCheck, Tag, ScanText } from "lucide-react";
import { Table, Column } from "../../src/components/ui/Table";
import { Button } from "../../src/components/ui/Button";
import { Select } from "../../src/components/ui/Select";
import { Badge } from "../../src/components/ui/Badge";
import { JobsApi } from "../../src/api/jobs.api";
import { MappingSession } from "../../src/api/types";

export default function AIResultsPage() {
  const [sessions, setSessions] = useState<MappingSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
  const [objects, setObjects] = useState<any[]>([]);
  const [ocrList, setOcrList] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"ocr" | "objects">("ocr");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const data = await JobsApi.getSessions();
        setSessions(data);
        if (data.length > 0) setSelectedSessionId(data[0].id);
      } catch {
        setSessions([]);
      }
    };
    fetchSessions();
  }, []);

  const fetchArtifacts = async (sessionId: number) => {
    try {
      setLoading(true);
      const [objs, ocrs] = await Promise.all([
        JobsApi.getObjectDetections(sessionId),
        JobsApi.getOCRDetections(sessionId),
      ]);
      setObjects(objs);
      setOcrList(ocrs);
    } catch {
      setObjects([]);
      setOcrList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedSessionId) {
      fetchArtifacts(selectedSessionId);
    }
  }, [selectedSessionId]);

  const handleAcceptAllOCR = async () => {
    if (!selectedSessionId) return;
    try {
      await JobsApi.acceptAllOCR(selectedSessionId);
      alert("All OCR detected text accepted into map metadata!");
      fetchArtifacts(selectedSessionId);
    } catch (err: any) {
      alert(err?.message || "Failed to accept OCR detections");
    }
  };

  const ocrColumns: Column<any>[] = [
    {
      key: "detected_text",
      header: "Extracted Text",
      render: (item) => (
        <div className="flex items-center gap-2">
          <ScanText size={14} className="text-[var(--color-accent-cyan)]" />
          <span className="font-semibold text-[var(--color-text-heading)]">
            {item.detected_text}
          </span>
        </div>
      ),
    },
    {
      key: "category",
      header: "Signage Category",
      render: (item) => (
        <Badge variant="primary" size="sm">
          {item.category || "signage"}
        </Badge>
      ),
    },
    {
      key: "confidence",
      header: "Confidence",
      render: (item) => (
        <span className="font-mono text-xs text-[var(--color-text-secondary)]">
          {Math.round((item.confidence || 0.95) * 100)}%
        </span>
      ),
    },
    {
      key: "status",
      header: "Review Status",
      render: (item) => (
        <Badge variant={item.status === "approved" ? "active" : "warning"}>
          {item.status || "pending"}
        </Badge>
      ),
    },
  ];

  const objectColumns: Column<any>[] = [
    {
      key: "class_name",
      header: "Object Class",
      render: (item) => (
        <div className="flex items-center gap-2">
          <Tag size={14} className="text-[var(--color-accent-indigo)]" />
          <span className="font-semibold text-[var(--color-text-heading)] capitalize">
            {item.class_name}
          </span>
        </div>
      ),
    },
    {
      key: "confidence",
      header: "Model Confidence",
      render: (item) => (
        <span className="font-mono text-xs text-[var(--color-text-secondary)]">
          {Math.round((item.confidence || 0.9) * 100)}%
        </span>
      ),
    },
    {
      key: "centroid",
      header: "Position (X, Y)",
      render: (item) => (
        <span className="font-mono text-xs text-[var(--color-text-muted)]">
          X: {Math.round(item.centroid_x || 0)}, Y: {Math.round(item.centroid_y || 0)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[var(--color-text-heading)]">
            AI Perception & Detections
          </h1>
          <p className="text-xs text-[var(--color-text-secondary)]">
            Review computer vision detections, OCR sign text, and spatial anchors.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-56">
            <Select
              options={sessions.map((s) => ({
                label: `Session #${s.id} (Floor ${s.floor_id})`,
                value: s.id,
              }))}
              value={selectedSessionId || ""}
              onChange={(e) => setSelectedSessionId(Number(e.target.value))}
            />
          </div>
          {activeTab === "ocr" && (
            <Button
              onClick={handleAcceptAllOCR}
              icon={<CheckCheck size={16} />}
            >
              Accept All OCR
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[var(--color-border-subtle)] gap-4 text-xs font-semibold">
        <button
          onClick={() => setActiveTab("ocr")}
          className={`pb-3 border-b-2 transition-colors cursor-pointer ${
            activeTab === "ocr"
              ? "border-[var(--color-accent-primary)] text-[var(--color-accent-primary)]"
              : "border-transparent text-[var(--color-text-secondary)] hover:text-white"
          }`}
        >
          OCR Text Signage ({ocrList.length})
        </button>
        <button
          onClick={() => setActiveTab("objects")}
          className={`pb-3 border-b-2 transition-colors cursor-pointer ${
            activeTab === "objects"
              ? "border-[var(--color-accent-primary)] text-[var(--color-accent-primary)]"
              : "border-transparent text-[var(--color-text-secondary)] hover:text-white"
          }`}
        >
          Perceived Landmarks & Doors ({objects.length})
        </button>
      </div>

      {activeTab === "ocr" ? (
        <Table
          columns={ocrColumns}
          data={ocrList}
          emptyMessage={
            loading ? "Loading OCR data..." : "No OCR signage detected in this session."
          }
        />
      ) : (
        <Table
          columns={objectColumns}
          data={objects}
          emptyMessage={
            loading ? "Loading objects..." : "No objects detected in this session."
          }
        />
      )}
    </div>
  );
}
