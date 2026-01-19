console.log("✅ manager.js loaded");

/* ================================
   AUTH CHECK (FIXED)
================================ */

// Get user object saved by auth.js
const user = JSON.parse(localStorage.getItem("user"));
const managerId = user?.id;

// Not logged in or not manager
if (!managerId || user.role !== "manager") {
  alert("⚠️ Please log in as an Event Manager first.");
  window.location.href = "index.html";
}

/* ================================
   ELEMENTS
================================ */
const profileIcon = document.getElementById("profileIcon");
const profileDropdown = document.getElementById("profileDropdown");
const viewEventsBtn = document.getElementById("viewEventsBtn");
const logoutBtn = document.getElementById("logoutBtn");

const createEventSection = document.getElementById("createEventSection");
const myEventsSection = document.getElementById("myEventsSection");
const eventsContainer = document.getElementById("eventsContainer");

const createEventForm = document.getElementById("createEventForm");

/* ================================
   PROFILE DROPDOWN
================================ */
profileIcon.addEventListener("click", () => {
  profileDropdown.style.display =
    profileDropdown.style.display === "block" ? "none" : "block";
});

document.addEventListener("click", (e) => {
  if (!profileIcon.contains(e.target) && !profileDropdown.contains(e.target)) {
    profileDropdown.style.display = "none";
  }
});

/* ================================
   VIEW SWITCHING
================================ */
viewEventsBtn.addEventListener("click", () => {
  createEventSection.classList.add("hidden");
  myEventsSection.classList.remove("hidden");
  profileDropdown.style.display = "none";
  fetchMyEvents();
});

logoutBtn.addEventListener("click", () => {
  localStorage.clear();
  window.location.href = "index.html";
});

/* ================================
   CREATE EVENT (12hr → 24hr)
================================ */
createEventForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const timeInput = document.getElementById("eventTime").value;
  const period = document.getElementById("eventPeriod").value;

  let [hours, minutes] = timeInput.split(":").map(Number);

  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;

  const formattedTime = `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}`;

  const payload = {
    name: document.getElementById("eventName").value.trim(),
    description: document.getElementById("eventDescription").value.trim(),
    venue: document.getElementById("eventVenue").value.trim(),
    date: document.getElementById("eventDate").value,
    time: formattedTime,
    capacity: document.getElementById("eventCapacity").value,
    manager_id: managerId,
  };

  const res = await fetch("http://127.0.0.1:5000/api/add_event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (res.ok) {
    alert("✅ Event created successfully");
    createEventForm.reset();
  } else {
    alert(data.error || "❌ Failed to create event");
  }
});

/* ================================
   FETCH EVENTS (FIXED FILTER)
================================ */
async function fetchMyEvents() {
  eventsContainer.innerHTML =
    "<p class='text-slate-400'>Loading events...</p>";

  const res = await fetch("http://127.0.0.1:5000/api/events");
  const events = await res.json();

  const now = new Date();

  const myActiveEvents = events.filter((event) => {
    // 🔴 FIX: string vs number comparison
    if (String(event.manager_id) !== String(managerId)) return false;

    const eventDateTime = new Date(`${event.date}T${event.time}`);
    return eventDateTime >= now;
  });

  renderMyEvents(myActiveEvents);
}

/* ================================
   RENDER EVENTS
================================ */
function renderMyEvents(events) {
  eventsContainer.innerHTML = "";

  if (events.length === 0) {
    eventsContainer.innerHTML =
      "<p class='text-slate-400'>No active events available.</p>";
    return;
  }

  events.forEach((event) => {
    const registered = event.registeredUsers?.length || 0;
    const emptySeats = event.capacity - registered;
    const isPaused = event.isPaused === true;

    const card = document.createElement("div");
    card.className =
      "bg-slate-900 border border-slate-700 rounded-xl p-5 space-y-2";

    card.innerHTML = `
      <h4 class="text-lg font-semibold">${event.name}</h4>
      <p class="text-slate-400 text-sm">
        ${event.date} | ${event.time} | ${event.venue}
      </p>

      <p class="text-sm">
        👥 Registered: ${registered}<br/>
        🪑 Empty Seats: ${emptySeats}
      </p>

      <p class="text-sm">
        Status:
        <span class="${isPaused ? "text-yellow-400" : "text-green-400"} font-semibold">
          ${isPaused ? "Paused" : "Active"}
        </span>
      </p>

      <div class="flex gap-3 pt-3">
        <button
          class="px-4 py-2 rounded-lg bg-yellow-500 text-black font-medium hover:opacity-90"
          onclick="togglePause('${event.id}', ${isPaused})">
          ${isPaused ? "Resume Registration" : "Pause Registration"}
        </button>

        <button
          class="px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:opacity-90"
          onclick="deleteEvent('${event.id}')">
          Delete Event
        </button>
      </div>
    `;

    eventsContainer.appendChild(card);
  });
}

/* ================================
   PAUSE / RESUME
================================ */
async function togglePause(eventId, isPaused) {
  const res = await fetch("http://127.0.0.1:5000/api/pause_event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      event_id: eventId,
      isPaused: !isPaused,
    }),
  });

  const data = await res.json();

  if (res.ok) {
    fetchMyEvents();
  } else {
    alert(data.error || "❌ Failed to update event status");
  }
}

/* ================================
   DELETE EVENT
================================ */
async function deleteEvent(eventId) {
  if (!confirm("Are you sure you want to delete this event?")) return;

  const res = await fetch("http://127.0.0.1:5000/api/delete_event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event_id: eventId }),
  });

  const data = await res.json();

  if (res.ok) {
    fetchMyEvents();
  } else {
    alert(data.error || "❌ Delete failed");
  }
}

/* ================================
   BACK BUTTON
================================ */
const backBtn = document.getElementById("backBtn");

backBtn?.addEventListener("click", () => {
  myEventsSection.classList.add("hidden");
  createEventSection.classList.remove("hidden");
});
