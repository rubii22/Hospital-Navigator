from typing import List
from app.schemas.map import VectorMapData, NavigationNodeSchema, NavigationEdgeSchema
from app.services.perception.object_detector import ObjectDetectorService
from app.services.perception.ocr_service import OCRService
from app.services.spatial.geometry_service import GeometryService


class GraphBuilderService:
    @staticmethod
    def build_navigation_graph(session_id: int, floor_id: int) -> VectorMapData:
        """
        Constructs topological navigation graph (nodes, edges, accessibility routes)
        from actual computer vision detections and geometric room boundaries.
        """
        det_art = ObjectDetectorService.detect_objects(session_id, floor_id)
        geom = GeometryService.extract_geometry(session_id, floor_id)

        rooms = geom.get("rooms", [])

        nodes: List[NavigationNodeSchema] = [
            NavigationNodeSchema(
                id="n_entry",
                label="Scan Entry Point",
                type="entrance",
                x=15.0,
                y=15.0,
                z=0.0,
                accessible=True,
            )
        ]

        edges: List[NavigationEdgeSchema] = []
        doors = []

        # Add doors and nodes from real 3D object detections
        for idx, det in enumerate(det_art.detections, start=1):
            node_id = f"n_det_{idx}"
            node_x = float(det.centroid_x) * 10.0 + 40.0
            node_y = float(det.centroid_y) * 8.0 + 35.0

            node_type = "door" if det.class_name == "door" else "waypoint"
            nodes.append(
                NavigationNodeSchema(
                    id=node_id,
                    label=f"{det.class_name.capitalize()} #{idx}",
                    type=node_type,
                    x=round(max(10.0, node_x), 1),
                    y=round(max(10.0, node_y), 1),
                    z=float(det.centroid_z),
                    accessible=True,
                )
            )

            # Connect to previous node
            prev_node = nodes[idx - 1]
            dist = round(
                ((node_x - prev_node.x) ** 2 + (node_y - prev_node.y) ** 2) ** 0.5, 1
            )
            edges.append(
                NavigationEdgeSchema(
                    id=f"e_{idx}",
                    from_node=prev_node.id,
                    to_node=node_id,
                    distance=max(1.0, dist),
                    accessible=True,
                    edge_type="door" if det.class_name == "door" else "pathway",
                )
            )

            if det.class_name == "door":
                doors.append(
                    {
                        "id": f"d_{idx}",
                        "name": f"Door ({int(det.confidence * 100)}%)",
                        "x": round(max(10.0, node_x), 1),
                        "y": round(max(10.0, node_y), 1),
                    }
                )

        if not doors and rooms:
            # Place entry door on primary room boundary
            first_room = rooms[0]
            doors.append(
                {
                    "id": "d_entry",
                    "name": "Main Entrance Door",
                    "x": round(float(first_room.get("x", 20.0)) + 20.0, 1),
                    "y": round(float(first_room.get("y", 20.0)), 1),
                }
            )

        return VectorMapData(
            session_id=session_id,
            floor_id=floor_id,
            nodes=nodes,
            edges=edges,
            rooms=rooms,
            doors=doors,
        )

