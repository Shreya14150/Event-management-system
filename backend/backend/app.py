from flask import Flask, send_from_directory
from flask_cors import CORS
from backend.routes import api
from backend.firebase_config import db  # ensures Firebase initializes ✅
from backend import controllers
import os

# ------------------------------
# Initialize Flask
# ------------------------------
app = Flask(__name__)

# ✅ Allow frontend (Live Server) to talk to backend
CORS(app)

# ✅ Register all API routes
app.register_blueprint(api)

# ------------------------------
# Serve QR Codes if needed
# ------------------------------
QR_FOLDER = "static/qr"
os.makedirs(QR_FOLDER, exist_ok=True)

@app.route("/static/qr/<path:filename>")
def serve_qr(filename):
    return send_from_directory(QR_FOLDER, filename)

# ------------------------------
# ✅ Direct Login Route
# ------------------------------
@app.route("/api/login", methods=["POST"])
def api_login_user():
    return controllers.login_user()

# ------------------------------
# ✅ Run Flask
# ------------------------------
if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
