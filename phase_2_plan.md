# Implementation Plan — Phase 2: Camera Mapping, AI Processing & Offline Map Compilation

This phase implements the **camera-based hospital mapping pipeline** and connects the Map Extractor application to a modular FastAPI processing backend.

The architecture is intentionally designed as a **modular monolith with asynchronous processing** rather than a single large AI service or premature microservice architecture.

The pipeline transforms captured camera/AR scan data into:

```text
Camera Scan
    ↓
Scan Assets
    ↓
SLAM / Pose + Point Cloud
    ↓
3D Reconstruction
    ↓
AI Perception
    ├── Object Detection
    ├── OCR
    └── Semantic Segmentation
    ↓
Spatial Fusion
    ↓
Building / Floor Model
    ↓
Navigation Graph
    ↓
Validation
    ↓
Admin Review
    ↓
Map Compiler
    ↓
Versioned Offline Map Package
```

The **3D reconstruction and AI processing happen online**, while the final compiled map package is designed specifically for **offline navigation**.

---

# 1. Architectural Principles

## 1.1 Modular pipeline

Do **not** implement the entire pipeline in one `ai_pipeline_service.py`.

Use a modular structure:

```text
apps/backend-fastapi/
└── app/
    ├── api/
    ├── models/
    ├── schemas/
    ├── services/
    │   ├── scanning/
    │   ├── pipeline/
    │   ├── reconstruction/
    │   ├── perception/
    │   ├── spatial/
    │   ├── navigation/
    │   ├── validation/
    │   └── compiler/
    ├── workers/
    ├── storage/
    └── core/
```

Each stage has one responsibility.

---

# 2. Pipeline Stages

The original concept of a "5-step AI pipeline" should be replaced with clearly separated processing stages.

Not every stage is AI.

---

## Stage 1 — Scan Ingestion

**Responsibility:** Receive and validate scan assets.

Input:

```text
camera frames
AR/SLAM poses
timestamps
device metadata
floor/session information
```

Output:

```text
ScanAssetManifest
```

This stage does not perform AI.

---

## Stage 2 — SLAM / Pose Processing

**Responsibility:** Establish camera trajectory and spatial coordinates.

Output:

```text
PoseTrajectory
PointCloud
CoordinateFrame
```

Example:

```json
{
  "frame_id": 125,
  "timestamp": 172344.22,
  "position": {
    "x": 4.21,
    "y": 0.0,
    "z": 8.91
  }
}
```

For the mobile capture application, prefer platform SLAM/AR capabilities such as ARKit/ARCore where possible rather than implementing SLAM from scratch.

The backend should consume standardized pose/scan data.

---

# 3. 3D Reconstruction

Create a dedicated:

```text
services/reconstruction/reconstruction_service.py
```

Responsibilities:

- Point-cloud registration
- ICP refinement where applicable
- Voxel/downsampling
- Coordinate normalization
- Mesh reconstruction when required

Output:

```text
PointCloudArtifact
MeshArtifact
```

Do not put this logic inside FastAPI endpoints.

---

# 4. AI Perception

AI perception should be a separate subsystem:

```text
services/perception/
├── object_detector.py
├── ocr_service.py
├── segmentation_service.py
└── perception_service.py
```

## 4.1 Object Detection

Detect things such as:

- Doors
- Elevators
- Stairs
- Signs
- Fire exits
- Room entrances
- Obstacles
- Other useful landmarks

The detector returns detections.

It should **not decide how those detections affect navigation**.

Example:

```json
{
  "type": "door",
  "confidence": 0.94,
  "position": {
    "x": 3.2,
    "y": 0,
    "z": 8.1
  }
}
```

---

## 4.2 OCR

Dedicated service:

```text
services/perception/ocr_service.py
```

Use PaddleOCR/EasyOCR initially.

Detect:

```text
Room 101
Cardiology
MRI
Emergency
ICU
```

Output:

```json
{
  "text": "Cardiology",
  "confidence": 0.96,
  "position": {
    "x": 10.4,
    "y": 1.7,
    "z": 4.2
  }
}
```

OCR should only report:

> "I found this text here."

It should not directly create navigation nodes.

---

# 5. Spatial Fusion

This is a critical stage and should remain separate from AI perception.

Create:

```text
services/spatial/
├── coordinate_system.py
├── geometry.py
├── fusion_service.py
└── building_model.py
```

This stage combines:

```text
Point Cloud
+
Walls
+
Doors
+
OCR
+
Objects
+
Camera trajectory
```

into a canonical building representation:

```text
Building
 └── Floor
      ├── Rooms
      ├── Corridors
      ├── Doors
      ├── Stairs
      ├── Elevators
      └── Landmarks
```

This is where the system understands:

> "This OCR label is attached to this room."

rather than storing unrelated detections.

---

# 6. Geometry Extraction

Create:

```text
services/spatial/geometry_service.py
```

Responsibilities:

- Wall extraction
- Plane detection
- RANSAC
- Corridor detection
- Room boundary estimation
- Polygon generation
- Floor geometry

The original "Wall RANSAC/Geometry Extraction" concept is correct, but it should be treated as **spatial processing**, not as an AI stage.

Output:

```text
FloorGeometryArtifact
```

Example:

```json
{
  "walls": [],
  "rooms": [],
  "corridors": [],
  "doors": []
}
```

---

# 7. Navigation Graph Generation

Create:

```text
services/navigation/
├── graph_builder.py
├── pathfinding.py
└── accessibility.py
```

Use NetworkX initially for graph construction and algorithms.

The graph contains:

```text
NavigationNode
NavigationEdge
```

Example:

```text
Reception
    │
    │
Corridor-01
   / \
  /   \
ICU   Pharmacy
```

Nodes can represent:

- Intersections
- Room entrances
- Elevators
- Stairs
- Important landmarks

Edges contain:

```text
distance
floor
accessible
stairs
elevator
direction
```

---

# 8. Do NOT Make NetworkX the Map Format

NetworkX is an implementation detail.

Your canonical map should be your own versioned schema.

Example:

```json
{
  "schema_version": "1.0",
  "building": {},
  "floors": [],
  "rooms": [],
  "doors": [],
  "landmarks": [],
  "navigation_graph": {}
}
```

Internally:

```text
NetworkX Graph
      ↓
Canonical Map Model
```

This allows NetworkX to be replaced later without changing the mobile app.

---

# 9. Validation Stage

Create:

```text
services/validation/
└── map_validator.py
```

Validation is especially important for hospital navigation.

## 9.1 Graph checks

Check:

```text
Are all nodes reachable?
Are there isolated rooms?
Are edges valid?
Are floor transitions connected?
```

## 9.2 Geometry checks

Check:

```text
Are walls intersecting incorrectly?
Are rooms closed?
Are corridors connected?
```

## 9.3 Navigation checks

Check:

```text
Can Reception → ICU be reached?
Can Floor 1 → Floor 2 be reached?
Is wheelchair routing possible?
```

Example validation output:

```json
{
  "status": "warning",
  "errors": [],
  "warnings": [
    {
      "type": "unreachable_room",
      "room_id": "room_104"
    }
  ]
}
```

---

# 10. Human Review

The AI should **not automatically publish a hospital map**.

The workflow should be:

```text
AI Generated Map
       ↓
Validation
       ↓
Admin Review
       ↓
Corrections
       ↓
Validation Again
       ↓
Publish
```

The map editor is therefore a critical part of the system.

---

# 11. Map Compiler

Do not make `map_generation` directly create a `.navpack`.

Create:

```text
services/compiler/
├── map_compiler.py
├── manifest.py
└── package_writer.py
```

Input:

```text
Canonical Map
+
Floor Assets
+
Metadata
```

Output:

```text
hospital.navpack
```

Possible package structure:

```text
hospital.navpack
├── manifest.json
├── map.json
├── floors/
│   ├── floor-01.svg
│   └── floor-02.svg
├── navigation/
│   └── graph.json
├── landmarks/
│   └── landmarks.json
└── assets/
```

SQLite may be used internally if useful, but SQLite should not be the architectural boundary.

The important part is the **versioned map package contract**.

---

# 12. Pipeline Job System

Do not run expensive processing synchronously from:

```text
POST /process
```

Instead:

```text
POST /process
       ↓
Create MappingJob
       ↓
Return job_id
       ↓
Background worker
```

Example job:

```json
{
  "id": "job_123",
  "scan_id": "scan_456",
  "status": "processing",
  "stage": "ocr",
  "progress": 62
}
```

Recommended states:

```text
QUEUED
INGESTING
SLAM
RECONSTRUCTION
PERCEPTION
OCR
SPATIAL_FUSION
GRAPH_GENERATION
VALIDATION
REVIEW_REQUIRED
COMPILING
COMPLETED
FAILED
```

---

# 13. Background Workers

Do not make FastAPI execute expensive AI/3D processing.

Use:

```text
FastAPI
   │
   └── Redis
         │
         ▼
       Worker
         │
         ├── Reconstruction
         ├── YOLO
         ├── OCR
         ├── Geometry
         └── Graph
```

For the first version:

```text
FastAPI
+
Redis
+
Celery
```

is sufficient.

A more advanced workflow engine can be introduced later if the pipeline becomes significantly more complex.

---

# 14. Artifact-Based Processing

Every stage should produce an artifact.

Example:

```text
scan_123/
│
├── input/
│
├── ingestion/
│   └── manifest.json
│
├── slam/
│   ├── trajectory.json
│   └── pointcloud.ply
│
├── reconstruction/
│   └── mesh.glb
│
├── perception/
│   ├── objects.json
│   ├── ocr.json
│   └── segmentation.json
│
├── spatial/
│   └── building-model.json
│
├── navigation/
│   └── graph.json
│
├── validation/
│   └── report.json
│
└── output/
    └── hospital.navpack
```

This makes debugging much easier.

If navigation is wrong, inspect:

```text
building-model.json
       ↓
graph.json
```

without rerunning the entire scan.

---

# 15. Typed Contracts Between Stages

Use Pydantic models.

Example:

```python
class Point3D(BaseModel):
    x: float
    y: float
    z: float


class ObjectDetection(BaseModel):
    id: str
    type: str
    confidence: float
    position: Point3D
```

Then:

```python
class DetectionArtifact(BaseModel):
    schema_version: str
    detections: list[ObjectDetection]
```

Every stage should have:

```text
Input Schema
      ↓
Processing
      ↓
Output Schema
```

Avoid passing unstructured dictionaries between stages.

---

# 16. Revised Backend Structure

Recommended backend structure:

```text
apps/backend-fastapi/
│
└── app/
    │
    ├── api/
    │   └── v1/
    │       └── endpoints/
    │           ├── scans.py
    │           └── jobs.py
    │
    ├── schemas/
    │   ├── scan.py
    │   ├── detection.py
    │   ├── ocr.py
    │   ├── map.py
    │   ├── navigation.py
    │   └── job.py
    │
    ├── models/
    │   ├── scan.py
    │   ├── job.py
    │   └── map.py
    │
    ├── services/
    │   │
    │   ├── scanning/
    │   │   └── scan_service.py
    │   │
    │   ├── pipeline/
    │   │   ├── orchestrator.py
    │   │   └── stage.py
    │   │
    │   ├── reconstruction/
    │   │   └── reconstruction_service.py
    │   │
    │   ├── perception/
    │   │   ├── object_detector.py
    │   │   ├── ocr_service.py
    │   │   └── segmentation_service.py
    │   │
    │   ├── spatial/
    │   │   ├── geometry_service.py
    │   │   ├── fusion_service.py
    │   │   └── building_model.py
    │   │
    │   ├── navigation/
    │   │   ├── graph_builder.py
    │   │   └── accessibility.py
    │   │
    │   ├── validation/
    │   │   └── map_validator.py
    │   │
    │   └── compiler/
    │       └── map_compiler.py
    │
    ├── workers/
    │   └── pipeline_tasks.py
    │
    ├── storage/
    │   └── artifact_storage.py
    │
    └── core/
        ├── config.py
        └── logging.py
```

---

# 17. API Architecture

Organize APIs around **scans, jobs, artifacts, and maps**.

## Scans

```http
POST /api/v1/scans
GET  /api/v1/scans/{id}
POST /api/v1/scans/{id}/assets
```

## Processing

```http
POST /api/v1/scans/{id}/process
GET  /api/v1/jobs/{job_id}
POST /api/v1/jobs/{job_id}/retry
```

## Artifacts

```http
GET /api/v1/scans/{id}/artifacts/point-cloud
GET /api/v1/scans/{id}/artifacts/detections
GET /api/v1/scans/{id}/artifacts/ocr
GET /api/v1/scans/{id}/artifacts/geometry
GET /api/v1/scans/{id}/artifacts/graph
GET /api/v1/scans/{id}/artifacts/validation
```

## Review

```http
PUT /api/v1/scans/{id}/ocr/{ocr_id}
PUT /api/v1/scans/{id}/detections/{detection_id}
PUT /api/v1/scans/{id}/map
```

## Publishing

```http
POST /api/v1/scans/{id}/publish
GET  /api/v1/maps/{map_id}
GET  /api/v1/maps/{map_id}/package
```

This is cleaner than putting every future operation directly under `scans/{id}`.

---

# 18. Frontend Architecture

The frontend should mirror the backend separation.

```text
src/
├── api/
│   ├── scans.api.ts
│   ├── jobs.api.ts
│   ├── artifacts.api.ts
│   └── maps.api.ts
│
├── types/
│   ├── scan.ts
│   ├── job.ts
│   ├── detection.ts
│   └── map.ts
│
├── features/
│   ├── scanning/
│   ├── processing/
│   ├── point-cloud/
│   ├── ocr-review/
│   ├── detection-review/
│   └── map-editor/
│
└── context/
```

Avoid making `ExtractorContext.tsx` responsible for every operation in the application.

Prefer feature-specific hooks/state where appropriate:

```text
useScan()
usePipelineJob()
useOCRDetections()
useObjectDetections()
useMapEditor()
```

---

# 19. Revised Frontend Flow

The mapping workflow should be:

```text
Scanning
   ↓
Asset Upload
   ↓
Processing Job
   ↓
Processing Progress
   ↓
Results
   ├── Point Cloud
   ├── OCR
   ├── Objects
   └── Geometry
   ↓
Map Editor
   ↓
Validation
   ↓
Publish
```

The existing screens can map to these stages:

```text
scanning-live.tsx
        ↓
upload-process.tsx
        ↓
ai-processing.tsx
        ↓
point-cloud-viewer.tsx
        ↓
ocr-results.tsx
        ↓
ai-detections.tsx
        ↓
map-editor.tsx
        ↓
validation/review
        ↓
publish
```

---

# 20. Point Cloud Viewer

Keep the point-cloud viewer separate from the navigation map.

Point cloud:

```text
Point Cloud
    ↓
3D inspection / debugging
```

Navigation:

```text
Navigation Graph
    ↓
2D/2.5D navigation
```

The offline navigator should not need the complete point cloud just to calculate routes.

A high-detail 3D model can optionally be included for AR/visualization, but it should not be the primary navigation representation.

---

# 21. Offline Map Package

The offline app should receive a compact package:

```text
hospital.navpack
├── manifest.json
├── map.json
├── floors/
│   ├── floor-01.svg
│   └── floor-02.svg
├── navigation/
│   └── graph.json
├── landmarks/
│   └── landmarks.json
└── assets/
```

The package should contain everything required for navigation without network access.

The mobile app should not need:

- YOLO
- OCR
- Open3D
- NetworkX
- the point cloud
- the backend

for normal navigation.

---

# 22. Two Separate Products/Pipelines

There are effectively two systems.

## Online Mapping Platform

```text
Camera
 ↓
SLAM
 ↓
Reconstruction
 ↓
AI Perception
 ↓
Spatial Fusion
 ↓
Graph
 ↓
Validation
 ↓
Admin Review
 ↓
Map Package
```

## Offline Navigation Application

```text
Map Package
 ↓
Load locally
 ↓
Determine current position
 ↓
A*
 ↓
Route
 ↓
Turn-by-turn UI
```

Do not mix these pipelines.

---

# 23. Recommended Technology Stack

| Layer | Technology |
|---|---|
| Mobile | Flutter |
| Mapping capture | Native ARKit/ARCore integration |
| Admin web | React + TypeScript |
| Backend | FastAPI |
| Pipeline workers | Celery |
| Queue | Redis |
| Database | PostgreSQL |
| Spatial DB | PostGIS |
| AI/CV | Python |
| Computer Vision | OpenCV |
| 3D Processing | Open3D |
| Object Detection | YOLO |
| OCR | PaddleOCR |
| Graph Algorithms | NetworkX initially |
| Pathfinding | A* |
| Map Editor | Konva.js / similar canvas library |
| Artifact Storage | S3-compatible object storage |
| Containers | Docker |
| Validation | pytest |
| Data Contracts | Pydantic |
| Logging | Structured JSON logging |
| Observability | OpenTelemetry later |

---

# 24. What NOT to Implement Initially

Avoid trying to build all advanced features at once.

Do not initially combine:

```text
YOLO + DINO + full 3D detection
+
custom SLAM implementation
+
advanced mesh reconstruction
+
advanced segmentation
+
BLE positioning
+
AR navigation
+
microservices
```

Start with a reliable end-to-end pipeline:

```text
Camera/AR Scan
       ↓
Point Cloud / Pose
       ↓
Basic Geometry
       ↓
Object Detection
       ↓
OCR
       ↓
Spatial Fusion
       ↓
Navigation Graph
       ↓
Admin Correction
       ↓
Offline Map
```

Once this works, improve individual stages.

---

# 25. Pipeline Orchestrator

The orchestrator should coordinate stages rather than contain their implementation.

Example:

```python
class PipelineOrchestrator:

    def run(self, scan_id):
        ingestion = self.ingestion.run(scan_id)

        reconstruction = self.reconstruction.run(
            ingestion
        )

        perception = self.perception.run(
            reconstruction
        )

        geometry = self.geometry.run(
            reconstruction
        )

        building = self.spatial_fusion.run(
            reconstruction,
            perception,
            geometry
        )

        graph = self.graph_builder.run(
            building
        )

        validation = self.validator.run(
            graph,
            building
        )

        return validation
```

Each `.run()` should be:

- Independently testable
- Independently retryable
- Independently replaceable
- Able to persist its output artifact

The orchestrator should **not** contain YOLO, OCR, Open3D, RANSAC, or graph implementation details.

---

# 26. Error Handling and Retries

Every pipeline stage should record:

```text
job_id
scan_id
stage
status
started_at
completed_at
attempt
error_code
error_message
artifact_ids
```

Example:

```json
{
  "job_id": "job_123",
  "stage": "ocr",
  "status": "failed",
  "attempt": 2,
  "error_code": "OCR_MODEL_ERROR",
  "error_message": "OCR model unavailable"
}
```

If OCR fails:

```text
OCR fails
 ↓
Stage marked FAILED
 ↓
Error persisted
 ↓
Retry OCR
 ↓
Continue from OCR
```

Do not rerun SLAM and reconstruction unnecessarily.

This is one of the main reasons to persist intermediate artifacts.

---

# 27. Logging and Observability

Use structured logs.

Example:

```json
{
  "event": "pipeline_stage_completed",
  "job_id": "job_123",
  "scan_id": "scan_456",
  "stage": "ocr",
  "duration_ms": 4821,
  "artifact_id": "artifact_789"
}
```

Later add:

```text
OpenTelemetry
+
metrics
+
distributed traces
```

This will make long-running AI processing much easier to diagnose.

---

# 28. Testing Strategy

The original testing plan should be expanded.

## 28.1 Unit Tests

Each pipeline stage must have independent tests.

```text
tests/
├── ingestion/
├── reconstruction/
├── perception/
├── spatial/
├── navigation/
├── validation/
└── compiler/
```

Examples:

```text
test_geometry_extraction()
test_ocr_projection()
test_object_detection_mapping()
test_graph_generation()
test_unreachable_rooms()
test_floor_transition()
test_map_compiler()
```

---

## 28.2 Integration Tests

Test:

```text
Scan
 ↓
Job
 ↓
Pipeline
 ↓
Artifacts
```

using controlled sample data.

---

## 28.3 Contract Tests

Verify:

```text
Stage A output
       ↓
Stage B input
```

remain compatible.

Pydantic schemas should be used to enforce these contracts.

---

## 28.4 End-to-End Test

The main E2E test should be:

```text
Create scan
     ↓
Upload sample scan
     ↓
Start processing
     ↓
Wait for job
     ↓
Verify artifacts
     ↓
Edit map
     ↓
Validate
     ↓
Compile
     ↓
Download navpack
     ↓
Load navpack in offline navigator
     ↓
Calculate route
```

---

# 29. Failure and Retry Testing

Intentionally make stages fail.

Example:

```text
OCR fails
 ↓
Job = FAILED
 ↓
Error recorded
 ↓
Retry OCR
 ↓
Continue from OCR
```

Also test:

- Network interruption during upload
- Worker crash
- Duplicate processing request
- Invalid scan data
- Missing floor transition
- Broken graph
- Corrupt artifact
- Invalid map package
- Unsupported schema version

---

# 30. Phase 2 Implementation Order

Do not implement all modules simultaneously.

Recommended order:

## Step 1 — Contracts

Create:

```text
ScanAssetManifest
PointCloudArtifact
DetectionArtifact
OCRArtifact
GeometryArtifact
BuildingModel
NavigationGraph
ValidationReport
MapPackageManifest
PipelineJob
```

These become the contracts between components.

---

## Step 2 — Job System

Implement:

```text
MappingJob
Job status
Pipeline stage status
Redis
Celery worker
```

Before integrating expensive AI.

---

## Step 3 — Artifact Storage

Implement:

```text
ArtifactStorage
```

with local storage for development and S3-compatible storage in deployment.

---

## Step 4 — Pipeline Orchestrator

Create:

```text
services/pipeline/orchestrator.py
```

with stage execution and state tracking.

---

## Step 5 — Reconstruction

Implement:

```text
SLAM input
 ↓
Point cloud
 ↓
Registration
 ↓
Downsampling
```

---

## Step 6 — Perception

Implement:

```text
YOLO
OCR
Segmentation
```

as independent modules.

---

## Step 7 — Geometry

Implement:

```text
RANSAC
Wall detection
Room boundaries
Corridors
Doors
```

---

## Step 8 — Spatial Fusion

Combine all outputs into:

```text
Canonical Building Model
```

---

## Step 9 — Navigation Graph

Generate:

```text
Nodes
Edges
Floor transitions
Accessibility metadata
```

---

## Step 10 — Validation

Run automatic map validation.

---

## Step 11 — Admin Review

Connect:

```text
OCR editor
Object editor
Geometry editor
Map editor
```

---

## Step 12 — Map Compiler

Generate:

```text
hospital.navpack
```

---

## Step 13 — Offline Navigator

Finally consume the package from the Flutter app.

---

# 31. Final Target Architecture

The complete architecture should look like:

```text
                         ONLINE MAPPING PLATFORM
                         =======================

                              Admin App
                                  │
                                  ▼
                              FastAPI
                                  │
                                  ▼
                         Mapping Job Created
                                  │
                                  ▼
                               Redis
                                  │
                                  ▼
                              Celery
                                  │
          ┌───────────────────────┼────────────────────────┐
          │                       │                        │
          ▼                       ▼                        ▼
   Reconstruction            Perception               Geometry
          │                       │                        │
          │                 ┌─────┴─────┐                  │
          │                 ▼           ▼                  │
          │                YOLO        OCR                 │
          │                 │           │                  │
          └─────────────────┴───────────┴──────────────────┘
                                  │
                                  ▼
                           Spatial Fusion
                                  │
                                  ▼
                         Canonical Map Model
                                  │
                                  ▼
                         Navigation Graph
                                  │
                                  ▼
                             Validator
                                  │
                                  ▼
                           Admin Review
                                  │
                                  ▼
                           Map Compiler
                                  │
                                  ▼
                         hospital.navpack
                                  │
                                  │
                    ──────────────┼──────────────
                                  │
                                  ▼
                         OFFLINE MOBILE APP
                                  │
                       ┌──────────┴──────────┐
                       ▼                     ▼
                  Local Map             A* Routing
                       │                     │
                       └──────────┬──────────┘
                                  ▼
                         Turn-by-Turn UI
```

---

# 32. Key Architectural Rules

These rules should guide future implementation.

### Rule 1
**FastAPI handles APIs, not heavy AI computation.**

### Rule 2
**The pipeline orchestrator coordinates stages; it does not implement them.**

### Rule 3
**Each pipeline stage has one responsibility.**

### Rule 4
**Every stage has typed input/output contracts.**

### Rule 5
**Every expensive stage produces a persistent artifact.**

### Rule 6
**Stages can be retried independently.**

### Rule 7
**AI perception is separate from spatial reasoning.**

### Rule 8
**Spatial reasoning is separate from navigation.**

### Rule 9
**NetworkX is an implementation detail, not the map format.**

### Rule 10
**The canonical map model is versioned and independent of Flutter.**

### Rule 11
**The offline navigator consumes only the compiled map package.**

### Rule 12
**AI-generated maps require human review before publishing.**

### Rule 13
**Start with a modular monolith, not microservices.**

### Rule 14
**Do not build custom SLAM when platform AR/SLAM capabilities can provide the required data.**

### Rule 15
**Do not optimize for every advanced AI feature before the complete end-to-end pipeline works.**

---

# Final Recommended Architecture

The core design decision is:

```text
                    Pipeline Orchestrator
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
 Reconstruction         Perception           Geometry
        │                   │                   │
        └───────────────────┼───────────────────┘
                            ▼
                     Spatial Fusion
                            │
                            ▼
                   Canonical Map Model
                            │
                            ▼
                    Navigation Graph
                            │
                            ▼
                       Validation
                            │
                            ▼
                      Admin Review
                            │
                            ▼
                     Map Compiler
                            │
                            ▼
                    Offline Map Package
```

The most important architectural decision is that **`PipelineOrchestrator` is an orchestrator, not a giant AI service**.

This structure gives the system:

- Separation of concerns
- Independent testing
- Independent retries
- Reproducible processing
- Persistent intermediate artifacts
- Easier debugging
- Replaceable AI models
- Replaceable reconstruction algorithms
- A stable map format
- A clean offline/online boundary
- A path from a final-year project to a scalable indoor mapping platform
