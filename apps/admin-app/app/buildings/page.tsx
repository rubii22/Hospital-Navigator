"use client";

import React, { useEffect, useState } from "react";
import { Plus, Building2, Layers } from "lucide-react";
import { Button } from "../../src/components/ui/Button";
import { Input } from "../../src/components/ui/Input";
import { Select } from "../../src/components/ui/Select";
import { Badge } from "../../src/components/ui/Badge";
import { Modal } from "../../src/components/ui/Modal";
import { Breadcrumbs } from "../../src/components/ui/Breadcrumbs";
import { HospitalApi } from "../../src/api/hospital.api";
import { Hospital, Building } from "../../src/api/types";

export default function BuildingsPage() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [selectedHospitalId, setSelectedHospitalId] = useState<number | null>(
    null,
  );
  const [buildings, setBuildings] = useState<Building[]>([]);
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
        if (data.length > 0) {
          setSelectedHospitalId(data[0].id);
        }
      } catch {
        setHospitals([]);
      } finally {
        setLoading(false);
      }
    };
    fetchHospitals();
  }, []);

  const fetchBuildings = async (hospitalId: number) => {
    try {
      setLoading(true);
      const data = await HospitalApi.getBuildings(hospitalId);
      setBuildings(data);
    } catch {
      setBuildings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedHospitalId) {
      fetchBuildings(selectedHospitalId);
    }
  }, [selectedHospitalId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHospitalId) return;
    try {
      await HospitalApi.createBuilding(selectedHospitalId, formData);
      setIsModalOpen(false);
      setFormData({ name: "", code: "", description: "", status: "active" });
      fetchBuildings(selectedHospitalId);
    } catch (err: any) {
      alert(err?.message || "Failed to create building");
    }
  };

  const currentHospital = hospitals.find((h) => h.id === selectedHospitalId);

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Hospitals", href: "/hospitals" },
          { label: currentHospital?.name || "Selected Hospital" },
          { label: "Buildings" },
        ]}
      />

      <div className="flex sm:flex-row flex-col justify-between sm:items-center gap-4">
        <div>
          <h1 className="font-bold text-[var(--color-text-heading)] text-xl">
            Buildings
          </h1>
          <p className="text-[var(--color-text-secondary)] text-xs">
            Manage buildings and wings of the selected hospital.
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
          <Button
            onClick={() => setIsModalOpen(true)}
            icon={<Plus size={16} />}
          >
            Add Building
          </Button>
        </div>
      </div>

      <div className="gap-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {buildings.map((b) => (
          <div
            key={b.id}
            className="flex flex-col justify-between bg-[var(--color-bg-card)] p-5 border border-border-subtle hover:border-[var(--color-border-medium)] rounded-xl transition-all"
          >
            <div>
              <div className="relative flex justify-center items-center bg-[var(--color-bg-surface)] mb-4 border border-border-subtle rounded-lg w-full h-32 overflow-hidden text-[var(--color-text-muted)]">
                <Building2
                  size={36}
                  className="text-[var(--color-border-medium)]"
                />
                <div className="top-2 right-2 absolute">
                  <Badge variant={b.status === "active" ? "active" : "draft"}>
                    {b.status}
                  </Badge>
                </div>
              </div>
              <h3 className="font-semibold text-[var(--color-text-heading)] text-base">
                {b.name}
              </h3>
              <p className="mt-1 text-[var(--color-text-muted)] text-xs">
                {b.description || "Main complex wing"}
              </p>
            </div>

            <div className="flex justify-between items-center mt-4 pt-4 border-border-subtle border-t text-[var(--color-text-secondary)] text-xs">
              <span className="flex items-center gap-1.5 font-medium">
                <Layers size={13} />{" "}
                {b.floors_count !== undefined
                  ? `${b.floors_count} Floors`
                  : "Building Wing"}
              </span>
              <span className="font-mono text-[10px] text-[var(--color-text-muted)]">
                {b.code || `BLD-${b.id}`}
              </span>
            </div>
          </div>
        ))}

        <div
          onClick={() => setIsModalOpen(true)}
          className="group flex flex-col justify-center items-center hover:bg-[var(--color-bg-card)] p-5 border-2 border-border-subtle hover:border-[var(--color-border-medium)] border-dashed rounded-xl min-h-[200px] transition-all cursor-pointer"
        >
          <div className="flex justify-center items-center bg-[var(--color-bg-surface)] mb-2 rounded-full w-10 h-10 text-[var(--color-text-muted)] group-hover:text-white transition-colors group-hover:bg-[var(--color-accent-primary)]">
            <Plus size={20} />
          </div>
          <span className="font-semibold text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)] text-xs">
            Add New Building
          </span>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Building"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Building Name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Diagnostic & Radiology Complex"
          />
          <Input
            label="Building Code"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            placeholder="e.g. rad"
          />
          <Input
            label="Description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="e.g. Inpatient and surgical wards"
          />
          <div className="flex justify-end gap-2 pt-3 border-border-subtle border-t">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Create Building</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
