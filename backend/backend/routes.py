


from flask import Blueprint
from backend.controllers import register_user, login_user, list_events, register_event, add_event
from backend.controllers import cancel_registration

from backend.controllers import (
    register_user,
    login_user,
    list_events,
    register_event,
    add_event,
    cancel_registration,
    pause_event,
    delete_event
)



api = Blueprint("api", __name__)

# 🔹 Auth routes
@api.route("/api/register", methods=["POST"])
def register_user_route():
    return register_user()

@api.route("/api/login", methods=["POST"])
def login_user_route():
    return login_user()

# 🔹 Event routes
@api.route("/api/events", methods=["GET"])   
def list_events_route():
    return list_events()

@api.route("/api/register_event", methods=["POST"])
def register_event_route():
    return register_event()

@api.route("/api/add_event", methods=["POST"])
def add_event_route():
    return add_event()


@api.route("/api/verify_qr", methods=["POST"])
def verify_qr_route():
    from backend.controllers import verify_qr
    return verify_qr()


@api.route("/api/cancel_registration", methods=["POST"])
def cancel_registration_route():
    return cancel_registration()

# 🔹 Manager actions
@api.route("/api/pause_event", methods=["POST"])
def pause_event_route():
    return pause_event()

@api.route("/api/delete_event", methods=["POST"])
def delete_event_route():
    return delete_event()
