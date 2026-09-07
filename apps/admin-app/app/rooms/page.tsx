"use client";

import React, { useEffect, useState } from "react";
import { Plus, Search, DoorOpen } from "lucide-react";
import { Table, Column } from "../../src/components/ui/Table";
import { Button } from "../../src/components/ui/Button";
import { Input } from "../../src/components/ui/Input";
import { Select } from "../../src/components/ui/Select";
import { Badge } from "../../src/components/ui/Badge";
import { Modal } from "../../src/components/ui/Modal";
import { Breadcrumbs } from "../../src/components/ui/Breadcrumbs";
import { HospitalApi } from "../../src/api/hospital.api";
import { Hospital, Building, Floor, Room } from "../../src/api/types";

export default function RoomsPage() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [selectedHospitalId, setSelectedHospitalId] = useState<number | null>(null);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [selectedBuildingId, setSelectedBuildingId] = useState<number | null>(null);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [selectedFloorId, setSelectedFloorId] = useState<number | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    room_number: "",
    room_type: "general",
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

  const fetchRooms = async (floorId: number) => {
    try {
      setLoading(true);
      const data = await HospitalApi.getRooms(floorId);
      setRooms(data);
    } catch {
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedFloorId) {
      fetchRooms(selectedFloorId);
    }
  }, [selectedFloorId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFloorId) return;
    try {
      await HospitalApi.createRoom(selectedFloorId, formData);
      setIsModalOpen(false);
      setFormData({ name: "", room_number: "", room_type: "general", status: "active" });
      fetchRooms(selectedFloorId);
    } catch (err: any) {
      alert(err?.message || "Failed to create room");
    }
  };

  const currentHospital = hospitals.find((h) => h.id === selectedHospitalId);
  const currentBuilding = buildings.find((b) => b.id === selectedBuildingId);
  const currentFloor = floors.find((f) => f.id === selectedFloorId);

  const filtered = rooms.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      (r.room_number && r.room_number.toLowerCase().includes(search.toLowerCase()))
  );

  const columns: Column<Room>[] = [
    {
      key: "room_number",
      header: "Room No.",
      render: (item) => (
        <span className="font-mono font-bold text-xs text-[var(--color-accent-cyan)]">
          {item.room_number || `#${item.id}`}
        </span>
      ),
    },
    {
      key: "name",
      header: "Room Name",
      render: (item) => (
        <div className="flex items-center gap-2">
          <DoorOpen size={14} className="text-[var(--color-text-muted)]" />
          <span className="font-semibold text-[var(--color-text-heading)]">
            {item.name}
          </span>
        </div>
      ),
    },
    {
      key: "room_type",
      header: "Type",
      render: (item) => (
        <Badge variant="primary" size="sm">
          {item.room_type}
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
  ];

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Hospitals", href: "/hospitals" },
          { label: currentHospital?.name || "Hospital" },
          { label: currentBuilding?.name || "Building" },
          { label: currentFloor?.name || "Floor" },
          { label: "Rooms" },
        ]}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[var(--color-text-heading)]">
            Rooms
          </h1>
          <p className="text-xs text-[var(--color-text-secondary)]">
            Manage wards, examination chambers, labs, and office spaces.
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
            Add Room
          </Button>
        </div>
      </div>

      <div className="w-full max-w-sm">
        <Input
          placeholder="Search rooms..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={<Search size={14} />}
        />
      </div>

      <Table
        columns={columns}
        data={filtered}
        emptyMessage={loading ? "Loading rooms..." : "No rooms found on this floor."}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Room"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Room Name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Echo Room / Consultation 1"
          />
          <Input
            label="Room Number / Identifier"
            value={formData.room_number}
            onChange={(e) =>
              setFormData({ ...formData, room_number: e.target.value })
            }
            placeholder="e.g. 102"
          />
          <Select
            label="Room Type"
            value={formData.room_type}
            onChange={(e) =>
              setFormData({ ...formData, room_type: e.target.value })
            }
            options={[
              { label: "General", value: "general" },
              { label: "Consultation Room", value: "consultation" },
              { label: "Procedure Room", value: "procedure" },
              { label: "Waiting Area", value: "waiting_room" },
              { label: "Pharmacy", value: "pharmacy" },
              { label: "ICU / Emergency", value: "icu" },
              { label: "Washroom", value: "washroom" },
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
            <Button type="submit">Create Room</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
