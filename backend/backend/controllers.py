from flask import request, jsonify
from backend.firebase_config import db
from backend.utils.tokenGenerator import generate_token
import qrcode
import io
import base64
import os
from datetime import datetime


# --------------------------
# ✅ Register a new user
# --------------------------
def register_user():
    data = request.json
    ref = db.reference("users")

    users = ref.order_by_child("email").equal_to(data["email"]).get()
    if users:
        return jsonify({"error": "User already exists"}), 400

    user_id = generate_token()
    user_data = {
        "id": user_id,
        "name": data["name"],
        "email": data["email"],
        "password": data["password"],  # stored for login verification
        "role": data.get("role", "student"),
    }

    ref.child(user_id).set(user_data)
    print(f"✅ User registered: {data['email']} ({user_data['role']})")
    return jsonify({"message": "User registered successfully", "user": user_data}), 200


# --------------------------
# ✅ Login user
# --------------------------
def login_user():
    try:
        data = request.json
        email = data.get("email")
        password = data.get("password")
        role = data.get("role")

        if not all([email, password, role]):
            return jsonify({"error": "All fields are required"}), 400

        ref = db.reference("users")
        users = ref.order_by_child("email").equal_to(email).get()

        if not users:
            return jsonify({"error": "User not found"}), 404

        for user_id, user in users.items():
            if user.get("password") == password and user.get("role") == role:
                print(f"✅ Login success: {email} ({role})")
                return jsonify({
                    "message": "Login successful!",
                    "user": {
                        "id": user_id,
                        "name": user["name"],
                        "email": user["email"],
                        "role": user["role"]
                    }
                }), 200

        return jsonify({"error": "Invalid email, password, or role"}), 401

    except Exception as e:
        print("⚠️ Login error:", e)
        return jsonify({"error": str(e)}), 500


# --------------------------
# ✅ List all events
# --------------------------
def list_events():
    try:
        ref = db.reference("events")
        events = ref.get()

        if not events:
            return jsonify([]), 200

        # Query params
        search = request.args.get("search", "").lower()
        sort = request.args.get("sort", "").lower()

        event_list = []

        for event_id, event in events.items():
            registered = event.get("registeredUsers", [])
            capacity = int(event.get("capacity", 0))

            total_registered = len(registered)
            seats_left = capacity - total_registered

            searchable_text = (
                event.get("name", "") +
                event.get("description", "") +
                event.get("venue", "")
            ).lower()

            # Search filter
            if search and search not in searchable_text:
                continue

            event_list.append({
                **event,
                "total_registered": total_registered,
                "seats_left": seats_left
            })

        # Sorting logic
        if sort == "upcoming":
            event_list.sort(
                key=lambda e: datetime.strptime(e["date"], "%Y-%m-%d")
            )

        elif sort == "popular":
            event_list.sort(
                key=lambda e: e["total_registered"],
                reverse=True
            )

        elif sort == "seats":
            event_list.sort(
                key=lambda e: e["seats_left"]
            )

        return jsonify(event_list), 200

    except Exception as e:
        print("⚠️ Error fetching events:", e)
        return jsonify({"error": str(e)}), 500




# --------------------------
# ✅ Add a new event
# --------------------------
def add_event():
    data = request.json
    required = ["name", "description", "date", "time", "venue", "capacity", "manager_id"]
    if not all(data.get(field) for field in required):
        return jsonify({"error": "All fields are required"}), 400

    events_ref = db.reference("events")
    event_id = generate_token()

    new_event = {
    "id": event_id,
    "name": data["name"],
    "description": data["description"],
    "date": data["date"],
    "time": data["time"],
    "venue": data["venue"],
    "capacity": int(data["capacity"]),
    "manager_id": data["manager_id"],
    "isPaused": False,
    "registeredUsers": []
}


    events_ref.child(event_id).set(new_event)
    return jsonify({"message": "Event created successfully!"}), 200


# --------------------------
# ✅ Register a user for an event + generate Base64 QR
# --------------------------
def register_event():
    data = request.json
    required = ["user_id", "event_id", "name", "email"]
    if not all(data.get(field) for field in required):
        return jsonify({"error": "Missing required fields"}), 400

    events_ref = db.reference("events")
    event = events_ref.child(data["event_id"]).get()

    if not event:
        return jsonify({"error": "Event not found"}), 404

    registered = event.get("registeredUsers", [])
    if any(u.get("user_id") == data["user_id"] for u in registered):
        return jsonify({"error": "Already registered"}), 400

    if len(registered) >= event.get("capacity", 0):
        return jsonify({"error": "Event full"}), 400

    registered.append({
        "user_id": data["user_id"],
        "name": data["name"],
        "email": data["email"]
    })

    event["registeredUsers"] = registered
    events_ref.child(data["event_id"]).update(event)

    qr_data = f"Event: {event['name']}\nName: {data['name']}\nEmail: {data['email']}\nEvent ID: {data['event_id']}"
    qr_img = qrcode.make(qr_data)

    buffer = io.BytesIO()
    qr_img.save(buffer, format="PNG")
    qr_base64 = base64.b64encode(buffer.getvalue()).decode("utf-8")
    qr_data_uri = f"data:image/png;base64,{qr_base64}"

    return jsonify({
        "message": "Registration successful!",
        "qr_data_uri": qr_data_uri
    }), 200


# --------------------------
# ✅ Verify QR code data
# --------------------------
def verify_qr():
    try:
        data = request.json
        qr_text = data.get("qr_text")

        if not qr_text:
            return jsonify({"error": "QR data missing"}), 400

        # Parse the QR text (assuming format same as you generated)
        lines = qr_text.split("\n")
        event_name = lines[0].replace("Event: ", "").strip()
        student_name = lines[1].replace("Name: ", "").strip()
        email = lines[2].replace("Email: ", "").strip()
        event_id = lines[3].replace("Event ID: ", "").strip()

        # Look up event in Firebase
        events_ref = db.reference("events")
        event = events_ref.child(event_id).get()

        if not event:
            return jsonify({"error": "Event not found"}), 404

        # Check if student is registered
        registered_users = event.get("registeredUsers", [])
        for user in registered_users:
            if user["email"] == email and user["name"] == student_name:
                return jsonify({
                    "message": "QR verified successfully!",
                    "event": event_name,
                    "student": student_name,
                    "email": email
                }), 200

        return jsonify({"error": "Student not registered for this event"}), 404

    except Exception as e:
        print("⚠️ QR verify error:", e)
        return jsonify({"error": str(e)}), 500


# --------------------------
#  Cancel event registration
# --------------------------
def cancel_registration():
    data = request.json
    required = ["user_id", "event_id"]

    if not all(data.get(field) for field in required):
        return jsonify({"error": "Missing required fields"}), 400

    events_ref = db.reference("events")
    event = events_ref.child(data["event_id"]).get()

    if not event:
        return jsonify({"error": "Event not found"}), 404

    # ✅ Check event date (no cancel after event date)
    try:
        event_date = datetime.strptime(event["date"], "%Y-%m-%d").date()
        today = datetime.today().date()

        if today >= event_date:
            return jsonify({"error": "Cannot cancel after event date"}), 400
    except Exception:
        return jsonify({"error": "Invalid event date format"}), 500

    registered = event.get("registeredUsers", [])

    # ✅ Check user registration
    updated_users = [
        u for u in registered if u.get("user_id") != data["user_id"]
    ]

    if len(registered) == len(updated_users):
        return jsonify({"error": "User not registered for this event"}), 400

    # ✅ Update event (seat automatically freed)
    event["registeredUsers"] = updated_users
    events_ref.child(data["event_id"]).update(event)

    return jsonify({"message": "Registration cancelled successfully"}), 200

# --------------------------
#  Pause / Resume Event
# --------------------------
def pause_event():
    data = request.json
    event_id = data.get("event_id")
    is_paused = data.get("isPaused")

    if event_id is None or is_paused is None:
        return jsonify({"error": "Missing event_id or isPaused"}), 400

    events_ref = db.reference("events")
    event = events_ref.child(event_id).get()

    if not event:
        return jsonify({"error": "Event not found"}), 404

    events_ref.child(event_id).update({
        "isPaused": bool(is_paused)
    })

    return jsonify({"message": "Event status updated"}), 200


# --------------------------
#  Delete Event
# --------------------------
def delete_event():
    data = request.json
    event_id = data.get("event_id")

    if not event_id:
        return jsonify({"error": "Missing event_id"}), 400

    events_ref = db.reference("events")
    event = events_ref.child(event_id).get()

    if not event:
        return jsonify({"error": "Event not found"}), 404

    events_ref.child(event_id).delete()

    return jsonify({"message": "Event deleted successfully"}), 200
