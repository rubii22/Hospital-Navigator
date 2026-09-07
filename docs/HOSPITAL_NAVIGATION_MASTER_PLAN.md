# Hospital Navigator — Master Engineering Plan

**Status:** baseline audit and implementation plan  
**Last reviewed:** 2026-09-06  
**Audience:** product, mobile, backend, mapping, QA, and hospital operations teams

This is the source of truth for taking Hospital Navigator from its current prototype to a safe, offline indoor-navigation product. It records the audited state of the repository, the required target architecture, non-negotiable quality gates, and the sequence in which work must be delivered.

## 1. Product definition

Hospital Navigator has two separate products that share one published map package:

1. **Map Extractor** — an authenticated staff tool for importing a floor plan, surveying the building, reviewing detected labels, editing routing data, placing anchors, validating, and publishing a versioned map.
2. **Offline Navigator** — a visitor/patient app that downloads an approved hospital package once, then searches, routes, and locates the visitor without a network connection.

The product must not claim a route, an indoor position, or a mapping quality that it cannot substantiate. The primary mapping source is an approved architectural plan plus staff review. Phone scanning is supplementary evidence, not the authority for publishing a hospital map.

### Success criteria

- A visitor can download one approved hospital package, disable data/Wi-Fi, search a room/department, and receive a route that is valid for their selected accessibility profile.
- An approved map has every public destination connected to a graph, every graph edge is physically surveyed, and every floor transition is explicitly modelled.
- QR anchors can reset position at known locations. PDR may interpolate between anchors but never silently replace an unknown position with a false one.
- A mapper can publish a new version without corrupting installed packages; a device verifies and atomically installs it, or retains the previous working version.
- All automated geometry, OCR, and detection output is reviewable and cannot publish without validation and human approval.

## 2. Repository inventory and current state

| Project | Intended role | Current state | Required direction |
|---|---|---|---|
| `apps/map-extractor` | Staff mapping app | Good screen flow and API shell; scans RGB keyframes only; metrics and much map output are simulated. | Make it an import/survey/editor/review/publish tool. Add native capture only after the canonical editor works. |
| `apps/backend-fastapi` | API, map processing, package publishing | FastAPI/SQLModel foundation exists; reconstruction, geometry, fusion and package compiler are prototypes. | Establish canonical storage, validation, versioning, package build, authz, and separate workers. |
| `apps/offile_navigator` | Offline visitor navigation | Has UI, package fetch, AsyncStorage cache, basic sensor demo. Routes and position are not graph-derived. | Replace cache with filesystem + SQLite packages; add local routing and anchor-based positioning. Rename to `offline-navigator`. |
| `apps/admin-app` | Operations/admin console | Generic Next.js starter. | Either make it the browser-based review/publish console or defer/remove it. |
| root/Turbo docs | Workspace tooling | Root README is the stock Turborepo README; package management is not documented as a real monorepo. | Replace with actual architecture, local setup, test, release, and package-format documentation. |

### What works today

- Hospital/building/floor/room CRUD foundations and authentication exist.
- Extractor can capture camera snapshots and upload base64 frames.
- Backend has scan sessions, object/OCR result tables, map-version models, navigation-node/edge models, and a basic worker concept.
- Navigator can fetch a bootstrap JSON document and cache it for a simple disconnected demo.
- Basic QR-anchor and accessibility fields exist in the data model.

### What is prototype-only and must not be presented as production capability

- “LiDAR” capture, point counts, coverage, distance walked, frame count, and quality values in the extractor.
- Depth reconstruction from RGB frames in `reconstruction_service.py`.
- Door/sign/obstacle detection from contour aspect ratios in `object_detector.py`.
- Generated room rectangles, walls, corridors, hospital name, and room labels in spatial services.
- Sequential-detection navigation edges in `graph_builder.py`.
- Package compilation in `map_compiler.py`; it only returns manifest-like metadata.
- Navigator route instructions, ETA, accessibility statements, and current position.
- Outdoor `react-native-maps-directions` as a substitute for indoor routing.

## 3. Critical audit findings

### P0 — correctness and safety blockers

1. **There is no actual spatial measurement pipeline.** Periodic RGB pictures cannot generate a surveyed, metric indoor map. The current “point cloud” assumes fixed walls/floor/ceiling and a frame-by-frame corridor offset.
2. **There is no single map authority.** Scan `VectorMapData`, ORM rooms/nodes/edges, and navigator fallbacks can disagree. The same map can render differently in the extractor and navigator.
3. **The compiler does not create a navpack.** It neither writes an archive nor persists a checksum/version/package record. The navigator package API instead returns a JSON response.
4. **No true route calculation is used by the navigator.** The visitor sees fixed route text; it is not an A*/Dijkstra result from the downloaded graph.
5. **No trustworthy positioning loop exists.** Raw magnetometer heading is unreliable around lifts, steel, clinical equipment, and building services. Accelerometer peak counting drifts and has no absolute correction.
6. **Validation is insufficient.** Current validation only checks that edge endpoints exist. It does not test reachability, geometry, width, stairs/elevator rules, route accessibility, cross-floor transitions, or real-world survey status.

### P1 — engineering blockers

- `MappingJob` has no `session_id`; jobs are inferred by floor/recency in places.
- The pipeline repeats OCR/object detection, does not persist all its outputs, ignores validation result, and can mark a broken map as complete.
- Scan frames are uploaded as unbounded JSON base64; there is no MIME/size validation, hash, resumable upload, object storage, or retention policy.
- `navigator.py` must verify that a requested floor belongs to its requested hospital, and authorization must confirm mapper ownership/role for scan and publish actions.
- FastAPI launches Redis/Celery from application lifespan. API, Redis, and worker must be independently managed services.
- The offline app stores package JSON in AsyncStorage. It has no package integrity, encryption, atomic install, schema migration, deletion policy, or large-file strategy.
- Tests currently fail during collection because `DEBUG` receives `release`, which is not a boolean. Mapping/routing/package integration tests are absent.

### P2 — redundancy and maintenance debt

- `navigation_model.py` conflicts with `navigation_node_model.py` and `navigation_edge_model.py` (same table names, incompatible definitions).
- `mapping_job.py` conflicts with `mapping_job.model.py`.
- Frame-path discovery is repeated across reconstruction, OCR, and detection services.
- Mock data is mixed into production context flows and can mask API failures.
- Extractor/navigator duplicate API-client, design-system, and domain types instead of sharing a versioned package.
- The native point-cloud and `.web` point-cloud files are expected platform variants; keep them, but remove CDN-loaded Three.js because it fails offline.

## 4. Canonical map model

Do not use screen coordinates as map coordinates. Every floor must have a local, metric coordinate reference system with a documented origin, axis direction, scale, heading, and elevation. GeoJSON-like payloads are useful for transport/rendering; the authoritative store must preserve precision and topology.

### Core entities

```text
Hospital → Building → Floor → MapVersion → MapPackage
                                  ├─ Features: room, corridor, wall, door, POI, hazard
                                  ├─ Routing nodes and directed routing edges
                                  ├─ Vertical connectors: lift, stairs, ramp, escalator
                                  ├─ Localization anchors: QR, BLE, visual marker
                                  └─ Source evidence and reviewer decisions
```

### Required fields

| Entity | Required fields |
|---|---|
| Floor | ID, building ID, level, elevation metres, CRS metadata, width/height metres, map bounds, status |
| Feature | ID, floor ID, type, polygon/polyline/point geometry, source, confidence, review state, timestamps |
| Room/POI | stable ID, display name, aliases, room number, department, category, public visibility, geometry, entrance node |
| Node | stable UUID, floor ID, point coordinate, node type, linked feature/POI, accessibility attributes |
| Edge | stable UUID, from/to node, directed flag, polyline, length metres, width metres, slope, transition type, accessibility, closure/status, cost rules |
| Vertical connector | connector group ID across floors, lift/stair/ramp metadata, available direction, accessibility and operational state |
| Anchor | stable ID, type, payload/QR value or beacon ID, location/orientation, linked node, placement evidence, survey accuracy |
| Map version | building ID, semantic version, parent version, status, reviewer, changelog, validation report, published timestamp |
| Package | version ID, schema version, archive URI, byte size, SHA-256, signature/key ID, min app version, generated timestamp |

### Routing profiles

Ship at least `standard`, `wheelchair`, `no_stairs`, and `staff/restricted`. Profiles must be evaluated edge by edge; “accessible” cannot be one global label. The wheelchair profile must reject stairs, narrow doors/corridors, excessive slopes, closed lifts, and inaccessible entrances.

### Stable identifiers and changes

Feature/node/edge/anchor IDs must persist across versions when the physical entity persists. Never use array indexes or display names as identifiers. Changes need a changelog and tombstones for deleted public destinations so old client state can be reconciled.

## 5. Mapping workflow

1. Create hospital/building/floor and establish coordinate system/scale.
2. Import authoritative source: SVG, DXF-derived SVG/GeoJSON, CAD export, or a manually scaled PDF/image underlay.
3. Trace/review floor shell, walls, corridors, rooms, doors, vertical connectors, public POIs, and entrances.
4. Build the navigable graph from corridors and entrances; do not auto-connect detected objects.
5. Survey physical placement: confirm every public route, door, lift, stairs, and access constraint; attach evidence and a reviewer.
6. Place and print QR anchors at entrances, junctions, lifts, and decision points. Bind each anchor to a map version and routing node.
7. Use camera/AR capture to collect signs, QR checks, measurements, and change evidence. Automation proposes data; a mapper accepts/rejects it.
8. Run validation and test routes on a physical device.
9. Reviewer approves a draft. The backend compiles, signs, and publishes an immutable package.
10. Monitor feedback/closures; create a new draft and publish a replacement, never mutate an installed package in place.

## 6. Offline `.navpack` specification

Use a ZIP archive downloaded to the app filesystem, installed atomically into versioned storage. The primary map and graph should be in SQLite because it supports transactional installation and full-text search.

```text
manifest.json                 # schema, version, hashes, signature metadata
map.sqlite                    # floors, features, graph, POIs, aliases, FTS index
style.json                    # local MapLibre style (if using MapLibre)
assets/                       # icons, vector/raster floor assets, QR print sheets if needed
translations/                 # optional locale data
signature.ed25519             # detached package signature
```

`manifest.json` must include: hospital/building IDs, version, schema version, generated/published times, min navigator version, size, SHA-256 of every payload, signing key ID, and changelog. The app must download to a temporary directory, verify file hashes/signature and compatibility, migrate/index if needed, then atomically activate the version. Retain the previous known-good version until activation succeeds.

### Offline navigator rules

- Routing, destination search, floor switching, package version display, and current-route rerouting must work without network.
- A stale or invalid package must show its version/date and never pretend it is current.
- Use SQLite FTS5 for destination/alias search and filesystem storage for packages/assets. Do not store packages in AsyncStorage.
- A backend JSON endpoint may be useful for bootstrap/update discovery, but it is not the package format.

## 7. Localization strategy

### Release 1: QR anchor positioning

The simplest reliable solution is QR localization. At a QR anchor, scan a signed payload containing hospital/building/floor/anchor/version data. Validate it against the installed package, set position and heading (where known), then route from that graph node. Offer “I am at this sign” as the explicit fallback.

### Release 2: PDR between anchors

Use Android hardware step counter/detector and rotation-vector sensors, with a calibrated stride model and confidence decay. Constrain PDR to the route corridor and reset it only at trusted QR anchors. Show a degraded-location state after an accuracy threshold; do not continue showing a precise blue dot.

### Release 3: BLE only where justified

BLE can improve hands-free localization but requires installed hardware, beacon inventory, battery maintenance, radio survey, calibration, RSSI filtering, and ongoing operations. It is not a software-only feature. Scan only when needed and with a time limit to preserve battery.

### Optional AR support

ARCore can provide tracking/depth evidence on supported Android hardware, but it is not universal LiDAR and needs a fallback. Its depth API is optional, must be enabled per AR session after checking support, and should not be a publication requirement. Use it for mapper capture/change detection, not as the only route-localization system.

## 8. Recommended technology choices

| Need | Recommendation | Decision |
|---|---|---|
| Mobile app shell | Expo Router + React Native, custom development build | Keep; Expo Go is insufficient for the native modules below. |
| Indoor floor rendering | `@maplibre/maplibre-react-native` and local style/GeoJSON/vector layers | Recommended; supports native/offline packs. |
| Indoor routing | Compact local graph + A* in TypeScript | Start here; move to Kotlin only if profiling demands it. |
| Package/index data | SQLite + filesystem; optional SQLCipher | Required. |
| Backend spatial data | PostgreSQL + PostGIS + FastAPI | Keep, but use one canonical geometry model. |
| Background work | Separate Celery worker/Redis service or a durable job system | Required; never spawn workers from the API process. |
| Upload storage | S3-compatible object store with presigned multipart uploads | Required for scans/packages. |
| OCR/QR | Bundled ML Kit models for critical offline mapper/navigator flows | Recommended. |
| CAD import | Server conversion pipeline to SVG/GeoJSON; retain original source/evidence | Required for reliable initial mapping. |
| Graph analysis | NetworkX server-side for validation/build-time; A* local at runtime | Recommended. |
| Automated 3D reconstruction | Open3D/RTAB-Map/ORB-SLAM-class pipeline, only after real depth/pose capture | Deferred; it is not a shortcut around review. |

Do **not** make GraphHopper the core mobile indoor-routing dependency. Its historical Android offline demo was discontinued after GraphHopper 1.0; a compact hospital graph is smaller, clearer, and easier to validate locally.

## 9. Native Android/Kotlin work list

These items need a custom native module or an established React Native wrapper and an Expo development build.

| Module | Why native | Main Android APIs/libraries | Release |
|---|---|---|---|
| `IndoorMapModule` | Hardware-accelerated native vector rendering/offline tile DB | MapLibre Native | R1 |
| `PackageStorageModule` | Atomic filesystem install, SQLite/Room, optional encryption | Room, SQLCipher, WorkManager | R1 |
| `QrAnchorModule` | Fast controlled QR scan and signed-anchor verification | CameraX + ML Kit Barcode Scanning | R1 |
| `PdrModule` | Reliable steps/orientation, lifecycle-safe batching | `TYPE_STEP_COUNTER`, `TYPE_STEP_DETECTOR`, `TYPE_ROTATION_VECTOR` | R2 |
| `BleLocalizationModule` | Beacon scanning/filtering and Android 12+ permission flow | `BluetoothLeScanner`, `BLUETOOTH_SCAN` | R3 if required |
| `ArSurveyModule` | Pose/depth/keyframe capture from supported mapping devices | ARCore + CameraX | Optional mapper phase |
| `OnDeviceOcrModule` | Fully offline text detection with coordinates | ML Kit Text Recognition | Mapper R1/R2 |

Native modules must expose capability checks, permission state, device support, data-loss-safe cancellation, throttled events, and an explicit unsupported-device fallback. Device compatibility is a product requirement: ARCore Depth must be optional, while QR/manual start must be universal.

## 10. Security, privacy, and hospital operations

- Do not capture or retain patients, faces, medical records, screen contents, or clinical details. Show capture guidance and enforce retention/deletion policies.
- Encrypt access tokens and sensitive local package data. Use HTTPS, short-lived upload URLs, least-privilege roles, audit logs, and server-side authorization checks.
- QR payloads must be signed or contain an unguessable server-issued token; never trust a bare anchor ID from a printed code.
- Maintain role separation: mapper, reviewer, publisher, hospital administrator, and navigator user.
- Every public map change needs audit records: who changed it, evidence, review outcome, package version, and rollback target.
- Define an emergency/closure process for blocked corridors, lift outages, construction, and evacuations. Offline packages are not a replacement for hospital emergency procedures.
- Perform accessibility and wayfinding review with hospital facilities staff and accessibility representatives before release.

## 11. Validation and test gates

### Map validation gates

- Valid, closed, non-self-intersecting geometry; doors connect a room to a corridor or valid space.
- Every public POI has a reachable entrance node.
- Graph edges reference real nodes, have positive measured lengths, and are within floor bounds.
- All floors have valid vertical connector links where a cross-floor route is claimed.
- For each routing profile, run reachability and representative route tests; prohibited edges cannot occur in the result.
- QR anchors resolve to an active node on the matching published map version.
- Detect duplicate anchor payloads, orphaned features, overlapping doors/walls, zero-length edges, isolated subgraphs, and unreviewed auto-detections.

### Automated test suite

- Unit: geometry, graph, profile filtering, A*, package manifest/hash/signature, FTS search, QR parsing, version comparison.
- API integration: authorization, hospital/floor isolation, session/job linkage, upload validation, draft/review/publish/rollback lifecycle.
- Package integration: build → verify → install → route/search offline → update/rollback.
- Device integration: QR scan, sensor capability checks, background/foreground transitions, no-network startup, storage exhaustion, package interruption.
- Field acceptance: survey routes on each published floor with standard/wheelchair/no-stairs profiles, then record results against the package version.

### Current baseline check

On 2026-09-06 backend `pytest -q` initially failed during collection because a shell-level `DEBUG=release` value was parsed as a boolean. Test mode now forces deterministic test settings and avoids worker startup. The legacy FastAPI/Starlette synchronous test transport still blocks in this Python 3.14 environment, so the auth suite needs dependency compatibility work; the map-editor unit test passes. The repository has only two backend test files and no mapping/package/routing test coverage. The shell environment also did not expose `npm`, so Expo lint could not be executed in this audit. Do not treat a green UI demo as verification.

## 12. Delivery roadmap

### Phase 0 — make the foundation truthful (P0)

- [ ] Replace stock root README with real project docs and add a root package-management policy.
- [ ] Repair environment parsing and make test configuration isolated from developer `.env` files.
- [ ] Delete/consolidate duplicate ORM models and create migrations, not direct table recreation.
- [ ] Introduce one shared versioned map schema package/API contract.
- [ ] Link `MappingJob` to `MappingSession`; make pipeline stages idempotent and persist artifacts/errors.
- [ ] Remove fabricated map/route/quality claims from production UI; label simulations clearly until replaced.
- [ ] Add authorization and ownership checks to scan/map/publish endpoints.
- [ ] Separate API, worker, Redis, database, and object storage runtime configuration.

**Exit gate:** a manually entered small floor map can be saved, loaded, validated, and rendered identically by extractor and navigator.

### Phase 1 — usable offline navigation (P1)

- [ ] Build CAD/PDF/SVG import and a true metric 2D editor with undo/history.
- [ ] Model rooms, doors, corridors, lifts/stairs/ramps, POIs, restrictions, and anchors.
- [ ] Implement validator, reviewer workflow, map versions, package compiler, SHA-256/signature, and rollback.
- [ ] Replace AsyncStorage package cache with filesystem + SQLite package installation.
- [ ] Implement local FTS search and local A* routing with profile-specific edge filtering.
- [ ] Replace fake route instructions and ETAs with graph result details.
- [ ] Implement signed QR anchor scan/manual position selection.
- [ ] Field-survey and publish one pilot building/floor.

**Exit gate:** fresh install → download approved package → airplane mode → search → QR start → accessible route → arrival, tested in the physical pilot floor.

### Phase 2 — mapper productivity and robust navigation (P2)

- [ ] Add bundled on-device ML Kit OCR and QR evidence capture.
- [ ] Add PDR with rotation-vector/step-counter data, confidence, and QR resets.
- [ ] Add change reports, feedback, route issue reporting, closure overlays, and package-diff updates.
- [ ] Create the admin-app review/publish dashboard if a browser workflow is needed.
- [ ] Add multilingual aliases and accessibility/wayfinding review workflows.

**Exit gate:** maps can be revised and safely republished without a developer; localization visibly degrades rather than drifting silently.

### Phase 3 — optional automation (P3)

- [ ] Build ARCore survey mode for supported mapper devices, capturing pose, intrinsics, depth/keyframes, IMU, and quality evidence.
- [ ] Process capture with real SLAM/registration, plane extraction, OCR/object proposals, and confidence/evidence links.
- [ ] Add BLE only after a radio survey and operations plan show that QR+PDR is insufficient.
- [ ] Compare auto-extracted output to authoritative plans and require review before merge/publish.

**Exit gate:** automation measurably reduces mapper effort while meeting the same reviewer and field-validation gates as imported plans.

## 13. Immediate implementation order

The next engineering work must be performed in this order:

1. Fix the test/environment bootstrap and duplicate model definitions.
2. Design and migrate the canonical schema, including `session_id` on jobs and map version/package relationships.
3. Implement a durable draft map save/load API and ensure the extractor editor manipulates that model directly.
4. Implement graph validation and local A* against a manually created pilot-floor graph.
5. Implement the real `.navpack` compiler/verification/install flow.
6. Replace navigator UI demo routes with local graph routes.
7. Add QR anchor generation/scan and physical pilot survey.
8. Only then invest in AR/depth reconstruction or BLE.

## 14. Authoritative external references

- [MapLibre React Native setup](https://maplibre.org/maplibre-react-native/docs/setup/getting-started/) and [OfflineManager](https://maplibre.org/maplibre-react-native/docs/modules/offline-manager/)
- [ARCore Depth on Android](https://developers.google.com/ar/develop/java/depth/developer-guide)
- [Android motion sensors](https://developer.android.com/develop/sensors-and-location/sensors/sensors_motion)
- [ML Kit text recognition](https://developers.google.com/ml-kit/vision/text-recognition/v2/android)
- [ML Kit barcode/QR scanning](https://developers.google.com/ml-kit/vision/barcode-scanning/android)
- [Android BLE scanning guidance](https://developer.android.com/develop/connectivity/bluetooth/ble/find-ble-devices)
- [GraphHopper documentation note on discontinued Android offline demo](https://github.com/graphhopper/graphhopper/blob/master/docs/index.md)
