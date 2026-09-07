"use client";

import React, { useEffect, useState } from "react";
import { Plus, Search, Edit2, Trash2, Hospital as HospitalIcon } from "lucide-react";
import { Table, Column } from "../../src/components/ui/Table";
import { Button } from "../../src/components/ui/Button";
import { Input } from "../../src/components/ui/Input";
import { Badge } from "../../src/components/ui/Badge";
import { Modal } from "../../src/components/ui/Modal";
import { HospitalApi } from "../../src/api/hospital.api";
import { Hospital } from "../../src/api/types";

export default function HospitalsPage() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHospital, setEditingHospital] = useState<Hospital | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    address: "",
    phone: "",
    email: "",
    status: "active",
  });

  const fetchHospitals = async () => {
    try {
      setLoading(true);
      const data = await HospitalApi.getHospitals();
      setHospitals(data);
    } catch {
      setHospitals([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitals();
  }, []);

  const handleOpenCreate = () => {
    setEditingHospital(null);
    setFormData({
      name: "",
      code: "",
      address: "",
      phone: "",
      email: "",
      status: "active",
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (h: Hospital) => {
    setEditingHospital(h);
    setFormData({
      name: h.name,
      code: h.code,
      address: h.address || "",
      phone: h.phone || "",
      email: h.email || "",
      status: h.status || "active",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingHospital) {
        await HospitalApi.updateHospital(editingHospital.id, formData);
      } else {
        await HospitalApi.createHospital(formData);
      }
      setIsModalOpen(false);
      fetchHospitals();
    } catch (err: any) {
      alert(err?.message || "Failed to save hospital");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this hospital?")) return;
    try {
      await HospitalApi.deleteHospital(id);
      fetchHospitals();
    } catch (err: any) {
      alert(err?.message || "Failed to delete hospital");
    }
  };

  const filteredHospitals = hospitals.filter(
    (h) =>
      h.name.toLowerCase().includes(search.toLowerCase()) ||
      h.code.toLowerCase().includes(search.toLowerCase())
  );

  const columns: Column<Hospital>[] = [
    {
      key: "name",
      header: "Name",
      render: (item) => (
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[var(--color-bg-surface)] text-[var(--color-accent-primary)] flex items-center justify-center shrink-0">
            <HospitalIcon size={14} />
          </div>
          <div>
            <div className="font-semibold text-[var(--color-text-heading)]">
              {item.name}
            </div>
            <div className="text-xs text-[var(--color-text-muted)]">
              {item.address || "No address specified"}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "code",
      header: "Code",
      render: (item) => (
        <span className="font-mono text-xs text-[var(--color-text-secondary)]">
          {item.code}
        </span>
      ),
    },
    {
      key: "phone",
      header: "Contact",
      render: (item) => (
        <span className="text-xs text-[var(--color-text-secondary)]">
          {item.phone || item.email || "-"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (item) => (
        <Badge variant={item.status === "active" ? "active" : "draft"}>
          {item.status}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (item) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleOpenEdit(item);
            }}
            className="p-1.5 rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-surface-hover)] transition-colors cursor-pointer"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(item.id);
            }}
            className="p-1.5 rounded-lg text-[var(--color-status-danger-text)] hover:bg-[var(--color-status-danger-bg)] transition-colors cursor-pointer"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[var(--color-text-heading)]">
            Hospitals
          </h1>
          <p className="text-xs text-[var(--color-text-secondary)]">
            Manage all hospitals in the system.
          </p>
        </div>
        <Button onClick={handleOpenCreate} icon={<Plus size={16} />}>
          Add Hospital
        </Button>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="w-full max-w-sm">
          <Input
            placeholder="Search hospitals by name or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search size={14} />}
          />
        </div>
      </div>

      <Table
        columns={columns}
        data={filteredHospitals}
        emptyMessage={loading ? "Loading hospitals..." : "No hospitals found."}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingHospital ? "Edit Hospital" : "Add Hospital"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Hospital Name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. City General Hospital"
          />
          <Input
            label="Hospital Code"
            required
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            placeholder="e.g. PK-CGH-01"
          />
          <Input
            label="Address"
            value={formData.address}
            onChange={(e) =>
              setFormData({ ...formData, address: e.target.value })
            }
            placeholder="e.g. Main Boulevard, Lahore"
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Phone"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              placeholder="+92 42 111 222 333"
            />
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="contact@hospital.org"
            />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-[var(--color-border-subtle)]">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {editingHospital ? "Save Changes" : "Create Hospital"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
