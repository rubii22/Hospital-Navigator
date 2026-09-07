"use client";

import React, { useEffect, useState } from "react";
import {
  Hospital as HospitalIcon,
  History,
  Package,
  Cpu,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";
import { StatCard } from "../src/components/ui/StatCard";
import { Card } from "../src/components/ui/Card";
import { Badge } from "../src/components/ui/Badge";
import { Table, Column } from "../src/components/ui/Table";
import { AnalyticsApi } from "../src/api/analytics.api";
import { DashboardStats, MappingJob } from "../src/api/types";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await AnalyticsApi.getDashboardStats();
        setStats(data);
      } catch {
        setStats(null);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const jobColumns: Column<MappingJob>[] = [
    { key: "id", header: "Job ID" },
    {
      key: "floor_id",
      header: "Floor",
      render: (item) => `Floor ${item.floor_id}`,
    },
    {
      key: "status",
      header: "Status",
      render: (item) => {
        const variant =
          item.status === "completed"
            ? "active"
            : item.status === "failed"
              ? "danger"
              : "warning";
        return <Badge variant={variant}>{item.status}</Badge>;
      },
    },
    {
      key: "progress",
      header: "Progress",
      render: (item) => (
        <div className="flex items-center gap-2 w-full max-w-[120px]">
          <div className="flex-1 bg-[var(--color-bg-surface-hover)] rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full ${
                item.status === "completed"
                  ? "bg-[var(--color-status-active-text)]"
                  : "bg-[var(--color-accent-primary)]"
              }`}
              style={{ width: `${item.progress}%` }}
            />
          </div>
          <span className="font-medium text-[var(--color-text-secondary)] text-xs">
            {item.progress}%
          </span>
        </div>
      ),
    },
    {
      key: "pipeline_stage",
      header: "Stage",
      render: (item) => (
        <span className="text-[var(--color-text-secondary)] text-xs">
          {item.pipeline_stage}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-bold text-[var(--color-text-heading)] text-xl">
          Welcome back, Ali Raza 👋
        </h1>
        <p className="text-[var(--color-text-secondary)] text-xs">
          Here is what is happening across your hospital navigation network.
        </p>
      </div>

      <div className="gap-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Active Hospitals"
          value={stats?.active_hospitals ?? (loading ? "..." : 0)}
          subValue="Multi-hospital network"
          icon={<HospitalIcon size={20} />}
        />
        <StatCard
          label="Map Versions"
          value={stats?.published_versions ?? (loading ? "..." : 0)}
          subValue="Published releases"
          icon={<History size={20} />}
        />
        <StatCard
          label="NAVPACKs"
          value={stats?.navpacks_generated ?? (loading ? "..." : 0)}
          subValue="Offline packages"
          icon={<Package size={20} />}
        />
        <StatCard
          label="Mapping Jobs"
          value={stats?.running_jobs ?? (loading ? "..." : 0)}
          subValue="AI pipeline processes"
          icon={<Cpu size={20} />}
        />
      </div>

      <div className="gap-6 grid grid-cols-1 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          <div className="flex justify-between items-center">
            <h2 className="font-semibold text-[var(--color-text-heading)] text-sm">
              Recent Mapping Jobs
            </h2>
          </div>
          <Table
            columns={jobColumns}
            data={stats?.recent_jobs ?? []}
            emptyMessage={
              loading ? "Loading jobs..." : "No recent mapping jobs"
            }
          />
        </div>

        <div className="space-y-6">
          <Card>
            <h3 className="mb-4 font-semibold text-[var(--color-text-heading)] text-sm">
              Map Publish Overview
            </h3>
            <div className="flex justify-center items-center py-4">
              <div className="relative flex justify-center items-center w-36 h-36">
                <svg
                  className="w-full h-full -rotate-90 transform"
                  viewBox="0 0 36 36"
                >
                  <path
                    className="text-[var(--color-bg-surface-hover)]"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-[var(--color-accent-primary)]"
                    strokeDasharray={`${
                      stats?.publish_breakdown.total
                        ? Math.round(
                            ((stats?.publish_breakdown.published ?? 0) /
                              stats.publish_breakdown.total) *
                              100,
                          )
                        : 0
                    }, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="font-bold text-[var(--color-text-heading)] text-2xl">
                    {stats?.publish_breakdown.total
                      ? Math.round(
                          ((stats?.publish_breakdown.published ?? 0) /
                            stats.publish_breakdown.total) *
                            100,
                        )
                      : 0}
                    %
                  </span>
                  <span className="text-[10px] text-[var(--color-text-muted)] uppercase">
                    Published
                  </span>
                </div>
              </div>
            </div>
            <div className="space-y-2 mt-2 pt-2 border-border-subtle border-t text-xs">
              <div className="flex justify-between text-[var(--color-text-secondary)]">
                <span className="flex items-center gap-1.5">
                  <span className="rounded-full w-2 h-2 bg-[var(--color-accent-primary)]" />
                  Published
                </span>
                <span className="font-semibold text-[var(--color-text-primary)]">
                  {stats?.publish_breakdown.published ?? 0}
                </span>
              </div>
              <div className="flex justify-between text-[var(--color-text-secondary)]">
                <span className="flex items-center gap-1.5">
                  <span className="bg-[var(--color-status-warning-text)] rounded-full w-2 h-2" />
                  In Review
                </span>
                <span className="font-semibold text-[var(--color-text-primary)]">
                  {stats?.publish_breakdown.in_review ?? 0}
                </span>
              </div>
              <div className="flex justify-between text-[var(--color-text-secondary)]">
                <span className="flex items-center gap-1.5">
                  <span className="rounded-full w-2 h-2 bg-[var(--color-text-muted)]" />
                  Draft
                </span>
                <span className="font-semibold text-[var(--color-text-primary)]">
                  {stats?.publish_breakdown.draft ?? 0}
                </span>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="mb-3 font-semibold text-[var(--color-text-heading)] text-sm">
              Recent Activities
            </h3>
            <div className="space-y-3">
              {(stats?.recent_activities ?? []).length === 0 ? (
                <p className="py-4 text-[var(--color-text-muted)] text-xs text-center">
                  No recent activities recorded.
                </p>
              ) : (
                stats?.recent_activities.map((act) => (
                  <div
                    key={act.id}
                    className="flex items-start gap-2.5 text-xs"
                  >
                    <div className="bg-[var(--color-bg-surface)] mt-0.5 p-1 rounded-md text-[var(--color-accent-primary)] shrink-0">
                      <Clock size={12} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[var(--color-text-primary)] leading-tight">
                        {act.action}
                      </p>
                      <span className="text-[10px] text-[var(--color-text-muted)]">
                        {act.entity}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
