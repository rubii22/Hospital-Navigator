"""A* pathfinding over the hospital navigation graph.

Loads nodes and edges from the database, filters by routing profile
constraints, and returns the shortest path with turn-by-turn instructions.
Also includes a pure-data variant that operates on plain lists (used by
tests and by the navpack compiler for offline validation).
"""

from __future__ import annotations

import heapq
import math
import json
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Tuple

from sqlmodel import Session, select

from app.models.navigation_model import NavigationNode, NavigationEdge, RoutingProfile


# ── Data structures ────────────────────────────────────────────────────

@dataclass
class RouteStep:
    node_id: int
    node_name: str
    node_type: str
    x: float
    y: float
    floor_id: int
    instruction: str = ""
    distance_meters: float = 0.0
    cumulative_distance: float = 0.0
    edge_type: str = ""


@dataclass
class RouteResult:
    found: bool
    total_distance_meters: float = 0.0
    estimated_time_minutes: float = 0.0
    steps: List[RouteStep] = field(default_factory=list)
    path_node_ids: List[int] = field(default_factory=list)
    profile: str = "standard"
    accessibility_notes: List[str] = field(default_factory=list)


# ── Edge filtering per profile ─────────────────────────────────────────

def _edge_allowed(edge: NavigationEdge, profile: Optional[RoutingProfile]) -> bool:
    """Return True if the edge is passable for the given routing profile."""
    if edge.closure_status and edge.closure_status == "closed":
        return False
    if profile is None:
        return True

    # Per-profile accessibility JSON overrides
    if edge.accessibility_json:
        try:
            acc = json.loads(edge.accessibility_json)
            if acc.get(profile.name) is False:
                return False
        except (json.JSONDecodeError, TypeError):
            pass

    # Restricted edge types
    if profile.restricted_edge_types_json:
        try:
            restricted = json.loads(profile.restricted_edge_types_json)
            if edge.edge_type in restricted:
                return False
        except (json.JSONDecodeError, TypeError):
            pass

    # Stairs
    if not profile.allow_stairs and edge.edge_type in ("stairs",):
        return False
    # Elevator
    if not profile.allow_elevators and edge.edge_type in ("elevator",):
        return False
    # Ramps
    if not profile.allow_ramps and edge.edge_type in ("ramp",):
        return False
    # Slope
    if (
        profile.max_slope_percent is not None
        and edge.slope_percent is not None
        and edge.slope_percent > profile.max_slope_percent
    ):
        return False
    # Width
    if (
        profile.min_door_width_meters is not None
        and edge.width_meters is not None
        and edge.width_meters < profile.min_door_width_meters
    ):
        return False

    if not edge.is_accessible and profile.name == "wheelchair":
        return False

    return True


# ── Heuristic ──────────────────────────────────────────────────────────

def _heuristic(node_a: NavigationNode, node_b: NavigationNode) -> float:
    """Euclidean distance heuristic for A*."""
    dx = node_a.x - node_b.x
    dy = node_a.y - node_b.y
    return math.sqrt(dx * dx + dy * dy)


# ── Core A* ────────────────────────────────────────────────────────────

def astar(
    nodes_by_id: Dict[int, NavigationNode],
    adj: Dict[int, List[Tuple[int, float, NavigationEdge]]],
    start_id: int,
    goal_id: int,
) -> Optional[Tuple[List[int], float]]:
    """Run A* from *start_id* to *goal_id*.

    Returns ``(path, cost)`` or ``None`` if no path exists.
    """
    if start_id not in nodes_by_id or goal_id not in nodes_by_id:
        return None

    goal_node = nodes_by_id[goal_id]

    open_set: List[Tuple[float, int]] = []  # (f_score, node_id)
    heapq.heappush(open_set, (0.0, start_id))

    came_from: Dict[int, int] = {}
    g_score: Dict[int, float] = {start_id: 0.0}

    while open_set:
        _, current = heapq.heappop(open_set)

        if current == goal_id:
            # Reconstruct path
            path = [current]
            while current in came_from:
                current = came_from[current]
                path.append(current)
            path.reverse()
            return path, g_score[goal_id]

        for neighbor_id, cost, _edge in adj.get(current, []):
            tentative_g = g_score[current] + cost
            if tentative_g < g_score.get(neighbor_id, float("inf")):
                came_from[neighbor_id] = current
                g_score[neighbor_id] = tentative_g
                f = tentative_g + _heuristic(nodes_by_id[neighbor_id], goal_node)
                heapq.heappush(open_set, (f, neighbor_id))

    return None  # no path


# ── Turn-by-turn instruction generator ─────────────────────────────────

def _bearing(ax: float, ay: float, bx: float, by: float) -> float:
    """Compass bearing in degrees from point a to point b."""
    dx = bx - ax
    dy = by - ay
    angle = math.degrees(math.atan2(dx, -dy))  # north = up = -y
    return angle % 360


def _turn_description(prev_bearing: float, new_bearing: float) -> str:
    diff = (new_bearing - prev_bearing + 360) % 360
    if diff < 30 or diff > 330:
        return "Continue straight"
    elif 30 <= diff < 150:
        return "Turn right"
    elif 150 <= diff <= 210:
        return "Turn around"
    else:
        return "Turn left"


def build_instructions(
    path: List[int],
    nodes_by_id: Dict[int, NavigationNode],
    edge_lookup: Dict[Tuple[int, int], NavigationEdge],
) -> List[RouteStep]:
    """Generate human-readable turn-by-turn instructions for a path."""
    steps: List[RouteStep] = []
    cumulative = 0.0
    prev_bearing: Optional[float] = None

    for i, nid in enumerate(path):
        node = nodes_by_id[nid]
        edge: Optional[NavigationEdge] = None
        dist = 0.0

        if i > 0:
            prev_id = path[i - 1]
            edge = edge_lookup.get((prev_id, nid))
            if edge is None:
                edge = edge_lookup.get((nid, prev_id))
            if edge:
                dist = edge.length_meters or edge.distance

        cumulative += dist

        # Instruction text
        if i == 0:
            instruction = f"Start at {node.name or node.node_type}"
        elif i == len(path) - 1:
            instruction = f"Arrive at {node.name or node.node_type}"
        else:
            prev_node = nodes_by_id[path[i - 1]]
            bearing = _bearing(prev_node.x, prev_node.y, node.x, node.y)
            if prev_bearing is not None:
                turn = _turn_description(prev_bearing, bearing)
                instruction = f"{turn} towards {node.name or node.node_type}"
            else:
                instruction = f"Head towards {node.name or node.node_type}"
            prev_bearing = bearing

        # Update prev_bearing for the first segment too
        if i == 1 and prev_bearing is None:
            prev_node = nodes_by_id[path[0]]
            prev_bearing = _bearing(prev_node.x, prev_node.y, node.x, node.y)

        steps.append(
            RouteStep(
                node_id=nid,
                node_name=node.name or node.node_type,
                node_type=node.node_type,
                x=node.x,
                y=node.y,
                floor_id=node.floor_id,
                instruction=instruction,
                distance_meters=round(dist, 1),
                cumulative_distance=round(cumulative, 1),
                edge_type=edge.edge_type if edge else "",
            )
        )

    return steps


# ── Public API ─────────────────────────────────────────────────────────

WALKING_SPEED_MPS = 1.2  # average indoor walking speed


def compute_route(
    db: Session,
    from_node_id: int,
    to_node_id: int,
    profile_name: str = "standard",
) -> RouteResult:
    """Compute a route between two nodes, filtering by the given profile."""

    # Load profile
    profile: Optional[RoutingProfile] = None
    if profile_name != "standard":
        profile = db.exec(
            select(RoutingProfile).where(RoutingProfile.name == profile_name)
        ).first()
    else:
        profile = db.exec(
            select(RoutingProfile).where(RoutingProfile.name == "standard")
        ).first()

    # Load all nodes — cross-floor routing requires all floors
    all_nodes = db.exec(select(NavigationNode)).all()
    nodes_by_id: Dict[int, NavigationNode] = {n.id: n for n in all_nodes}

    # Load all edges
    all_edges = db.exec(select(NavigationEdge)).all()

    # Build adjacency list (filtered by profile)
    adj: Dict[int, List[Tuple[int, float, NavigationEdge]]] = {}
    edge_lookup: Dict[Tuple[int, int], NavigationEdge] = {}

    for edge in all_edges:
        if not _edge_allowed(edge, profile):
            continue
        cost = edge.cost_override if edge.cost_override is not None else edge.distance
        adj.setdefault(edge.from_node_id, []).append((edge.to_node_id, cost, edge))
        edge_lookup[(edge.from_node_id, edge.to_node_id)] = edge
        if edge.is_bidirectional:
            adj.setdefault(edge.to_node_id, []).append((edge.from_node_id, cost, edge))
            edge_lookup[(edge.to_node_id, edge.from_node_id)] = edge

    # Run A*
    result = astar(nodes_by_id, adj, from_node_id, to_node_id)
    if result is None:
        return RouteResult(found=False, profile=profile_name)

    path, total_cost = result

    # Build instructions
    steps = build_instructions(path, nodes_by_id, edge_lookup)
    total_dist = steps[-1].cumulative_distance if steps else 0.0
    est_time = round(total_dist / WALKING_SPEED_MPS / 60, 1) if total_dist > 0 else 0.0

    # Accessibility notes
    notes: List[str] = []
    edge_types_used = {s.edge_type for s in steps if s.edge_type}
    if "stairs" not in edge_types_used:
        notes.append("No stairs on this route")
    if "elevator" in edge_types_used:
        notes.append("Uses elevator")
    if profile_name == "wheelchair":
        notes.append("Wheelchair accessible route")

    return RouteResult(
        found=True,
        total_distance_meters=round(total_dist, 1),
        estimated_time_minutes=est_time,
        steps=steps,
        path_node_ids=path,
        profile=profile_name,
        accessibility_notes=notes,
    )
