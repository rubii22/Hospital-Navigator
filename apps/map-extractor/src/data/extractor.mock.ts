export type LocationNode = {
  id: string;
  name: string;
  type: "hospital" | "building" | "floor" | "block";
  children?: LocationNode[];
};

export type OCRItem = {
  id: string;
  text: string;
  category: "Department" | "Room Number" | "Sign" | "Room";
  confidence: number;
  accepted: boolean;
};

export type ScanSession = {
  id: string;
  jobId: string;
  location: string;
  date: string;
  time: string;
  status: "Completed" | "Processing" | "Failed";
  coverage: number;
  distance: string;
  frames: number;
  points: string;
  size: string;
  scanner: string;
  device: string;
};

export const extractorMockData = {
  user: {
    name: "Ali Raza",
    role: "Lead Mapper",
    activeHospital: "City General Hospital",
    location: "Downtown, City",
  },
  
  locationTree: [
    {
      id: "cgh",
      name: "City General Hospital",
      type: "hospital",
      children: [
        {
          id: "mb",
          name: "Main Building",
          type: "building",
          children: [
            { id: "gf", name: "Ground Floor", type: "floor" },
            { id: "f1", name: "Floor 1", type: "floor" },
            { id: "f2", name: "Floor 2", type: "floor" },
            { id: "b1", name: "Basement 1", type: "floor" },
          ],
        },
        { id: "eb", name: "Emergency Block", type: "block" },
        { id: "opd", name: "OPD Block", type: "block" },
        { id: "cc", name: "Cardiac Center", type: "block" },
      ],
    },
  ] as LocationNode[],

  scanInstructions: [
    { icon: "walk", title: "Walk slowly and steadily" },
    { icon: "camera", title: "Capture all areas" },
    { icon: "target", title: "Focus on corridors, rooms and signs" },
    { icon: "sun", title: "Good lighting improves accuracy" },
  ],

  activeScan: {
    hospital: "City General Hospital",
    building: "Main Building",
    floor: "Floor 1",
    fps: 24,
    pointsCount: "12.4K",
    coveragePercent: 68,
    duration: "08:24",
    framesCaptured: 1520,
    quality: "High",
    areasStatus: "All Good",
  },

  summaryMetrics: {
    coverage: 92,
    rating: "Excellent",
    distanceWalked: "245 m",
    framesCaptured: 2450,
    pointsCaptured: "1.2M",
    duration: "12:45",
    areasCovered: "All Good",
    quality: "High",
  },

  uploadProgress: {
    fileName: "Uploading Scan Data",
    currentSize: "1.2 GB",
    totalSize: "1.3 GB",
    percentage: 100,
    checklist: [
      { label: "Frames", status: "Uploaded" },
      { label: "Depth Data", status: "Uploaded" },
      { label: "Sensor Data", status: "Uploaded" },
      { label: "Metadata", status: "Uploaded" },
    ],
  },

  aiSteps: [
    { name: "1. Point Cloud Generation", percent: 100 },
    { name: "2. Object Detection", percent: 100 },
    { name: "3. OCR Recognition", percent: 80 },
    { name: "4. Geometry Extraction", percent: 60 },
    { name: "5. Map Generation", percent: 20 },
  ],

  jobStatus: {
    jobId: "JOB-2025-05-18-0007",
    completedAt: "18 May 2025, 02:45 PM",
    status: "Processing Complete!",
    nextSteps: [
      { title: "Review AI Results", desc: "Check detected map and features" },
      { title: "Sync to Cloud", desc: "Save and sync to central server" },
    ],
  },

  aiDetections: [
    { id: "d1", label: "Cardiology Dept", category: "Rooms", x: 120, y: 80, color: "#6366f1" },
    { id: "d2", label: "Room 204", category: "Rooms", x: 60, y: 150, color: "#38bdf8" },
    { id: "d3", label: "Radiology Dept", category: "Rooms", x: 220, y: 190, color: "#10b981" },
    { id: "d4", label: "Emergency Sign", category: "Signs", x: 180, y: 120, color: "#ef4444" },
    { id: "d5", label: "MRI Room", category: "POIs", x: 80, y: 260, color: "#f59e0b" },
    { id: "d6", label: "Fire Exit", category: "Signs", x: 260, y: 280, color: "#ec4899" },
  ],

  ocrResults: [
    { id: "ocr1", text: "CARDIOLOGY", category: "Department", confidence: 95, accepted: true },
    { id: "ocr2", text: "ROOM 204", category: "Room Number", confidence: 98, accepted: true },
    { id: "ocr3", text: "RADIOLOGY", category: "Department", confidence: 96, accepted: true },
    { id: "ocr4", text: "EMERGENCY", category: "Sign", confidence: 99, accepted: true },
    { id: "ocr5", text: "MRI ROOM", category: "Room", confidence: 93, accepted: true },
    { id: "ocr6", text: "FIRE EXIT", category: "Sign", confidence: 97, accepted: true },
  ] as OCRItem[],

  mapMetadata: {
    scanName: "Main Building - Floor 1 - 18 May 2025",
    description: "Scanned using mobile device. All areas covered including corridors, rooms, departments and exits.",
    scanDate: "18 May 2025 10:30 AM",
    scanner: "Ali Raza",
    device: "iPhone 14 Pro",
    size: "1.2 GB",
    coverage: "92%",
  },

  syncStatus: {
    statusText: "Preparing data for sync...",
    progress: 75,
    checklist: [
      { name: "Map Data", ready: true },
      { name: "Thumbnails", ready: true },
      { name: "Metadata", ready: true },
      { name: "AI Results", ready: true },
    ],
  },

  sessionsHistory: [
    {
      id: "s1",
      jobId: "JOB-2025-05-18-0007",
      location: "Main Building - Floor 1",
      date: "18 May 2025",
      time: "10:30 AM",
      status: "Completed",
      coverage: 92,
      distance: "245 m",
      frames: 2450,
      points: "1.2M",
      size: "1.2 GB",
      scanner: "Ali Raza",
      device: "iPhone 14 Pro",
    },
    {
      id: "s2",
      jobId: "JOB-2025-05-17-0004",
      location: "Emergency Block - G Floor",
      date: "17 May 2025",
      time: "03:20 PM",
      status: "Completed",
      coverage: 88,
      distance: "190 m",
      frames: 1890,
      points: "950K",
      size: "980 MB",
      scanner: "Ali Raza",
      device: "iPhone 14 Pro",
    },
    {
      id: "s3",
      jobId: "JOB-2025-05-16-0002",
      location: "OPD Block - Floor 2",
      date: "16 May 2025",
      time: "01:15 PM",
      status: "Processing",
      coverage: 76,
      distance: "160 m",
      frames: 1400,
      points: "720K",
      size: "750 MB",
      scanner: "Ali Raza",
      device: "iPhone 14 Pro",
    },
    {
      id: "s4",
      jobId: "JOB-2025-05-15-0001",
      location: "Cardiac Center - Floor 1",
      date: "15 May 2025",
      time: "11:45 AM",
      status: "Failed",
      coverage: 42,
      distance: "80 m",
      frames: 620,
      points: "310K",
      size: "340 MB",
      scanner: "Ali Raza",
      device: "iPhone 14 Pro",
    },
  ] as ScanSession[],
};
