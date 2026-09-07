"use client";

import React, { useEffect, useState } from "react";
import { Package, Download, Plus, Search, ShieldCheck } from "lucide-react";
import { Table, Column } from "../../src/components/ui/Table";
import { Button } from "../../src/components/ui/Button";
import { Input } from "../../src/components/ui/Input";
import { Badge } from "../../src/components/ui/Badge";
import { Modal } from "../../src/components/ui/Modal";
import { VersionsApi } from "../../src/api/versions.api";
import { NavPack } from "../../src/api/types";

export default function NavPacksPage() {
  const [navpacks, setNavpacks] = useState<NavPack[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    map_version_id: 1,
    archive_uri: "storage/navpacks/bundle_v1.tar.gz",
    checksum_sha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    total_size_bytes: 148500000,
    min_app_version: "1.0.0",
  });

  const fetchNavPacks = async () => {
    try {
      setLoading(true);
      const data = await VersionsApi.getNavPacks();
      setNavpacks(data);
    } catch {
      setNavpacks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNavPacks();
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await VersionsApi.generateNavPack(formData);
      setIsModalOpen(false);
      fetchNavPacks();
    } catch (err: any) {
      alert(err?.message || "Failed to generate NAVPACK");
    }
  };

  const filtered = navpacks.filter(
    (n) =>
      `PKG-${n.id}`.toLowerCase().includes(search.toLowerCase()) ||
      n.checksum_sha256.toLowerCase().includes(search.toLowerCase())
  );

  const columns: Column<NavPack>[] = [
    {
      key: "id",
      header: "Package ID",
      render: (item) => (
        <div className="flex items-center gap-2">
          <Package size={14} className="text-[var(--color-accent-primary)]" />
          <span className="font-mono font-bold text-xs text-[var(--color-text-heading)]">
            PKG-{item.id.toString().padStart(4, "0")}
          </span>
        </div>
      ),
    },
    {
      key: "checksum_sha256",
      header: "SHA-256 Checksum",
      render: (item) => (
        <span className="font-mono text-xs text-[var(--color-text-secondary)] truncate max-w-[180px] block">
          {item.checksum_sha256.slice(0, 16)}...
        </span>
      ),
    },
    {
      key: "total_size_bytes",
      header: "Package Size",
      render: (item) => (
        <span className="font-mono text-xs text-[var(--color-text-primary)]">
          {(item.total_size_bytes / (1024 * 1024)).toFixed(1)} MB
        </span>
      ),
    },
    {
      key: "min_app_version",
      header: "Min App Version",
      render: (item) => (
        <Badge variant="neutral" size="sm">
          v{item.min_app_version || "1.0.0"}
        </Badge>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: () => <Badge variant="active">Ready</Badge>,
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: () => (
        <Button size="sm" variant="secondary" icon={<Download size={13} />}>
          Download
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[var(--color-text-heading)]">
            NAVPACKs (Offline Map Bundles)
          </h1>
          <p className="text-xs text-[var(--color-text-secondary)]">
            Compressed offline navigation archives, cryptographic signatures, and tile packages.
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} icon={<Plus size={16} />}>
          Generate NAVPACK
        </Button>
      </div>

      <div className="w-full max-w-sm">
        <Input
          placeholder="Search NAVPACKs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={<Search size={14} />}
        />
      </div>

      <Table
        columns={columns}
        data={filtered}
        emptyMessage={
          loading ? "Loading NAVPACKs..." : "No offline NAVPACK packages generated."
        }
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Generate NAVPACK"
      >
        <form onSubmit={handleGenerate} className="space-y-4">
          <Input
            label="Map Version ID"
            type="number"
            required
            value={formData.map_version_id}
            onChange={(e) =>
              setFormData({
                ...formData,
                map_version_id: parseInt(e.target.value) || 1,
              })
            }
          />
          <Input
            label="Min Client App Version"
            value={formData.min_app_version}
            onChange={(e) =>
              setFormData({ ...formData, min_app_version: e.target.value })
            }
            placeholder="e.g. 1.0.0"
          />
          <div className="flex justify-end gap-2 pt-3 border-t border-[var(--color-border-subtle)]">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Build Package</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
