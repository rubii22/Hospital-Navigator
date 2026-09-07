"use client";

import React, { useEffect, useState } from "react";
import { ScrollText, Search, Clock } from "lucide-react";
import { Table, Column } from "../../src/components/ui/Table";
import { Input } from "../../src/components/ui/Input";
import { Badge } from "../../src/components/ui/Badge";
import { AnalyticsApi } from "../../src/api/analytics.api";
import { ActivityLog } from "../../src/api/types";

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const data = await AnalyticsApi.getActivityLogs();
        setLogs(data);
      } catch {
        setLogs([]);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const filtered = logs.filter(
    (l) =>
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.entity_name.toLowerCase().includes(search.toLowerCase())
  );

  const columns: Column<ActivityLog>[] = [
    {
      key: "id",
      header: "Log ID",
      render: (item) => (
        <span className="font-mono text-xs text-[var(--color-accent-cyan)]">
          LOG-{item.id.toString().padStart(4, "0")}
        </span>
      ),
    },
    {
      key: "action",
      header: "Action Performed",
      render: (item) => (
        <div className="flex items-center gap-2">
          <Clock size={13} className="text-[var(--color-text-muted)]" />
          <span className="font-semibold text-[var(--color-text-heading)]">
            {item.action}
          </span>
        </div>
      ),
    },
    {
      key: "entity_name",
      header: "Entity Affected",
      render: (item) => (
        <Badge variant="neutral" size="sm">
          {item.entity_name} #{item.entity_id ?? ""}
        </Badge>
      ),
    },
    {
      key: "created_at",
      header: "Timestamp",
      render: (item) => (
        <span className="text-xs text-[var(--color-text-muted)] font-mono">
          {item.created_at ? new Date(item.created_at).toLocaleString() : "-"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[var(--color-text-heading)]">
            Activity & Audit Logs
          </h1>
          <p className="text-xs text-[var(--color-text-secondary)]">
            Immutable tracking of map changes, version releases, and administrative operations.
          </p>
        </div>
      </div>

      <div className="w-full max-w-sm">
        <Input
          placeholder="Search activity logs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={<Search size={14} />}
        />
      </div>

      <Table
        columns={columns}
        data={filtered}
        emptyMessage={loading ? "Loading audit logs..." : "No activity logs recorded."}
      />
    </div>
  );
}
