import os
import glob
import re
from typing import List, Optional
from PIL import Image, ImageEnhance, ImageFilter
from app.schemas.perception import OCRDetectionResponse, OCRArtifact

try:
    import pytesseract  # type: ignore

    HAS_PYTESSERACT = True
except ImportError:
    pytesseract = None  # type: ignore
    HAS_PYTESSERACT = False


class OCRService:
    @staticmethod
    def get_frame_paths(session_id: int) -> List[str]:
        possible_dirs = [
            os.path.join(
                os.path.dirname(
                    os.path.dirname(
                        os.path.dirname(
                            os.path.dirname(os.path.abspath(__file__))
                        )
                    )
                ),
                "storage",
                "scans",
                str(session_id),
            ),
            os.path.join(
                os.path.dirname(
                    os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
                ),
                "storage",
                "scans",
                str(session_id),
            ),
            os.path.abspath(f"storage/scans/{session_id}"),
        ]
        for base_dir in possible_dirs:
            if os.path.exists(base_dir):
                frames = sorted(glob.glob(os.path.join(base_dir, "frame_*.jpg")))
                if frames:
                    return frames
        return []

    @classmethod
    def detect_ocr_text(cls, session_id: int, floor_id: int) -> OCRArtifact:
        """
        Executes Optical Character Recognition across all captured camera keyframes
        to extract actual words, labels, room numbers, and signs.
        """
        ocr_items: List[OCRDetectionResponse] = []
        frame_paths = cls.get_frame_paths(session_id)
        seen_texts = set()
        idx = 1

        for frame_path in frame_paths:
            if not os.path.exists(frame_path):
                continue
            try:
                img = Image.open(frame_path).convert("RGB")
                if HAS_PYTESSERACT and pytesseract is not None:
                    # Pre-process image to enhance text edges
                    gray = img.convert("L")
                    enhancer = ImageEnhance.Contrast(gray)
                    enhanced = enhancer.enhance(2.0)

                    # Run tesseract data extraction
                    data = pytesseract.image_to_data(
                        enhanced, output_type=pytesseract.Output.DICT
                    )
                    n_boxes = len(data.get("text", []))

                    for i in range(n_boxes):
                        raw_text = data["text"][i].strip()
                        conf = float(data["conf"][i])

                        # Filter out low-confidence OCR noise
                        if len(raw_text) > 2 and conf > 30:
                            clean_text = re.sub(r"[^\w\s-]", "", raw_text)
                            if (
                                not clean_text
                                or clean_text.isdigit()
                                and len(clean_text) < 2
                            ):
                                continue

                            text_key = clean_text.lower()
                            if text_key in seen_texts:
                                continue
                            seen_texts.add(text_key)

                            if any(
                                k in text_key
                                for k in [
                                    "room",
                                    "no",
                                    "#",
                                    "rm",
                                    "floor",
                                    "level",
                                    "101",
                                    "102",
                                    "103",
                                    "104",
                                    "201",
                                    "202",
                                ]
                            ):
                                category = "room_number"
                            elif any(
                                k in text_key
                                for k in [
                                    "exit",
                                    "caution",
                                    "danger",
                                    "warning",
                                    "emergency",
                                    "stop",
                                    "fire",
                                    "stairs",
                                ]
                            ):
                                category = "sign"
                            elif any(
                                k in text_key
                                for k in [
                                    "dept",
                                    "department",
                                    "clinic",
                                    "lab",
                                    "office",
                                    "ward",
                                    "icu",
                                    "nurse",
                                    "pharmacy",
                                    "reception",
                                ]
                            ):
                                category = "department"
                            else:
                                category = "label"

                            ocr_items.append(
                                OCRDetectionResponse(
                                    id=idx,
                                    session_id=session_id,
                                    floor_id=floor_id,
                                    detected_text=clean_text,
                                    category=category,
                                    confidence=round(conf / 100.0, 2),
                                    status="pending",
                                )
                            )
                            idx += 1

            except Exception as e:
                print(f"[OCRService] Pytesseract execution note on {frame_path}: {e}")

        # Return real OCR results detected from all frames
        return OCRArtifact(session_id=session_id, floor_id=floor_id, items=ocr_items)
