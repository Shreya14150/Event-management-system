# Event-management-system

A full-stack web application designed to simplify how college events are created, managed, and attended.
The platform supports Event Managers and Students, offering smooth event registration with QR-code based verification.

# *Project Overview*

Managing campus events manually is slow, error-prone, and inefficient.
This system provides a centralized digital solution where:
Event Managers can create, control, and monitor events
Students can discover events and register instantly
QR codes ensure secure and quick event entry


# *User Roles*
Event Manager

Create events with full details (name, venue, date, time, capacity)
View all created events in a personal dashboard
Pause or resume event registrations
Delete events when required
Scan QR codes to verify attendees

 Student

Browse all available events
Search events easily
Register for events in one click
Receive a unique QR code as an event pass
Download QR code for offline access
Cancel registration before the event starts


# *Key Features*

Role-based authentication (Student / Manager)
Modern glassmorphism UI with background images
Real-time seat availability tracking
Secure QR code generation for registrations
QR scanning for entry validation
Event search functionality
Responsive and user-friendly design

# *Tech Stack*
Frontend-
HTML5
CSS3
JavaScript (ES6)
Tailwind CSS

Backend-
Python (Flask)
RESTful APIs
Database & Services
Firebase (Authentication / Data storage)
QR Code generation & scanning


# *How It Works*

🔄 How the Website Works (Page by Page)
1️⃣ Landing Page (Login / Signup)-
This is the first page users see.
Users can log in or sign up.
While logging in, users choose a role:
Student
Event Manager
Based on the selected role, the user is redirected to the correct dashboard.

<img width="700" height="500" alt="Screenshot 2026-01-19 212218" src="https://github.com/user-attachments/assets/adc1788f-b10c-4003-9f18-b98da5234a32" />

<img width="700" height="500" alt="Screenshot 2026-01-19 212312" src="https://github.com/user-attachments/assets/33f061b6-84cc-4511-9577-8b07d7ada087" />




2️⃣ Event Manager Dashboard-
After logging in as an Event Manager, this page opens.
The manager can:
Create a new event by entering:
Event name
Description
Venue
Date and time
Capacity
Submit the form to create the event.
All events are stored in the backend and linked to the manager.

<img width="700" height="500" alt="Screenshot 2026-01-19 212657" src="https://github.com/user-attachments/assets/8b2eaf78-ddea-468b-8b9e-5937ded5af64" />



3️⃣ View My Events (Manager)-
From the profile menu, the manager can open “My Events”.
This page shows only the events created by that manager.
For each event, the manager can:
See registered users count
See available seats
Pause or resume registrations
Delete the event.

<img width="700" height="500" alt="Screenshot 2026-01-19 212742" src="https://github.com/user-attachments/assets/1a96106f-64f8-426a-a6a8-7406e5239224" />



4️⃣ QR Scanner Page (Manager)
Managers can open the QR Scanner page.
QR codes shown by students are scanned here.
The system verifies whether the QR code is valid.
This ensures secure and fast event entry.

<img width="400" height="500" alt="image" src="https://github.com/user-attachments/assets/ec5c8a0b-b096-4efe-9295-3a525da4177a" />



5️⃣ Available Events Page (Student)-
After logging in as a Student, this page opens.
Students can:
View all available events
Search events using the search bar
See all the event details:
Name
Description
Date & time
Venue
Seats left

<img width="700" height="500" alt="Screenshot 2026-01-19 212830" src="https://github.com/user-attachments/assets/6cb780e9-0cf2-4813-a6db-9f9a93ecfc5c" />


6️⃣ Event Registration (Student)-
When a student clicks Register:
A registration modal opens
Student enters name and email
After successful registration:
A QR code is generated
Student can download the QR code
This QR code acts as the event pass.

<img width="700" height="500" alt="Screenshot 2026-01-19 212854" src="https://github.com/user-attachments/assets/689936bd-7b69-4bd5-a464-cea887dc9739" />


7️⃣ Registration Status Handling-
If the student is already registered:
“Registered” status is shown
Option to cancel registration (before event starts)
If seats are full:
“No Seats Available” message is shown
If the manager paused registrations:
“Registration Paused” message is shown.

<img width="700" height="500" alt="Screenshot 2026-01-19 212909" src="https://github.com/user-attachments/assets/d7cf50bb-9411-4230-891d-7c554ae02600" />


8️⃣ Logout
Both students and managers can log out.
Local session data is cleared.
User is redirected back to the landing page.
