const express = require("express");
const app = express();
const http = require("http");
const path = require("path");
const cors = require("cors");

const FRONTEND_URL = "https://tracker-mocha-kappa.vercel.app/";

app.use(
  cors({
    origin: FRONTEND_URL, // Allow requests from the frontend URL
  })
);

const socketio = require("socket.io");
const server = http.createServer(app);
const io = socketio(server);

// Set up EJS view engine
app.set("view engine", "ejs");

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "public")));

io.on("connection", function (socket) {
  console.log("A new user connected:", socket.id);

  socket.on("send-location", function (data) {
    console.log(`Location received from ${socket.id}:`, data); // Debugging line
    io.emit("receive-location", { id: socket.id, ...data });
  });

  socket.on("user-disconnected", function () {
    console.log("User disconnected:", socket.id);
    io.emit("user-disconnected", socket.id);
  });
});

// Define the root route
app.get("/", (req, res) => {
  res.render("index");
});

// Example redirect route (optional)
app.get("/redirect", (req, res) => {
  res.redirect(FRONTEND_URL);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack); // Log the error stack
  res.status(500).send("Something broke!"); // Send a user-friendly error message
});

// Start the server
const PORT = process.env.PORT || 3000; // Use PORT from environment variable or 3000 locally
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
