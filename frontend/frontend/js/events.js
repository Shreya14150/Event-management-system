const backendURL = "http://127.0.0.1:5000";

// Run when page loads
document.addEventListener("DOMContentLoaded", () => {
  loadEvents();
});

/* ================================
   LOAD EVENTS
================================ */
async function loadEvents() {
  try {
    const res = await fetch(`${backendURL}/api/events`);
    const events = await res.json();
    const container = document.getElementById("eventsContainer");
    container.innerHTML = "";

    if (!events || events.length === 0) {
      container.innerHTML =
        "<p style='text-align:center'>No events available.</p>";
      return;
    }

    events.forEach((event) => {
      const card = document.createElement("div");
      card.className = "event-card";

      card.innerHTML = `
        <h3>${event.name}</h3>
        <p>${event.description || ""}</p>
        <p><b>Date:</b> ${event.date || "N/A"} | <b>Time:</b> ${
        event.time || "N/A"
      }</p>
        <p><b>Venue:</b> ${event.venue || "N/A"}</p>
        <p><b>Capacity:</b> ${event.capacity || "N/A"}</p>
        <button class="register-btn" data-id="${event.id}">
          Register
        </button>
      `;

      container.appendChild(card);
    });

    document.querySelectorAll(".register-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const eventId = e.currentTarget.getAttribute("data-id");
        openRegisterModal(eventId);
      });
    });
  } catch (err) {
    console.error("Failed to load events:", err);
    document.getElementById("eventsContainer").innerHTML =
      "<p style='text-align:center'>Failed to load events.</p>";
  }
}

/* ================================
   OPEN MODAL
================================ */
function openRegisterModal(eventId) {
  document.getElementById("eventIdInput").value = eventId;
  document.getElementById("registerModal").style.display = "flex";

  // Reset form
  document.getElementById("registerForm").reset();
  document.getElementById("nameInput").disabled = false;
  document.getElementById("emailInput").disabled = false;

  const registerBtn = document.querySelector(
    "#registerForm button[type='submit']"
  );
  if (registerBtn) registerBtn.style.display = "block";

  // Reset QR
  const qrImg = document.getElementById("qrImage");
  qrImg.style.display = "none";
  qrImg.src = "";

  const downloadLink = document.getElementById("downloadQR");
  downloadLink.style.display = "none";
  downloadLink.href = "#";

  removeToast();
}

/* ================================
   CLOSE MODAL
================================ */
function closeModal() {
  document.getElementById("registerModal").style.display = "none";
  removeToast();
}

/* ================================
   TOAST HELPERS
================================ */
function showToast(message) {
  removeToast();
  const modal = document.querySelector(".modal-content");

  const toast = document.createElement("div");
  toast.id = "toastMessage";
  toast.style.position = "absolute";
  toast.style.top = "10px";
  toast.style.left = "50%";
  toast.style.transform = "translateX(-50%)";
  toast.style.background = "#4CAF50";
  toast.style.color = "white";
  toast.style.padding = "8px 16px";
  toast.style.borderRadius = "6px";
  toast.style.fontSize = "14px";
  toast.style.zIndex = "1000";
  toast.innerText = message;

  modal.appendChild(toast);
}

function removeToast() {
  const oldToast = document.getElementById("toastMessage");
  if (oldToast) oldToast.remove();
}

/* ================================
   REGISTER EVENT
================================ */
document
  .getElementById("registerForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("nameInput").value.trim();
    const email = document.getElementById("emailInput").value.trim();
    const event_id = document.getElementById("eventIdInput").value;
    const user_id = localStorage.getItem("userId");

    if (!user_id) {
      showToast("Please login first.");
      return;
    }

    try {
      const res = await fetch(`${backendURL}/api/register_event`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id, event_id, name, email }),
      });

      const data = await res.json();

      if (res.ok && data.qr_data_uri) {
        // Show QR
        const qrImg = document.getElementById("qrImage");
        qrImg.src = data.qr_data_uri;
        qrImg.style.display = "block";

        // Download link
        const downloadLink = document.getElementById("downloadQR");
        downloadLink.href = data.qr_data_uri;
        downloadLink.setAttribute("download", "EventPass.png");
        downloadLink.style.display = "inline-block";

        // Disable inputs
        document.getElementById("nameInput").disabled = true;
        document.getElementById("emailInput").disabled = true;

        // Hide register button
        const registerBtn = document.querySelector(
          "#registerForm button[type='submit']"
        );
        if (registerBtn) registerBtn.style.display = "none";

        showToast(data.message || "✅ Registration successful!");
      } else {
        showToast(data.error || "Registration failed");
      }
    } catch (error) {
      console.error("Registration error:", error);
      showToast("Server error. Make sure backend is running.");
    }
  });
