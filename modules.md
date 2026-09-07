Phase 1: Core Backend Endpoints (apps/backend-fastapi)

Implement CRUD router endpoints for Hospitals, Buildings, Floors, and Rooms in

hospitals.py
to connect frontend components to live data instead of static mocks.
Add active user preference endpoint handlers in

users.py
.
Phase 2: Map Extractor App Scanning & Ingestion (apps/map-extractor)

Build the Live Camera/LiDAR Scan screen (scanning-live.tsx) which calculates scanning coverage percentage.
Add the Upload & Sync service (upload-process.tsx) to push data payload bundles to the backend.
Build the 3D Point Cloud WebGL Viewer (point-cloud-viewer.tsx) utilizing Expo-GL.
Phase 3: Map Extractor Verification & CAD Editing

Implement validation pages for OCR recognized text and object classes (ocr-results.tsx & ai-detections.tsx).
Create the interactive 2D Vector CAD Editor (map-editor.tsx) to manually link and manage pathing nodes.
