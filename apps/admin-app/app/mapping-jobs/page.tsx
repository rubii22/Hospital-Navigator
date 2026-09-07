"use client";

import React, { useEffect, useState } from "react";
import { Cpu, Search, Play, Eye } from "lucide-react";
import Link from "next/link";
import { Table, Column } from "../../src/components/ui/Table";
import { Button } from "../../src/components/ui/Button";
import { Input } from "../../src/components/ui/Input";
import { Badge } from "../../src/components/ui/Badge";
import { JobsApi } from "../../src/api/jobs.api";
import { MappingSession } from "../../src/api/types";

export default function MappingJobsPage() {
  const [sessions, setSessions] = useState<MappingSession[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const data = await JobsApi.getSessions();
      setSessions(data);
    } catch {
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleStartProcess = async (id: number) => {
    try {
      await JobsApi.startProcessing(id);
      alert("AI pipeline job launched successfully!");
      fetchSessions();
    } catch (err: any) {
      alert(err?.message || "Failed to start processing");
    }
  };

  const filtered = sessions.filter((s) =>
    `JOB-${s.id}`.toLowerCase().includes(search.toLowerCase())
  );

  const columns: Column<MappingSession>[] = [
    {
      key: "id",
      header: "Session ID",
      render: (item) => (
        <span className="font-mono font-bold text-xs text-[var(--color-accent-cyan)]">
          JOB-{item.id.toString().padStart(4, "0")}
        </span>
      ),
    },
    {
      key: "floor_id",
      header: "Floor Level",
      render: (item) => `Floor ${item.floor_id}`,
    },
    {
      key: "total_frames",
      header: "Captured Frames",
      render: (item) => (
        <span className="font-mono text-xs text-[var(--color-text-secondary)]">
          {item.total_frames} frames
        </span>
      ),
    },
    {
      key: "capture_type",
      header: "Capture Mode",
      render: (item) => (
        <span className="text-xs text-[var(--color-text-secondary)] capitalize">
          {item.capture_type || "video"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (item) => {
        const variant =
          item.status === "completed"
            ? "active"
            : item.status === "processing"
            ? "warning"
            : "draft";
        return <Badge variant={variant}>{item.status}</Badge>;
      },
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (item) => (
        <div className="flex items-center justify-end gap-2">
          {item.status !== "completed" && item.status !== "processing" && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleStartProcess(item.id)}
              icon={<Play size={13} />}
            >
              Process AI
            </Button>
          )}
          <Link href={`/ai-results?session_id=${item.id}`}>
            <Button size="sm" variant="secondary" icon={<Eye size={13} />}>
              View Detections
            </Button>
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[var(--color-text-heading)]">
            Mapping Jobs
          </h1>
          <p className="text-xs text-[var(--color-text-secondary)]">
            Monitor mobile video scans, perception pipelines, and AI processing queues.
          </p>
        </div>
      </div>

      <div className="w-full max-w-sm">
        <Input
          placeholder="Search jobs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={<Search size={14} />}
        />
      </div>

      <Table
        columns={columns}
        data={filtered}
        emptyMessage={
          loading ? "Loading scan sessions..." : "No scanning sessions found."
        }
      />
    </div>
  );
}
