"use client";

import React, { useEffect, useState } from "react";
import { Plus, Layers, Search, Building2 } from "lucide-react";
import { Table, Column } from "../../src/components/ui/Table";
import { Button } from "../../src/components/ui/Button";
import { Input } from "../../src/components/ui/Input";
import { Select } from "../../src/components/ui/Select";
import { Badge } from "../../src/components/ui/Badge";
import { Modal } from "../../src/components/ui/Modal";
import { Breadcrumbs } from "../../src/components/ui/Breadcrumbs";
import { HospitalApi } from "../../src/api/hospital.api";
import { Hospital, Department } from "../../src/api/types";

export default function DepartmentsPage() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [selectedHospitalId, setSelectedHospitalId] = useState<number | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    status: "active",
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

  const fetchDepartments = async (hospitalId: number) => {
    try {
      setLoading(true);
      const data = await HospitalApi.getDepartments(hospitalId);
      setDepartments(data);
    } catch {
      setDepartments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedHospitalId) {
      fetchDepartments(selectedHospitalId);
    }
  }, [selectedHospitalId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHospitalId) return;
    try {
      await HospitalApi.createDepartment(selectedHospitalId, formData);
      setIsModalOpen(false);
      setFormData({ name: "", code: "", description: "", status: "active" });
      fetchDepartments(selectedHospitalId);
    } catch (err: any) {
      alert(err?.message || "Failed to create department");
    }
  };

  const currentHospital = hospitals.find((h) => h.id === selectedHospitalId);

  const filtered = departments.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      (d.code && d.code.toLowerCase().includes(search.toLowerCase()))
  );

  const columns: Column<Department>[] = [
    {
      key: "name",
      header: "Department Name",
      render: (item) => (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[var(--color-bg-surface)] text-[var(--color-accent-indigo)] flex items-center justify-center text-xs font-semibold">
            <Layers size={13} />
          </div>
          <div>
            <div className="font-semibold text-[var(--color-text-heading)]">
              {item.name}
            </div>
            <div className="text-xs text-[var(--color-text-muted)]">
              {item.description || "Medical department"}
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
          {item.code || "-"}
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
  ];

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Hospitals", href: "/hospitals" },
          { label: currentHospital?.name || "Hospital" },
          { label: "Departments" },
        ]}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[var(--color-text-heading)]">
            Departments
          </h1>
          <p className="text-xs text-[var(--color-text-secondary)]">
            Organize clinical, diagnostic, and administrative units.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-56">
            <Select
              options={hospitals.map((h) => ({ label: h.name, value: h.id }))}
              value={selectedHospitalId || ""}
              onChange={(e) => setSelectedHospitalId(Number(e.target.value))}
            />
          </div>
          <Button onClick={() => setIsModalOpen(true)} icon={<Plus size={16} />}>
            Add Department
          </Button>
        </div>
      </div>

      <div className="w-full max-w-sm">
        <Input
          placeholder="Search departments..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={<Search size={14} />}
        />
      </div>

      <Table
        columns={columns}
        data={filtered}
        emptyMessage={
          loading ? "Loading departments..." : "No departments found."
        }
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Department"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Department Name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Cardiology OPD"
          />
          <Input
            label="Code"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            placeholder="e.g. CARDIO"
          />
          <Input
            label="Description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="e.g. Outpatient cardiac consultations"
          />
          <div className="flex justify-end gap-2 pt-3 border-t border-[var(--color-border-subtle)]">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Create Department</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
