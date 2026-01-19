import firebase_admin
from firebase_admin import credentials, db

# ✅ Path to your service account key (must end in .json)
cred = credentials.Certificate(r"C:\Users\Shreya\Downloads\event-pass-generator-firebase-adminsdk-fbsvc-202859f2b5.json")

# ✅ Correct Realtime DB URL (this must match your Firebase project's database URL)
firebase_admin.initialize_app(cred, {
    'databaseURL': "https://event-pass-generator-default-rtdb.firebaseio.com/"
})

# ✅ Export db reference (you’ll import this in controllers.py)
db = db
