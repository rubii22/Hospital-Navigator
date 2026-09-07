"use client";

import React, { useEffect, useState } from "react";
import { Plus, Layers, DoorOpen, MapPin, GitBranch, Map } from "lucide-react";
import { Button } from "../../src/components/ui/Button";
import { Input } from "../../src/components/ui/Input";
import { Select } from "../../src/components/ui/Select";
import { Badge } from "../../src/components/ui/Badge";
import { Modal } from "../../src/components/ui/Modal";
import { Breadcrumbs } from "../../src/components/ui/Breadcrumbs";
import { HospitalApi } from "../../src/api/hospital.api";
import { POIApi } from "../../src/api/poi.api";
import {
  Hospital,
  Building,
  Floor,
  Room,
  PointOfInterest,
} from "../../src/api/types";

export default function FloorsPage() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [selectedHospitalId, setSelectedHospitalId] = useState<number | null>(
    null,
  );
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [selectedBuildingId, setSelectedBuildingId] = useState<number | null>(
    null,
  );
  const [floors, setFloors] = useState<Floor[]>([]);
  const [selectedFloorId, setSelectedFloorId] = useState<number | null>(null);

  const [rooms, setRooms] = useState<Room[]>([]);
  const [pois, setPois] = useState<PointOfInterest[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    floor_number: 0,
    display_name: "",
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

  useEffect(() => {
    if (!selectedFloorId) return;
    const fetchDetails = async () => {
      try {
        const [roomsData, poisData] = await Promise.all([
          HospitalApi.getRooms(selectedFloorId),
          POIApi.getPOIsByFloor(selectedFloorId),
        ]);
        setRooms(roomsData);
        setPois(poisData);
      } catch {
        setRooms([]);
        setPois([]);
      }
    };
    fetchDetails();
  }, [selectedFloorId]);

  const handleCreateFloor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBuildingId) return;
    try {
      await HospitalApi.createFloor(selectedBuildingId, formData);
      setIsModalOpen(false);
      setFormData({ name: "", floor_number: 0, display_name: "" });
      const updatedFloors = await HospitalApi.getFloors(selectedBuildingId);
      setFloors(updatedFloors);
    } catch (err: any) {
      alert(err?.message || "Failed to create floor");
    }
  };

  const currentHospital = hospitals.find((h) => h.id === selectedHospitalId);
  const currentBuilding = buildings.find((b) => b.id === selectedBuildingId);
  const currentFloor = floors.find((f) => f.id === selectedFloorId);

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Hospitals", href: "/hospitals" },
          { label: currentHospital?.name || "Hospital" },
          { label: currentBuilding?.name || "Building" },
          { label: "Floors" },
        ]}
      />

      <div className="flex sm:flex-row flex-col justify-between sm:items-center gap-4">
        <div>
          <h1 className="font-bold text-[var(--color-text-heading)] text-xl">
            Floors & Layout
          </h1>
          <p className="text-[var(--color-text-secondary)] text-xs">
            Inspect floor layouts, spatial assets, and indoor elements.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-48">
            <Select
              options={hospitals.map((h) => ({ label: h.name, value: h.id }))}
              value={selectedHospitalId || ""}
              onChange={(e) => setSelectedHospitalId(Number(e.target.value))}
            />
          </div>
          <div className="w-48">
            <Select
              options={buildings.map((b) => ({ label: b.name, value: b.id }))}
              value={selectedBuildingId || ""}
              onChange={(e) => setSelectedBuildingId(Number(e.target.value))}
            />
          </div>
          <Button
            onClick={() => setIsModalOpen(true)}
            icon={<Plus size={16} />}
          >
            Add Floor
          </Button>
        </div>
      </div>

      <div className="gap-6 grid grid-cols-1 lg:grid-cols-12">
        {/* Left Vertical Floor Selector */}
        <div className="space-y-2 lg:col-span-3 bg-[var(--color-bg-card)] p-3 border border-border-subtle rounded-xl">
          <div className="px-2 py-1 font-semibold text-[var(--color-text-secondary)] text-xs uppercase">
            Floor Levels
          </div>
          <div className="space-y-1.5">
            {floors.map((fl) => {
              const isSelected = fl.id === selectedFloorId;
              return (
                <button
                  key={fl.id}
                  onClick={() => setSelectedFloorId(fl.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-[var(--color-accent-primary)] text-white shadow-sm"
                      : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-surface)] hover:text-[var(--color-text-primary)]"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs ${
                        isSelected
                          ? "bg-white text-[var(--color-accent-primary)]"
                          : "bg-[var(--color-bg-surface)] text-[var(--color-text-primary)]"
                      }`}
                    >
                      {fl.display_name || fl.floor_number}
                    </span>
                    <span className="truncate">{fl.name}</span>
                  </div>
                  <Badge variant={isSelected ? "neutral" : "draft"} size="sm">
                    L{fl.floor_number}
                  </Badge>
                </button>
              );
            })}
          </div>
        </div>

        {/* Center Plan Viewer */}
        <div className="flex flex-col justify-center items-center lg:col-span-6 bg-[var(--color-bg-card)] p-4 border border-border-subtle rounded-xl min-h-[400px]">
          <div className="relative flex justify-center items-center bg-[var(--color-bg-app)] border border-border-subtle rounded-lg w-full h-full min-h-[380px] overflow-hidden">
            {/* Grid Pattern Background */}
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  "radial-gradient(circle, var(--border-medium) 1px, transparent 1px)",
                backgroundSize: "24px 24px",
              }}
            />
            <div className="z-10 flex flex-col items-center p-6 text-center">
              <Map
                size={48}
                className="opacity-80 mb-3 text-[var(--color-accent-primary)]"
              />
              <h4 className="font-semibold text-[var(--color-text-heading)] text-sm">
                {currentFloor?.name || "Floor Plan"}
              </h4>
              <p className="mt-1 max-w-xs text-[var(--color-text-muted)] text-xs">
                Level {currentFloor?.floor_number ?? 0} active spatial layer for
                navigation
              </p>
            </div>
          </div>
        </div>

        {/* Right Stats Column */}
        <div className="space-y-3 lg:col-span-3">
          <div className="space-y-4 bg-[var(--color-bg-card)] p-4 border border-border-subtle rounded-xl">
            <h3 className="font-semibold text-[var(--color-text-secondary)] text-xs uppercase">
              Floor Summary
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center bg-[var(--color-bg-surface)] p-2.5 border border-border-subtle rounded-lg">
                <span className="flex items-center gap-2 text-[var(--color-text-secondary)]">
                  <DoorOpen
                    size={14}
                    className="text-[var(--color-accent-cyan)]"
                  />{" "}
                  Rooms
                </span>
                <span className="font-bold text-[var(--color-text-primary)]">
                  {rooms.length}
                </span>
              </div>
              <div className="flex justify-between items-center bg-[var(--color-bg-surface)] p-2.5 border border-border-subtle rounded-lg">
                <span className="flex items-center gap-2 text-[var(--color-text-secondary)]">
                  <MapPin
                    size={14}
                    className="text-[var(--color-accent-indigo)]"
                  />{" "}
                  POIs
                </span>
                <span className="font-bold text-[var(--color-text-primary)]">
                  {pois.length}
                </span>
              </div>
              <div className="flex justify-between items-center bg-[var(--color-bg-surface)] p-2.5 border border-border-subtle rounded-lg">
                <span className="flex items-center gap-2 text-[var(--color-text-secondary)]">
                  <Layers
                    size={14}
                    className="text-[var(--color-status-active-text)]"
                  />{" "}
                  Level
                </span>
                <span className="font-bold text-[var(--color-text-primary)]">
                  {currentFloor?.floor_number ?? 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Floor"
      >
        <form onSubmit={handleCreateFloor} className="space-y-4">
          <Input
            label="Floor Name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Ground Floor"
          />
          <div className="gap-3 grid grid-cols-2">
            <Input
              label="Floor Number"
              type="number"
              required
              value={formData.floor_number}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  floor_number: parseInt(e.target.value) || 0,
                })
              }
            />
            <Input
              label="Display Label"
              value={formData.display_name}
              onChange={(e) =>
                setFormData({ ...formData, display_name: e.target.value })
              }
              placeholder="e.g. G or 1"
            />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-border-subtle border-t">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Create Floor</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
