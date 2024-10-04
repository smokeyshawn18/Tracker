const socket = io();

// Check if geolocation is supported
if (navigator.geolocation) {
  navigator.geolocation.watchPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      console.log(`Latitude: ${latitude}, Longitude: ${longitude}`); // Debugging line
      socket.emit("send-location", { latitude, longitude });
    },
    (error) => {
      console.log("Geolocation error:", error);
    },
    {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 10000,
    }
  );
} else {
  console.log("Geolocation is not supported by this browser.");
}

// Initialize the map
const map = L.map("map").setView([0, 0], 16);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "OpenStreetMap",
}).addTo(map);

// Object to store user markers
const markers = {};

// Listen for location updates from the server
socket.on("receive-location", (data) => {
  console.log("Received location data:", data); // Debugging line
  const { id, latitude, longitude } = data;

  if (markers[id]) {
    // Update existing marker's position
    markers[id].setLatLng([latitude, longitude]);
  } else {
    // Create a new marker for this user
    const marker = L.marker([latitude, longitude]).addTo(map);
    markers[id] = marker; // Store the marker in the markers object
  }

  // Optionally, update the map's view to focus on the current user's location
  map.setView([latitude, longitude]);
});

// Handle user disconnection
socket.on("user-disconnected", (id) => {
  if (markers[id]) {
    map.removeLayer(markers[id]); // Remove marker from the map
    delete markers[id]; // Remove marker from the markers object
  }
});
