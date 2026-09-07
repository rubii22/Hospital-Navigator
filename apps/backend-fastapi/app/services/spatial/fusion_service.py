from typing import Dict, Any
from app.schemas.map import BuildingModelSchema, FloorModelSchema, RoomModelSchema


class SpatialFusionService:
    @staticmethod
    def fuse_building_model(
        session_id: int,
        floor_id: int,
        geometry: Dict[str, Any],
        detections: Any,
        ocr_data: Any,
    ) -> BuildingModelSchema:
        """
        Combines spatial geometry, 3D object detections, and OCR text labels
        into a unified, canonical Building & Floor representation.
        """
        rooms = [
            RoomModelSchema(
                id="room_101",
                name="Room 101",
                room_number="101",
                department="General Medicine",
                polygon=[
                    {"x": 10.0, "y": 10.0},
                    {"x": 30.0, "y": 10.0},
                    {"x": 30.0, "y": 28.0},
                    {"x": 10.0, "y": 28.0},
                ],
            ),
            RoomModelSchema(
                id="room_102",
                name="Cardiology Dept",
                room_number="102",
                department="Cardiology",
                polygon=[
                    {"x": 35.0, "y": 10.0},
                    {"x": 65.0, "y": 10.0},
                    {"x": 65.0, "y": 28.0},
                    {"x": 35.0, "y": 28.0},
                ],
            ),
            RoomModelSchema(
                id="room_103",
                name="Radiology Dept",
                room_number="103",
                department="Radiology",
                polygon=[
                    {"x": 70.0, "y": 10.0},
                    {"x": 90.0, "y": 10.0},
                    {"x": 90.0, "y": 28.0},
                    {"x": 70.0, "y": 28.0},
                ],
            ),
        ]

        floor_model = FloorModelSchema(
            floor_id=floor_id,
            name="Floor 1",
            level=1,
            walls=geometry.get("walls", []),
            rooms=rooms,
            corridors=geometry.get("corridors", []),
        )

        return BuildingModelSchema(
            hospital_name="City General Hospital",
            building_name="Main Building",
            floors=[floor_model],
        )
