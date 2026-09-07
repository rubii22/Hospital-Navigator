"use client";

import React, { useEffect, useState } from "react";
import { Plus, History, CheckCircle2 } from "lucide-react";
import { Table, Column } from "../../src/components/ui/Table";
import { Button } from "../../src/components/ui/Button";
import { Input } from "../../src/components/ui/Input";
import { Select } from "../../src/components/ui/Select";
import { Badge } from "../../src/components/ui/Badge";
import { Modal } from "../../src/components/ui/Modal";
import { HospitalApi } from "../../src/api/hospital.api";
import { VersionsApi } from "../../src/api/versions.api";
import { Hospital, Building, MapVersion } from "../../src/api/types";

export default function MapVersionsPage() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [selectedHospitalId, setSelectedHospitalId] = useState<number | null>(null);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [selectedBuildingId, setSelectedBuildingId] = useState<number | null>(null);
  const [versions, setVersions] = useState<MapVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    version_number: "1.0.0",
    release_notes: "",
    status: "draft",
  });

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const data = await HospitalApi.getHospitals();
        setHospitals(data);
        if (data.length > 0) setSelectedHospitalId(data[0].id);
      } catch {
        setHospitals([]);
      }
    };
    fetchHospitals();
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

  const fetchVersions = async (buildingId?: number) => {
    try {
      setLoading(true);
      const data = await VersionsApi.getVersions(buildingId);
      setVersions(data);
    } catch {
      setVersions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedBuildingId) {
      fetchVersions(selectedBuildingId);
    }
  }, [selectedBuildingId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBuildingId) return;
    try {
      await VersionsApi.createVersion({
        building_id: selectedBuildingId,
        version_number: formData.version_number,
        release_notes: formData.release_notes,
        status: formData.status,
      });
      setIsModalOpen(false);
      setFormData({ version_number: "1.0.0", release_notes: "", status: "draft" });
      fetchVersions(selectedBuildingId);
    } catch (err: any) {
      alert(err?.message || "Failed to create version");
    }
  };

  const handlePublish = async (id: number) => {
    try {
      await VersionsApi.publishVersion(id);
      alert("Map version published successfully!");
      if (selectedBuildingId) fetchVersions(selectedBuildingId);
    } catch (err: any) {
      alert(err?.message || "Failed to publish version");
    }
  };

  const columns: Column<MapVersion>[] = [
    {
      key: "version_number",
      header: "Version",
      render: (item) => (
        <div className="flex items-center gap-2">
          <History size={14} className="text-[var(--color-accent-primary)]" />
          <span className="font-mono font-bold text-xs text-[var(--color-text-heading)]">
            v{item.version_number}
          </span>
        </div>
      ),
    },
    {
      key: "release_notes",
      header: "Release Notes",
      render: (item) => (
        <span className="text-xs text-[var(--color-text-secondary)]">
          {item.release_notes || "Routine navigation update"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (item) => {
        const variant =
          item.status === "published"
            ? "active"
            : item.status === "in_review"
            ? "warning"
            : "draft";
        return <Badge variant={variant}>{item.status}</Badge>;
      },
    },
    {
      key: "created_at",
      header: "Created At",
      render: (item) => (
        <span className="text-xs text-[var(--color-text-muted)]">
          {item.created_at ? new Date(item.created_at).toLocaleDateString() : "-"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (item) => (
        <div className="flex items-center justify-end gap-2">
          {item.status !== "published" && (
            <Button
              size="sm"
              onClick={() => handlePublish(item.id)}
              icon={<CheckCircle2 size={13} />}
            >
              Publish
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[var(--color-text-heading)]">
            Map Versions & Releases
          </h1>
          <p className="text-xs text-[var(--color-text-secondary)]">
            Manage semantic versions, changelogs, and published map releases.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-48">
            <Select
              options={buildings.map((b) => ({ label: b.name, value: b.id }))}
              value={selectedBuildingId || ""}
              onChange={(e) => setSelectedBuildingId(Number(e.target.value))}
            />
          </div>
          <Button onClick={() => setIsModalOpen(true)} icon={<Plus size={16} />}>
            Create New Version
          </Button>
        </div>
      </div>

      <Table
        columns={columns}
        data={versions}
        emptyMessage={
          loading ? "Loading versions..." : "No map versions published for this building."
        }
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Map Version"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Version Number"
            required
            value={formData.version_number}
            onChange={(e) =>
              setFormData({ ...formData, version_number: e.target.value })
            }
            placeholder="e.g. 2.4.1"
          />
          <Input
            label="Release Notes / Summary"
            value={formData.release_notes}
            onChange={(e) =>
              setFormData({ ...formData, release_notes: e.target.value })
            }
            placeholder="e.g. Added Radiology 2nd floor nodes and corrected entrance coordinates"
          />
          <div className="flex justify-end gap-2 pt-3 border-t border-[var(--color-border-subtle)]">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Create Version</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
