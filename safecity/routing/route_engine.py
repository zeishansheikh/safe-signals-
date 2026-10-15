"""NetworkX road network graph and Dijkstra shortest path routing engine.

Provides mathematically verified pathfinding across simulated road topologies,
mapping route paths directly to intersection identifiers and approach vectors.
"""

from dataclasses import dataclass
from typing import List, Dict, Any, Optional
import networkx as nx


class RoutingError(Exception):
    """Raised when routing fails due to invalid nodes or disconnected topology."""
    pass


@dataclass
class RouteIntersection:
    """An intersection traversed along the calculated emergency route."""
    node_id: str
    name: str
    incoming_approach: str  # e.g., 'NORTH_SOUTH' or 'EAST_WEST'
    travel_time_seconds: float
    distance_meters: float


@dataclass
class RouteResult:
    """Full routing calculation outcome."""
    start_node: str
    destination_node: str
    destination_name: str
    node_path: List[str]
    intersections: List[RouteIntersection]
    intersection_ids: List[str]
    total_travel_time_seconds: float
    total_distance_meters: float
    estimated_eta_minutes: float


class RoadNetworkGraph:
    """Configurable directed road network graph."""

    DESTINATION_NAMES = {
        "HOSPITAL_CITY": "City General Hospital",
        "HOSPITAL_TRAUMA": "St. Jude Trauma Center",
    }

    INTERSECTION_NAMES = {
        "INT_1": "1st Ave & Main St",
        "INT_2": "2nd Ave & Central Blvd",
        "INT_3": "3rd Ave & Hospital Way",
        "INT_4": "4th Ave & Riverside Pkwy",
        "ALT_BYPASS": "Expressway Bypass Link",
    }

    def __init__(self):
        self.graph = nx.DiGraph()
        self._build_default_topology()

    def _build_default_topology(self) -> None:
        """Construct the simulated city road network with weighted edges."""
        # Node attributes
        nodes = [
            ("START_CCTV", {"type": "camera", "name": "CCTV Detection Point"}),
            ("CCTV_CAM_1", {"type": "camera", "name": "CCTV Detection Point (Cam 1)"}),
            ("INT_1", {"type": "intersection", "name": self.INTERSECTION_NAMES["INT_1"]}),
            ("INT_2", {"type": "intersection", "name": self.INTERSECTION_NAMES["INT_2"]}),
            ("INT_3", {"type": "intersection", "name": self.INTERSECTION_NAMES["INT_3"]}),
            ("INT_4", {"type": "intersection", "name": self.INTERSECTION_NAMES["INT_4"]}),
            ("ALT_BYPASS", {"type": "waypoint", "name": self.INTERSECTION_NAMES["ALT_BYPASS"]}),
            ("HOSPITAL_CITY", {"type": "hospital", "name": self.DESTINATION_NAMES["HOSPITAL_CITY"]}),
            ("HOSPITAL_TRAUMA", {"type": "hospital", "name": self.DESTINATION_NAMES["HOSPITAL_TRAUMA"]}),
            ("DISCONNECTED_NODE", {"type": "isolated", "name": "Isolated Sector 9"}),
        ]
        self.graph.add_nodes_from(nodes)

        # Edges with positive travel_time (seconds), distance (meters), and intersection approach
        edges = [
            # Primary arterial to City General Hospital
            ("START_CCTV", "INT_1", {"travel_time": 25.0, "distance": 350.0, "approach": "NORTH_SOUTH"}),
            ("CCTV_CAM_1", "INT_1", {"travel_time": 25.0, "distance": 350.0, "approach": "NORTH_SOUTH"}),
            ("INT_1", "INT_2", {"travel_time": 30.0, "distance": 420.0, "approach": "EAST_WEST"}),
            ("INT_2", "INT_3", {"travel_time": 20.0, "distance": 280.0, "approach": "NORTH_SOUTH"}),
            ("INT_3", "HOSPITAL_CITY", {"travel_time": 15.0, "distance": 200.0, "approach": "EAST_WEST"}),

            # Secondary links and bypass to Trauma Center
            ("INT_1", "ALT_BYPASS", {"travel_time": 45.0, "distance": 600.0, "approach": "NORTH_SOUTH"}),
            ("ALT_BYPASS", "INT_4", {"travel_time": 35.0, "distance": 480.0, "approach": "EAST_WEST"}),
            ("INT_4", "HOSPITAL_TRAUMA", {"travel_time": 25.0, "distance": 320.0, "approach": "NORTH_SOUTH"}),
            ("INT_3", "HOSPITAL_TRAUMA", {"travel_time": 30.0, "distance": 390.0, "approach": "NORTH_SOUTH"}),

            # Reverse flows for realism
            ("INT_3", "INT_2", {"travel_time": 22.0, "distance": 280.0, "approach": "NORTH_SOUTH"}),
            ("INT_2", "INT_1", {"travel_time": 32.0, "distance": 420.0, "approach": "EAST_WEST"}),
        ]
        self.graph.add_edges_from([(u, v, d) for u, v, d in edges])

    def get_available_destinations(self) -> Dict[str, str]:
        """Return mapping of valid destination IDs to human-readable names."""
        return self.DESTINATION_NAMES.copy()

    def calculate_route(self, start_node: str, destination_node: str) -> RouteResult:
        """Compute the shortest path using Dijkstra's algorithm.

        Args:
            start_node: Origin identifier (e.g., 'START_CCTV').
            destination_node: Destination hospital identifier.

        Returns:
            RouteResult with node order, intersection approaches, and simulated ETA.

        Raises:
            RoutingError: If nodes do not exist or no valid path connects them.
        """
        if start_node not in self.graph:
            raise RoutingError(f"Origin node '{start_node}' not found in road network.")
        if destination_node not in self.graph:
            raise RoutingError(f"Destination node '{destination_node}' not found in road network.")

        try:
            path = nx.dijkstra_path(self.graph, start_node, destination_node, weight="travel_time")
        except nx.NetworkXNoPath:
            raise RoutingError(
                f"No connected route exists between '{start_node}' and '{destination_node}'."
            )

        # Aggregate path metrics and map intersection approaches
        intersections: List[RouteIntersection] = []
        total_time = 0.0
        total_dist = 0.0

        for i in range(len(path) - 1):
            u, v = path[i], path[i + 1]
            edge_data = self.graph[u][v]
            t = float(edge_data.get("travel_time", 0.0))
            d = float(edge_data.get("distance", 0.0))
            total_time += t
            total_dist += d

            # If the destination of this edge is an intersection, record its entry approach
            if v in self.INTERSECTION_NAMES:
                approach = edge_data.get("approach", "NORTH_SOUTH")
                intersections.append(RouteIntersection(
                    node_id=v,
                    name=self.INTERSECTION_NAMES[v],
                    incoming_approach=approach,
                    travel_time_seconds=t,
                    distance_meters=d,
                ))

        eta_minutes = round(total_time / 60.0, 1)
        dest_name = self.DESTINATION_NAMES.get(destination_node, destination_node)

        return RouteResult(
            start_node=start_node,
            destination_node=destination_node,
            destination_name=dest_name,
            node_path=path,
            intersections=intersections,
            intersection_ids=[item.node_id for item in intersections],
            total_travel_time_seconds=total_time,
            total_distance_meters=total_dist,
            estimated_eta_minutes=eta_minutes,
        )
