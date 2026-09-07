"use client";

import React, { useEffect, useState } from "react";
import { Plus, Search, MapPin, Trash2 } from "lucide-react";
import { Table, Column } from "../../src/components/ui/Table";
import { Button } from "../../src/components/ui/Button";
import { Input } from "../../src/components/ui/Input";
import { Select } from "../../src/components/ui/Select";
import { Badge } from "../../src/components/ui/Badge";
import { Modal } from "../../src/components/ui/Modal";
import { Breadcrumbs } from "../../src/components/ui/Breadcrumbs";
import { HospitalApi } from "../../src/api/hospital.api";
import { POIApi } from "../../src/api/poi.api";
import { Hospital, Building, Floor, PointOfInterest, POICategory } from "../../src/api/types";

export default function POIsPage() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [selectedHospitalId, setSelectedHospitalId] = useState<number | null>(null);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [selectedBuildingId, setSelectedBuildingId] = useState<number | null>(null);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [selectedFloorId, setSelectedFloorId] = useState<number | null>(null);

  const [pois, setPois] = useState<PointOfInterest[]>([]);
  const [categories, setCategories] = useState<POICategory[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    poi_type: "service",
    category_id: 1,
    is_accessible: true,
  });

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const [hospData, catData] = await Promise.all([
          HospitalApi.getHospitals(),
          POIApi.getCategories(),
        ]);
        setHospitals(hospData);
        setCategories(catData);
        if (hospData.length > 0) setSelectedHospitalId(hospData[0].id);
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
        const data = await HospitalApi.getBuildings(selectedHospitalId);
        setBuildings(data);
        if (data.length > 0) setSelectedBuildingId(data[0].id);
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
        const data = await HospitalApi.getFloors(selectedBuildingId);
        setFloors(data);
        if (data.length > 0) setSelectedFloorId(data[0].id);
      } catch {
        setFloors([]);
      }
    };
    fetchFloors();
  }, [selectedBuildingId]);

  const fetchPOIs = async (floorId: number) => {
    try {
      setLoading(true);
      const data = await POIApi.getPOIsByFloor(floorId);
      setPois(data);
    } catch {
      setPois([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedFloorId) {
      fetchPOIs(selectedFloorId);
    }
  }, [selectedFloorId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHospitalId || !selectedFloorId) return;
    try {
      await POIApi.createPOI({
        ...formData,
        hospital_id: selectedHospitalId,
        building_id: selectedBuildingId,
        floor_id: selectedFloorId,
        status: "active",
        review_state: "approved",
      });
      setIsModalOpen(false);
      setFormData({
        name: "",
        code: "",
        description: "",
        poi_type: "service",
        category_id: categories.length > 0 ? categories[0].id : 1,
        is_accessible: true,
      });
      fetchPOIs(selectedFloorId);
    } catch (err: any) {
      alert(err?.message || "Failed to create POI");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this POI?")) return;
    try {
      await POIApi.deletePOI(id);
      if (selectedFloorId) fetchPOIs(selectedFloorId);
    } catch (err: any) {
      alert(err?.message || "Failed to delete POI");
    }
  };

  const currentHospital = hospitals.find((h) => h.id === selectedHospitalId);
  const currentBuilding = buildings.find((b) => b.id === selectedBuildingId);
  const currentFloor = floors.find((f) => f.id === selectedFloorId);

  const filtered = pois.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const columns: Column<PointOfInterest>[] = [
    {
      key: "name",
      header: "POI Name",
      render: (item) => (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[var(--color-bg-surface)] text-[var(--color-accent-indigo)] flex items-center justify-center">
            <MapPin size={13} />
          </div>
          <span className="font-semibold text-[var(--color-text-heading)]">
            {item.name}
          </span>
        </div>
      ),
    },
    {
      key: "poi_type",
      header: "Type",
      render: (item) => (
        <Badge variant="primary" size="sm">
          {item.poi_type}
        </Badge>
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
        <button
          onClick={() => handleDelete(item.id)}
          className="p-1.5 rounded-lg text-[var(--color-status-danger-text)] hover:bg-[var(--color-status-danger-bg)] transition-colors cursor-pointer"
        >
          <Trash2 size={14} />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Hospitals", href: "/hospitals" },
          { label: currentHospital?.name || "Hospital" },
          { label: currentBuilding?.name || "Building" },
          { label: currentFloor?.name || "Floor" },
          { label: "POIs" },
        ]}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[var(--color-text-heading)]">
            Points of Interest (POIs)
          </h1>
          <p className="text-xs text-[var(--color-text-secondary)]">
            Configure key landmarks, amenities, washrooms, and service desks.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-44">
            <Select
              options={hospitals.map((h) => ({ label: h.name, value: h.id }))}
              value={selectedHospitalId || ""}
              onChange={(e) => setSelectedHospitalId(Number(e.target.value))}
            />
          </div>
          <div className="w-44">
            <Select
              options={floors.map((f) => ({ label: f.name, value: f.id }))}
              value={selectedFloorId || ""}
              onChange={(e) => setSelectedFloorId(Number(e.target.value))}
            />
          </div>
          <Button onClick={() => setIsModalOpen(true)} icon={<Plus size={16} />}>
            Add POI
          </Button>
        </div>
      </div>

      <div className="w-full max-w-sm">
        <Input
          placeholder="Search POIs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={<Search size={14} />}
        />
      </div>

      <Table
        columns={columns}
        data={filtered}
        emptyMessage={loading ? "Loading POIs..." : "No points of interest configured."}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Point of Interest"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="POI Name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Pharmacy / Main Reception"
          />
          <Input
            label="POI Code"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            placeholder="e.g. PHARM-01"
          />
          <Select
            label="POI Type"
            value={formData.poi_type}
            onChange={(e) =>
              setFormData({ ...formData, poi_type: e.target.value })
            }
            options={[
              { label: "Service / Reception", value: "service" },
              { label: "Pharmacy", value: "pharmacy" },
              { label: "Washroom", value: "washroom" },
              { label: "Elevator / Stairs", value: "elevator" },
              { label: "Emergency Exit", value: "exit" },
              { label: "Cafeteria", value: "cafeteria" },
              { label: "ATM / Information", value: "amenity" },
            ]}
          />
          <div className="flex justify-end gap-2 pt-3 border-t border-[var(--color-border-subtle)]">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Create POI</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
