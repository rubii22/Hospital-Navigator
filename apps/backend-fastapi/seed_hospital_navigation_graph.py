import sys
from sqlmodel import Session, select
from app.core.database import engine
from app.models import (
    Hospital,
    Floor,
    Room,
    NavigationNode,
    NavigationEdge,
    QRAnchor,
)

def seed_navigation_graph():
    with Session(engine) as db:
        print("Populating Navigation Nodes & Edges for St. Jude Metropolitan Medical Center (ID: 5)...")
        
        # Check floor IDs
        floors = db.exec(select(Floor).where(Floor.building_id.in_([8, 9]))).all()
        floor_dict = {f.floor_number: f for f in floors}
        
        # Floor 0: Ground Floor (Floor ID: 8)
        f0 = floor_dict.get(0)
        # Floor 1: Floor 1 (Floor ID: 9)
        f1 = floor_dict.get(1)
        # Floor 2: Floor 2 (Floor ID: 10)
        f2 = floor_dict.get(2)
        # Floor 3: Floor 3 (Floor ID: 11)
        f3 = floor_dict.get(3)

        floor_rooms = {
            f.id: db.exec(select(Room).where(Room.floor_id == f.id)).all() for f in floors
        }

        # Clear existing nodes & edges for these floors
        floor_ids = [f.id for f in floors]
        existing_nodes = db.exec(select(NavigationNode).where(NavigationNode.floor_id.in_(floor_ids))).all()
        existing_node_ids = [n.id for n in existing_nodes if n.id is not None]
        
        if existing_node_ids:
            # Delete existing anchors
            anchors = db.exec(select(QRAnchor).where(QRAnchor.node_id.in_(existing_node_ids))).all()
            for a in anchors:
                db.delete(a)
            # Delete edges
            edges = db.exec(
                select(NavigationEdge).where(
                    (NavigationEdge.from_node_id.in_(existing_node_ids)) | 
                    (NavigationEdge.to_node_id.in_(existing_node_ids))
                )
            ).all()
            for e in edges:
                db.delete(e)
            for n in existing_nodes:
                db.delete(n)
            db.commit()

        # Seed Floor 0: Ground Floor
        # Layout (in meters, 0 to 60 x 0 to 40)
        # Nodes:
        # N_G_ENT (10, 30) - Main Entrance QR Anchor
        # N_G_COR_1 (20, 30) - Main Corridor West
        # N_G_COR_2 (35, 30) - Central Junction
        # N_G_COR_3 (50, 30) - Main Corridor East
        # N_G_ELEV (35, 38) - Ground Floor Elevator Lobby
        # N_G_STAIRS (20, 38) - Ground Floor Stairwell
        # N_G_R5 (10, 15) - Main Triage (Room 5)
        # N_G_R6 (25, 15) - Central Pharmacy (Room 6)
        # N_G_R7 (40, 15) - Emergency Trauma Bay (Room 7)
        # N_G_R8 (55, 15) - X-Ray & Radiology (Room 8)
        
        created_nodes = {}
        
        def add_node(f_id, node_type, name, code, x, y, z=0.0, r_id=None, is_acc=True):
            node = NavigationNode(
                floor_id=f_id,
                node_type=node_type,
                name=name,
                code=code,
                x=x,
                y=y,
                z=z,
                room_id=r_id,
                is_accessible=is_acc,
                status="active"
            )
            db.add(node)
            db.flush()
            created_nodes[code] = node
            return node

        def add_edge(n1_code, n2_code, edge_type="corridor", dist=10.0, is_acc=True):
            n1 = created_nodes[n1_code]
            n2 = created_nodes[n2_code]
            # Euclidean distance if default
            if dist == 10.0:
                dist = round(((n1.x - n2.x)**2 + (n1.y - n2.y)**2)**0.5, 1)
            edge = NavigationEdge(
                from_node_id=n1.id,
                to_node_id=n2.id,
                edge_type=edge_type,
                distance=dist,
                is_accessible=is_acc,
                is_bidirectional=True
            )
            db.add(edge)
            # Bidirectional reverse edge
            rev_edge = NavigationEdge(
                from_node_id=n2.id,
                to_node_id=n1.id,
                edge_type=edge_type,
                distance=dist,
                is_accessible=is_acc,
                is_bidirectional=True
            )
            db.add(rev_edge)

        if f0:
            print(f"Building nodes for Ground Floor (ID: {f0.id})...")
            r_g0 = floor_rooms[f0.id]
            r5 = next((r for r in r_g0 if r.id == 5), None)
            r6 = next((r for r in r_g0 if r.id == 6), None)
            r7 = next((r for r in r_g0 if r.id == 7), None)
            r8 = next((r for r in r_g0 if r.id == 8), None)

            add_node(f0.id, "anchor", "Main Entrance QR Anchor", "N_G_ENT", 10.0, 30.0)
            add_node(f0.id, "corridor", "West Hallway Junction", "N_G_COR_1", 22.0, 30.0)
            add_node(f0.id, "junction", "Central Lobby Spine", "N_G_COR_2", 36.0, 30.0)
            add_node(f0.id, "corridor", "East Imaging Corridor", "N_G_COR_3", 50.0, 30.0)
            add_node(f0.id, "elevator", "Elevator Bank A (Ground)", "N_G_ELEV", 36.0, 38.0)
            add_node(f0.id, "stairs", "Stairwell West (Ground)", "N_G_STAIRS", 22.0, 38.0, is_acc=False)

            if r5:
                add_node(f0.id, "door", "Triage Entrance", "N_G_D_R5", 12.0, 24.0, r_id=r5.id)
                add_node(f0.id, "room", r5.name, "N_G_R5", 10.0, 14.0, r_id=r5.id)
            if r6:
                add_node(f0.id, "door", "Pharmacy Service Counter", "N_G_D_R6", 24.0, 24.0, r_id=r6.id)
                add_node(f0.id, "room", r6.name, "N_G_R6", 24.0, 14.0, r_id=r6.id)
            if r7:
                add_node(f0.id, "door", "Trauma Bay Doors", "N_G_D_R7", 38.0, 24.0, r_id=r7.id)
                add_node(f0.id, "room", r7.name, "N_G_R7", 38.0, 14.0, r_id=r7.id)
            if r8:
                add_node(f0.id, "door", "Radiology Suite Entrance", "N_G_D_R8", 50.0, 24.0, r_id=r8.id)
                add_node(f0.id, "room", r8.name, "N_G_R8", 50.0, 14.0, r_id=r8.id)

            # Ground Floor Edges
            add_edge("N_G_ENT", "N_G_COR_1")
            add_edge("N_G_COR_1", "N_G_COR_2")
            add_edge("N_G_COR_2", "N_G_COR_3")
            add_edge("N_G_COR_2", "N_G_ELEV", edge_type="elevator")
            add_edge("N_G_COR_1", "N_G_STAIRS", edge_type="stairs", is_acc=False)

            if r5:
                add_edge("N_G_ENT", "N_G_D_R5", edge_type="door")
                add_edge("N_G_D_R5", "N_G_R5", edge_type="room")
            if r6:
                add_edge("N_G_COR_1", "N_G_D_R6", edge_type="door")
                add_edge("N_G_D_R6", "N_G_R6", edge_type="room")
            if r7:
                add_edge("N_G_COR_2", "N_G_D_R7", edge_type="door")
                add_edge("N_G_D_R7", "N_G_R7", edge_type="room")
            if r8:
                add_edge("N_G_COR_3", "N_G_D_R8", edge_type="door")
                add_edge("N_G_D_R8", "N_G_R8", edge_type="room")

        # Seed Floor 1 (ID: 9)
        if f1:
            print(f"Building nodes for Floor 1 (ID: {f1.id})...")
            r_g1 = floor_rooms[f1.id]
            r9 = next((r for r in r_g1 if r.id == 9), None)
            r10 = next((r for r in r_g1 if r.id == 10), None)
            r11 = next((r for r in r_g1 if r.id == 11), None)

            add_node(f1.id, "elevator", "Elevator Bank A (Floor 1)", "N_1_ELEV", 36.0, 38.0, z=3.5)
            add_node(f1.id, "stairs", "Stairwell West (Floor 1)", "N_1_STAIRS", 22.0, 38.0, z=3.5, is_acc=False)
            add_node(f1.id, "junction", "Floor 1 Central Lobby", "N_1_COR_2", 36.0, 30.0, z=3.5)
            add_node(f1.id, "corridor", "Floor 1 West Hallway", "N_1_COR_1", 20.0, 30.0, z=3.5)
            add_node(f1.id, "corridor", "Floor 1 East Hallway", "N_1_COR_3", 50.0, 30.0, z=3.5)

            if r9:
                add_node(f1.id, "door", "Phlebotomy Entrance", "N_1_D_R9", 20.0, 24.0, z=3.5, r_id=r9.id)
                add_node(f1.id, "room", r9.name, "N_1_R9", 20.0, 14.0, z=3.5, r_id=r9.id)
            if r10:
                add_node(f1.id, "door", "Specialist Suite 108 Door", "N_1_D_R10", 36.0, 24.0, z=3.5, r_id=r10.id)
                add_node(f1.id, "room", r10.name, "N_1_R10", 36.0, 14.0, z=3.5, r_id=r10.id)
            if r11:
                add_node(f1.id, "door", "Pediatric Clinic Door", "N_1_D_R11", 50.0, 24.0, z=3.5, r_id=r11.id)
                add_node(f1.id, "room", r11.name, "N_1_R11", 50.0, 14.0, z=3.5, r_id=r11.id)

            add_edge("N_1_ELEV", "N_1_COR_2", edge_type="elevator")
            add_edge("N_1_STAIRS", "N_1_COR_1", edge_type="stairs", is_acc=False)
            add_edge("N_1_COR_1", "N_1_COR_2")
            add_edge("N_1_COR_2", "N_1_COR_3")

            if r9:
                add_edge("N_1_COR_1", "N_1_D_R9", edge_type="door")
                add_edge("N_1_D_R9", "N_1_R9", edge_type="room")
            if r10:
                add_edge("N_1_COR_2", "N_1_D_R10", edge_type="door")
                add_edge("N_1_D_R10", "N_1_R10", edge_type="room")
            if r11:
                add_edge("N_1_COR_3", "N_1_D_R11", edge_type="door")
                add_edge("N_1_D_R11", "N_1_R11", edge_type="room")

        # Seed Floor 2: Floor 2 (ID: 10)
        if f2:
            print(f"Building nodes for Floor 2 (ID: {f2.id})...")
            r_g2 = floor_rooms[f2.id]
            r12 = next((r for r in r_g2 if r.id == 12), None)
            r13 = next((r for r in r_g2 if r.id == 13), None)
            r14 = next((r for r in r_g2 if r.id == 14), None)

            add_node(f2.id, "elevator", "Elevator Bank A (Floor 2)", "N_2_ELEV", 36.0, 38.0, z=7.0)
            add_node(f2.id, "stairs", "Stairwell West (Floor 2)", "N_2_STAIRS", 22.0, 38.0, z=7.0, is_acc=False)
            add_node(f2.id, "junction", "Floor 2 Central Hallway", "N_2_COR_2", 36.0, 30.0, z=7.0)
            add_node(f2.id, "corridor", "Cardiology Wing", "N_2_COR_1", 20.0, 30.0, z=7.0)
            add_node(f2.id, "corridor", "Advanced Imaging Wing", "N_2_COR_3", 52.0, 30.0, z=7.0)

            if r12:
                add_node(f2.id, "door", "Cardiology OPD Door", "N_2_D_R12", 20.0, 24.0, z=7.0, r_id=r12.id)
                add_node(f2.id, "room", r12.name, "N_2_R12", 20.0, 14.0, z=7.0, r_id=r12.id)
            if r13:
                add_node(f2.id, "door", "Cath Lab Airlock Door", "N_2_D_R13", 36.0, 24.0, z=7.0, r_id=r13.id)
                add_node(f2.id, "room", r13.name, "N_2_R13", 36.0, 14.0, z=7.0, r_id=r13.id)
            if r14:
                add_node(f2.id, "door", "MRI Suite Shielded Door", "N_2_D_R14", 52.0, 24.0, z=7.0, r_id=r14.id)
                add_node(f2.id, "room", r14.name, "N_2_R14", 52.0, 14.0, z=7.0, r_id=r14.id)

            add_edge("N_2_ELEV", "N_2_COR_2", edge_type="elevator")
            add_edge("N_2_STAIRS", "N_2_COR_1", edge_type="stairs", is_acc=False)
            add_edge("N_2_COR_1", "N_2_COR_2")
            add_edge("N_2_COR_2", "N_2_COR_3")

            if r12:
                add_edge("N_2_COR_1", "N_2_D_R12", edge_type="door")
                add_edge("N_2_D_R12", "N_2_R12", edge_type="room")
            if r13:
                add_edge("N_2_COR_2", "N_2_D_R13", edge_type="door")
                add_edge("N_2_D_R13", "N_2_R13", edge_type="room")
            if r14:
                add_edge("N_2_COR_3", "N_2_D_R14", edge_type="door")
                add_edge("N_2_D_R14", "N_2_R14", edge_type="room")

        # Seed Floor 3: Floor 3 (ID: 11)
        if f3:
            print(f"Building nodes for Floor 3 (ID: {f3.id})...")
            r_g3 = floor_rooms[f3.id]
            r15 = next((r for r in r_g3 if r.id == 15), None)
            r16 = next((r for r in r_g3 if r.id == 16), None)

            add_node(f3.id, "elevator", "Elevator Bank A (Floor 3)", "N_3_ELEV", 36.0, 38.0, z=10.5)
            add_node(f3.id, "stairs", "Stairwell West (Floor 3)", "N_3_STAIRS", 22.0, 38.0, z=10.5, is_acc=False)
            add_node(f3.id, "junction", "ICU Main Access Lobby", "N_3_COR_2", 36.0, 30.0, z=10.5)
            add_node(f3.id, "corridor", "ICU East Corridor", "N_3_COR_3", 50.0, 30.0, z=10.5)

            if r15:
                add_node(f3.id, "door", "ICU 301 Double Doors", "N_3_D_R15", 36.0, 24.0, z=10.5, r_id=r15.id)
                add_node(f3.id, "room", r15.name, "N_3_R15", 36.0, 14.0, z=10.5, r_id=r15.id)
            if r16:
                add_node(f3.id, "door", "Post-Op Recovery Door", "N_3_D_R16", 50.0, 24.0, z=10.5, r_id=r16.id)
                add_node(f3.id, "room", r16.name, "N_3_R16", 50.0, 14.0, z=10.5, r_id=r16.id)

            add_edge("N_3_ELEV", "N_3_COR_2", edge_type="elevator")
            add_edge("N_3_STAIRS", "N_3_COR_2", edge_type="stairs", is_acc=False)
            add_edge("N_3_COR_2", "N_3_COR_3")

            if r15:
                add_edge("N_3_COR_2", "N_3_D_R15", edge_type="door")
                add_edge("N_3_D_R15", "N_3_R15", edge_type="room")
            if r16:
                add_edge("N_3_COR_3", "N_3_D_R16", edge_type="door")
                add_edge("N_3_D_R16", "N_3_R16", edge_type="room")

        # Connect inter-floor elevator & stairs edges
        if f0 and f1:
            add_edge("N_G_ELEV", "N_1_ELEV", edge_type="elevator", dist=3.5)
            add_edge("N_G_STAIRS", "N_1_STAIRS", edge_type="stairs", dist=5.0, is_acc=False)
        if f1 and f2:
            add_edge("N_1_ELEV", "N_2_ELEV", edge_type="elevator", dist=3.5)
            add_edge("N_1_STAIRS", "N_2_STAIRS", edge_type="stairs", dist=5.0, is_acc=False)
        if f2 and f3:
            add_edge("N_2_ELEV", "N_3_ELEV", edge_type="elevator", dist=3.5)
            add_edge("N_2_STAIRS", "N_3_STAIRS", edge_type="stairs", dist=5.0, is_acc=False)

        db.commit()
        print("Successfully created navigation graph for Hospital 5!")

if __name__ == "__main__":
    seed_navigation_graph()
