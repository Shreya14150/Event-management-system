// --------------------
// ✅ SIGNUP (auto-login + redirect)
// --------------------
document.getElementById("signupForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("signupName").value.trim();
  const email = document.getElementById("signupEmail").value.trim();
  const password = document.getElementById("signupPassword").value;
  const role = document.getElementById("signupRole").value;

  try {
    const response = await fetch("http://127.0.0.1:5000/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role })
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.error || "Signup failed");
      return;
    }

    // ✅ Save user safely (no password)
    const user = {
      id: data.user.id,
      name: data.user.name,
      email: data.user.email,
      role: data.user.role
    };

    localStorage.setItem("user", JSON.stringify(user));

    // ✅ Redirect based on role
    window.location.href =
      user.role === "manager"
        ? "manager_dashboard.html"
        : "events.html";

  } catch (err) {
    console.error("Signup error:", err);
    alert("Something went wrong");
  }
});


// --------------------
// ✅ LOGIN
// --------------------
document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;
  const role = document.getElementById("loginRole").value;

  try {
    const response = await fetch("http://127.0.0.1:5000/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, role })
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.error || "Login failed");
      return;
    }

    // ✅ Store user
    localStorage.setItem("user", JSON.stringify(data.user));

    // ✅ Redirect
    window.location.href =
      data.user.role === "manager"
        ? "manager_dashboard.html"
        : "events.html";

  } catch (err) {
    console.error("Login error:", err);
    alert("Something went wrong");
  }
});
