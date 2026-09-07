import React, { createContext, useContext, useState, useEffect } from "react";
import { OCRItem, ScanSession } from "../data/extractor.mock";
import { useAuth } from "./AuthContext";
import { hospitalApi } from "../api/hospital.api";
import { scanApi } from "../api/scan.api";
import {
  HospitalResponse,
  HospitalCreate,
  HospitalUpdate,
  BuildingResponse,
  BuildingCreate,
  FloorResponse,
  FloorCreate,
  RoomResponse,
  DepartmentResponse,
  MappingSessionResponse,
  AIJobResultResponse,
  ObjectDetectionResponse,
  OCRDetectionResponse,
  PointCloudArtifact,
  VectorMapData,
} from "../api/types";

type ExtractorContextType = {
  data: {
    user: {
      name: string;
      activeHospital: string;
      location: string;
    };
    locationTree: any[];
    sessionsHistory: ScanSession[];
    summaryMetrics: {
      coverage: number;
      rating: string;
      distanceWalked: string;
      framesCaptured: number;
      pointsCaptured: string;
      duration: string;
      areasCovered: string;
      quality: string;
    };
    ocrResults: OCRItem[];
  };
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
  sidebarMode: "invisible" | "icons" | "expanded";
  setSidebarMode: (mode: "invisible" | "icons" | "expanded") => void;
  selectedBuilding: string;
  selectedFloor: string;

  setSelectedBuilding: (b: string) => void;
  setSelectedFloor: (f: string) => void;
  ocrItems: OCRItem[];
  toggleOCRItem: (id: string) => void;
  acceptAllOCR: () => void;
  sessions: ScanSession[];
  activeFilter: string;
  setActiveFilter: (filter: string) => void;

  // Real Hospital API integrations
  hospitals: HospitalResponse[];
  myHospitals: HospitalResponse[];
  buildings: BuildingResponse[];
  floors: FloorResponse[];
  rooms: RoomResponse[];
  departments: DepartmentResponse[];
  loading: boolean;
  selectedHospitalId: number | null;
  setSelectedHospitalId: (id: number | null) => void;
  selectedBuildingId: number | null;
  setSelectedBuildingId: (id: number | null) => void;
  selectedFloorId: number | null;
  setSelectedFloorId: (id: number | null) => void;

  fetchHospitals: () => Promise<void>;
  fetchMyHospitals: () => Promise<void>;
  createHospital: (data: HospitalCreate) => Promise<HospitalResponse>;
  updateHospital: (
    id: number,
    data: HospitalUpdate,
  ) => Promise<HospitalResponse>;
  deleteHospital: (id: number) => Promise<void>;
  fetchBuildings: (hospitalId: number) => Promise<void>;
  createBuilding: (
    hospitalId: number,
    data: BuildingCreate,
  ) => Promise<BuildingResponse>;
  fetchFloors: (buildingId: number) => Promise<void>;
  createFloor: (
    buildingId: number,
    data: FloorCreate,
  ) => Promise<FloorResponse>;
  fetchRooms: (floorId: number) => Promise<void>;
  fetchDepartments: (hospitalId: number) => Promise<void>;

  // Real Scan/AI API integrations
  apiSessions: MappingSessionResponse[];
  activeSessionId: number | null;
  setActiveSessionId: (id: number | null) => void;
  activeJobResults: AIJobResultResponse[];
  apiOcrItems: OCRDetectionResponse[];
  apiDetections: ObjectDetectionResponse[];
  apiPointCloud: PointCloudArtifact | null;
  apiMapData: VectorMapData | null;

  fetchSessions: () => Promise<void>;
  createSession: (params: {
    distance_walked?: number;
    duration_seconds?: number;
    frames_count?: number;
    points_captured_count?: number;
    coverage_percentage?: number;
    quality_rating?: string;
  }) => Promise<number>;
  uploadSessionAssets: (sessionId: number) => Promise<void>;
  triggerProcessing: (sessionId: number) => Promise<void>;
  pollJobProgress: (sessionId: number) => Promise<AIJobResultResponse[]>;
  fetchSessionArtifacts: (sessionId: number) => Promise<void>;
  updateOCRItemStatus: (
    ocrId: number,
    status: "accepted" | "rejected" | "pending",
  ) => Promise<void>;
  acceptAllOCRApi: () => Promise<void>;
  saveVectorMapApi: (data: VectorMapData) => Promise<void>;

  summaryMetrics: {
    coverage: number;
    rating: string;
    distanceWalked: string;
    framesCaptured: number;
    pointsCaptured: string;
    duration: string;
    areasCovered: string;
    quality: string;
  };
  capturedFrameBase64: string | null;
  setCapturedFrameBase64: (val: string | null) => void;
  capturedFrames: string[];
  addCapturedFrame: (val: string) => void;
  clearCapturedFrames: () => void;
  setSummaryMetrics: React.Dispatch<
    React.SetStateAction<{
      coverage: number;
      rating: string;
      distanceWalked: string;
      framesCaptured: number;
      pointsCaptured: string;
      duration: string;
      areasCovered: string;
      quality: string;
    }>
  >;
  uploadedSessionIds: number[];
  markSessionUploaded: (id: number) => void;
  syncedSessionIds: number[];
  markSessionSynced: (id: number) => void;
  processedSessionIds: number[];
  markSessionProcessed: (id: number) => void;
};

const ExtractorContext = createContext<ExtractorContextType | null>(null);

export function ExtractorProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [sidebarMode, setSidebarMode] = useState<
    "invisible" | "icons" | "expanded"
  >("icons");
  const [selectedBuilding, setSelectedBuildingState] =
    useState("Main Building");
  const [selectedFloor, setSelectedFloorState] = useState("Floor 1");
  const [ocrItems, setOcrItems] = useState<OCRItem[]>([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [summaryMetrics, setSummaryMetrics] = useState({
    coverage: 0,
    rating: "Medium",
    distanceWalked: "0 m",
    framesCaptured: 0,
    pointsCaptured: "0K",
    duration: "00:00",
    areasCovered: "Incomplete",
    quality: "Medium",
  });

  // Real Hospital API states
  const [hospitals, setHospitals] = useState<HospitalResponse[]>([]);
  const [myHospitals, setMyHospitals] = useState<HospitalResponse[]>([]);

  const [buildings, setBuildings] = useState<BuildingResponse[]>([]);
  const [floors, setFloors] = useState<FloorResponse[]>([]);
  const [rooms, setRooms] = useState<RoomResponse[]>([]);
  const [departments, setDepartments] = useState<DepartmentResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedHospitalId, setSelectedHospitalId] = useState<number | null>(
    null,
  );
  const [selectedBuildingId, setSelectedBuildingId] = useState<number | null>(
    null,
  );
  const [selectedFloorId, setSelectedFloorId] = useState<number | null>(null);

  // Real Scan/AI API states
  const [apiSessions, setApiSessions] = useState<MappingSessionResponse[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<number | null>(null);
  const [activeJobResults, setActiveJobResults] = useState<
    AIJobResultResponse[]
  >([]);
  const [apiOcrItems, setApiOcrItems] = useState<OCRDetectionResponse[]>([]);
  const [apiDetections, setApiDetections] = useState<ObjectDetectionResponse[]>(
    [],
  );
  const [apiPointCloud, setApiPointCloud] = useState<PointCloudArtifact | null>(
    null,
  );
  const [apiMapData, setApiMapData] = useState<VectorMapData | null>(null);
  const [capturedFrameBase64, setCapturedFrameBase64] = useState<string | null>(
    null,
  );
  const [capturedFrames, setCapturedFrames] = useState<string[]>([]);

  const addCapturedFrame = (val: string) => {
    if (!val) return;
    setCapturedFrames((prev) => [...prev, val]);
    setCapturedFrameBase64(val);
  };

  const clearCapturedFrames = () => {
    setCapturedFrames([]);
    setCapturedFrameBase64(null);
  };

  const [uploadedSessionIds, setUploadedSessionIds] = useState<number[]>([]);
  const [syncedSessionIds, setSyncedSessionIds] = useState<number[]>([]);
  const [processedSessionIds, setProcessedSessionIds] = useState<number[]>([]);

  const markSessionUploaded = (id: number) => {
    setUploadedSessionIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const markSessionSynced = (id: number) => {
    setSyncedSessionIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const markSessionProcessed = (id: number) => {
    setProcessedSessionIds((prev) =>
      prev.includes(id) ? prev : [...prev, id],
    );
  };

  const fetchHospitals = async () => {
    setLoading(true);
    try {
      const res = await hospitalApi.listHospitals();
      setHospitals(res);
    } catch (err) {
      console.warn(
        "Failed to fetch hospitals from API, using mock fallback:",
        err,
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchMyHospitals = async () => {
    setLoading(true);
    try {
      const res = await hospitalApi.listMyHospitals();
      setMyHospitals(res);
    } catch (err) {
      console.warn("Failed to fetch my hospitals:", err);
    } finally {
      setLoading(false);
    }
  };

  const createHospital = async (
    data: HospitalCreate,
  ): Promise<HospitalResponse> => {
    setLoading(true);
    try {
      const res = await hospitalApi.createHospital(data);
      await Promise.all([fetchHospitals(), fetchMyHospitals()]);
      return res;
    } finally {
      setLoading(false);
    }
  };

  const updateHospital = async (
    id: number,
    data: HospitalUpdate,
  ): Promise<HospitalResponse> => {
    setLoading(true);
    try {
      const res = await hospitalApi.updateHospital(id, data);
      await Promise.all([fetchHospitals(), fetchMyHospitals()]);
      return res;
    } finally {
      setLoading(false);
    }
  };

  const deleteHospital = async (id: number): Promise<void> => {
    setLoading(true);
    try {
      await hospitalApi.deleteHospital(id);
      await Promise.all([fetchHospitals(), fetchMyHospitals()]);
      if (selectedHospitalId === id) {
        setSelectedHospitalId(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchBuildings = async (hospitalId: number) => {
    setLoading(true);
    try {
      const res = await hospitalApi.listBuildings(hospitalId);
      setBuildings(res);
    } catch (err) {
      console.warn("Failed to fetch buildings for hospital:", hospitalId, err);
    } finally {
      setLoading(false);
    }
  };

  const createBuilding = async (
    hospitalId: number,
    data: BuildingCreate,
  ): Promise<BuildingResponse> => {
    setLoading(true);
    try {
      const res = await hospitalApi.createBuilding(hospitalId, data);
      await fetchBuildings(hospitalId);
      return res;
    } finally {
      setLoading(false);
    }
  };

  const fetchFloors = async (buildingId: number) => {
    setLoading(true);
    try {
      const res = await hospitalApi.listFloors(buildingId);
      setFloors(res);
    } catch (err) {
      console.warn("Failed to fetch floors for building:", buildingId, err);
    } finally {
      setLoading(false);
    }
  };

  const createFloor = async (
    buildingId: number,
    data: FloorCreate,
  ): Promise<FloorResponse> => {
    setLoading(true);
    try {
      const res = await hospitalApi.createFloor(buildingId, data);
      await fetchFloors(buildingId);
      return res;
    } finally {
      setLoading(false);
    }
  };

  const fetchRooms = async (floorId: number) => {
    setLoading(true);
    try {
      const res = await hospitalApi.listRooms(floorId);
      setRooms(res);
    } catch (err) {
      console.warn("Failed to fetch rooms for floor:", floorId, err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async (hospitalId: number) => {
    setLoading(true);
    try {
      const res = await hospitalApi.listDepartments(hospitalId);
      setDepartments(res);
    } catch (err) {
      console.warn(
        "Failed to fetch departments for hospital:",
        hospitalId,
        err,
      );
    } finally {
      setLoading(false);
    }
  };

  // --- Scan API Functions ---
  const fetchSessions = async () => {
    try {
      const res = await scanApi.listSessions();
      setApiSessions(res);
    } catch (err) {
      console.warn("Failed to fetch scan sessions:", err);
    }
  };

  const createSession = async (params: {
    distance_walked?: number;
    duration_seconds?: number;
    frames_count?: number;
    points_captured_count?: number;
    coverage_percentage?: number;
    quality_rating?: string;
  }): Promise<number> => {
    const targetFloorId = selectedFloorId || (floors[0] ? floors[0].id : 1);
    const res = await scanApi.createSession({
      floor_id: targetFloorId,
      ...params,
    });
    setActiveSessionId(res.id);
    await fetchSessions();
    return res.id;
  };

  const uploadSessionAssets = async (sessionId: number): Promise<void> => {
    const framesToUpload =
      capturedFrames.length > 0
        ? capturedFrames
        : capturedFrameBase64
          ? [capturedFrameBase64]
          : [];

    for (let idx = 0; idx < framesToUpload.length; idx++) {
      try {
        await scanApi.uploadFrame(sessionId, framesToUpload[idx], idx);
      } catch (err) {
        console.warn(`Failed to upload captured camera frame ${idx}:`, err);
      }
    }

    await scanApi.uploadAsset(sessionId, {
      asset_type: "metadata",
      file_url: "s3://navigator-maps/scans/meta_" + sessionId + ".json",
      size_bytes: 4096,
    });
    await scanApi.uploadAsset(sessionId, {
      asset_type: "point_cloud",
      file_url: "s3://navigator-maps/scans/pc_" + sessionId + ".ply",
      size_bytes: 2548900,
    });
  };

  const triggerProcessing = async (sessionId: number): Promise<void> => {
    await scanApi.startProcessing(sessionId);
    await fetchSessions();
  };

  const pollJobProgress = async (
    sessionId: number,
  ): Promise<AIJobResultResponse[]> => {
    const res = await scanApi.getJobStatus(sessionId);
    setActiveJobResults(res);
    const isCompleted = res.every((step) => step.status === "completed");
    if (isCompleted) {
      await fetchSessions();
      await fetchSessionArtifacts(sessionId);
    }
    return res;
  };

  const fetchSessionArtifacts = async (sessionId: number) => {
    try {
      const [pc, det, ocr, map] = await Promise.all([
        scanApi.getPointCloud(sessionId).catch(() => null),
        scanApi.getObjectDetections(sessionId).catch(() => []),
        scanApi.getOCRDetections(sessionId).catch(() => []),
        scanApi.getMapData(sessionId).catch(() => null),
      ]);
      if (pc) setApiPointCloud(pc);
      if (det) setApiDetections(det);
      if (ocr) setApiOcrItems(ocr);
      if (map) setApiMapData(map);
    } catch (err) {
      console.warn("Failed to fetch session artifacts:", err);
    }
  };

  const updateOCRItemStatus = async (
    ocrId: number,
    status: "accepted" | "rejected" | "pending",
  ) => {
    if (!activeSessionId) return;
    try {
      const updated = await scanApi.updateOCRStatus(
        activeSessionId,
        ocrId,
        status,
      );
      setApiOcrItems((prev) =>
        prev.map((item) => (item.id === ocrId ? updated : item)),
      );
    } catch (err) {
      console.warn("Failed to update OCR status:", err);
    }
  };

  const acceptAllOCRApi = async () => {
    if (!activeSessionId) return;
    try {
      const res = await scanApi.acceptAllOCR(activeSessionId);
      setApiOcrItems(res);
    } catch (err) {
      console.warn("Failed to accept all OCR:", err);
    }
  };

  const saveVectorMapApi = async (mapData: VectorMapData) => {
    if (!activeSessionId) return;
    try {
      const saved = await scanApi.saveMapData(activeSessionId, mapData);
      setApiMapData(saved);
    } catch (err) {
      console.warn("Failed to save map data:", err);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      setMyHospitals([]);
      setApiSessions([]);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (hospitals.length > 0 && selectedHospitalId === null) {
      setSelectedHospitalId(hospitals[0].id);
    }
  }, [hospitals]);

  useEffect(() => {
    if (selectedHospitalId) {
      fetchBuildings(selectedHospitalId);
      fetchDepartments(selectedHospitalId);
    } else {
      setBuildings([]);
      setDepartments([]);
    }
  }, [selectedHospitalId]);

  useEffect(() => {
    if (selectedBuildingId) {
      fetchFloors(selectedBuildingId);
    } else {
      setFloors([]);
    }
  }, [selectedBuildingId]);

  useEffect(() => {
    if (selectedFloorId) {
      fetchRooms(selectedFloorId);
    } else {
      setRooms([]);
    }
  }, [selectedFloorId]);

  useEffect(() => {
    if (activeSessionId) {
      fetchSessionArtifacts(activeSessionId);
    }
  }, [activeSessionId]);

  const toggleOCRItem = (id: string) => {
    setOcrItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, accepted: !item.accepted } : item,
      ),
    );
  };

  const acceptAllOCR = () => {
    setOcrItems((prev) => prev.map((item) => ({ ...item, accepted: true })));
  };

  const setSelectedBuilding = (bName: string) => {
    setSelectedBuildingState(bName);
    const found = buildings.find((b) => b.name === bName);
    if (found) {
      setSelectedBuildingId(found.id);
    }
  };

  const setSelectedFloor = (fName: string) => {
    setSelectedFloorState(fName);
    const found = floors.find((f) => f.name === fName);
    if (found) {
      setSelectedFloorId(found.id);
    }
  };

  const dynamicLocationTree =
    hospitals.length > 0
      ? hospitals.map((h) => ({
          id: String(h.id),
          name: h.name,
          type: "hospital" as const,
          children: buildings
            .filter((b) => b.hospital_id === h.id)
            .map((b) => ({
              id: String(b.id),
              name: b.name,
              type: "building" as const,
              children: floors
                .filter((f) => f.building_id === b.id)
                .map((f) => ({
                  id: String(f.id),
                  name: f.name,
                  type: "floor" as const,
                })),
            })),
        }))
      : [];

  const dynamicSessionsHistory: ScanSession[] =
    apiSessions.length > 0
      ? apiSessions.map((s) => {
          const foundFloor = floors.find((f) => f.id === s.floor_id);
          const foundBuilding = foundFloor
            ? buildings.find((b) => b.id === foundFloor.building_id)
            : null;
          const bName = foundBuilding ? foundBuilding.name : "Main Building";
          const fName = foundFloor ? foundFloor.name : `Floor ${s.floor_id}`;

          const dt = new Date(s.created_at);
          return {
            id: String(s.id),
            jobId: `JOB-${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(s.id).padStart(4, "0")}`,
            location: `${bName} - ${fName}`,
            date: dt.toLocaleDateString(),
            time: dt.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            status: (s.status.charAt(0).toUpperCase() +
              s.status.slice(1)) as any,
            coverage: Math.round(s.coverage_percentage || 0),
            distance: `${s.distance_walked || 0} m`,
            frames: s.frames_count || 0,
            points: `${((s.points_captured_count || 0) / 1000).toFixed(0)}K`,
            size: "2.4 MB",
            scanner: "Ali Raza",
            device: "iPhone 14 Pro",
            quality: s.quality_rating || "Medium",
          };
        })
      : [];

  const dynamicData = {
    user: {
      name: user?.full_name || "Mapper",
      activeHospital:
        hospitals.find((h) => h.id === selectedHospitalId)?.name ||
        "No Active Hospital",
      location:
        hospitals.find((h) => h.id === selectedHospitalId)?.address ||
        "No Location",
    },
    locationTree: dynamicLocationTree,
    sessionsHistory: dynamicSessionsHistory,
    summaryMetrics: summaryMetrics,
    ocrResults: ocrItems,
  };

  return (
    <ExtractorContext.Provider
      value={{
        data: dynamicData,
        menuOpen,
        setMenuOpen,
        sidebarMode,
        setSidebarMode,
        selectedBuilding,

        selectedFloor,
        setSelectedBuilding,
        setSelectedFloor,
        ocrItems,
        toggleOCRItem,
        acceptAllOCR,
        sessions: dynamicSessionsHistory,
        activeFilter,
        setActiveFilter,

        hospitals,
        myHospitals,
        buildings,
        floors,
        rooms,
        departments,
        loading,
        selectedHospitalId,
        setSelectedHospitalId,
        selectedBuildingId,
        setSelectedBuildingId,
        selectedFloorId,
        setSelectedFloorId,
        fetchHospitals,
        fetchMyHospitals,
        createHospital,
        updateHospital,
        deleteHospital,
        fetchBuildings,
        createBuilding,
        fetchFloors,
        createFloor,
        fetchRooms,
        fetchDepartments,

        apiSessions,
        activeSessionId,
        setActiveSessionId,
        activeJobResults,
        apiOcrItems,
        apiDetections,
        apiPointCloud,
        apiMapData,

        fetchSessions,
        createSession,
        uploadSessionAssets,
        triggerProcessing,
        pollJobProgress,
        fetchSessionArtifacts,
        updateOCRItemStatus,
        acceptAllOCRApi,
        saveVectorMapApi,

        summaryMetrics,
        setSummaryMetrics,
        capturedFrameBase64,
        setCapturedFrameBase64,
        capturedFrames,
        addCapturedFrame,
        clearCapturedFrames,
        uploadedSessionIds,
        markSessionUploaded,
        syncedSessionIds,
        markSessionSynced,
        processedSessionIds,
        markSessionProcessed,
      }}
    >
      {children}
    </ExtractorContext.Provider>
  );
}

export function useExtractorContext() {
  const context = useContext(ExtractorContext);
  if (!context) {
    throw new Error(
      "useExtractorContext must be used within an ExtractorProvider",
    );
  }
  return context;
}
