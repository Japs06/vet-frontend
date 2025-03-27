// --- Login Logic ---
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const error = document.getElementById("loginError");

    try {
      const res = await fetch("http://ec2-18-136-194-142.ap-southeast-1.compute.amazonaws.com:3000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        // Redirect to dashboard
        window.location.href = "dashboard.html";
      } else {
        error.textContent = data.message || "Login failed.";
      }
    } catch (err) {
      error.textContent = "Server error.";
      console.error("Login error:", err);
    }
  });
}

function sendAnalytics(page) {
  const ua = navigator.userAgent;
  const browser = ua.includes("Chrome") ? "Chrome" :
                  ua.includes("Firefox") ? "Firefox" :
                  ua.includes("Safari") ? "Safari" : "Other";
  const os = ua.includes("Windows") ? "Windows" :
             ua.includes("Mac") ? "MacOS" :
             ua.includes("Linux") ? "Linux" : "Other";
  const device_type = /Mobi|Android/i.test(ua) ? "Mobile" : "Desktop";
  const processor_info = navigator.hardwareConcurrency + " cores";

  // Get location via IP geolocation API
  fetch("https://ipapi.co/json/")
    .then(res => res.json())
    .then(ipData => {
      const location = `${ipData.city}, ${ipData.country_name}`;

      fetch("http://<your-ec2-dns>:3000/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          browser, os, device_type, processor_info,
          page, location
        })
      });
    });
}

// Example usage on dashboard
sendAnalytics("dashboard.html");



// Pet Records - CRUD using in-memory list
const petForm = document.getElementById("petForm");
const petTable = document.getElementById("petTable")?.querySelector("tbody");
const searchInput = document.getElementById("searchInput");

const API_URL = "http://ec2-18-136-194-142.ap-southeast-1.compute.amazonaws.com:3000/pets"; // Replace this!

let allPets = [];

function fetchPets() {
  fetch(API_URL)
    .then(res => res.json())
    .then(data => {
      allPets = data;
      renderPets();
    })
    .catch(err => console.error("Fetch error:", err));
}

function renderPets(filter = "") {
  petTable.innerHTML = "";
  allPets
    .filter(pet =>
      `${pet.name} ${pet.species} ${pet.owner}`.toLowerCase().includes(filter)
    )
    .forEach(pet => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${pet.name}</td>
        <td>${pet.species}</td>
        <td>${pet.owner}</td>
        <td><button class="btn" onclick="deletePet(${pet.id})">Delete</button></td>
      `;
      petTable.appendChild(row);
    });
}

function deletePet(id) {
  fetch(`${API_URL}/${id}`, { method: "DELETE" })
    .then(res => res.json())
    .then(() => fetchPets());
}

petForm?.addEventListener("submit", function (e) {
  e.preventDefault();
  const name = document.getElementById("petName").value.trim();
  const species = document.getElementById("petSpecies").value.trim();
  const owner = document.getElementById("petOwner").value.trim();

  fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, species, owner }),
  })
    .then(res => res.json())
    .then(() => {
      petForm.reset();
      fetchPets();
    });
});

searchInput?.addEventListener("input", function () {
  renderPets(this.value.trim().toLowerCase());
});

// Initial fetch
fetchPets();
