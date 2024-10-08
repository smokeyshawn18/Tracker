const express = require("express");
const app = express();
const http = require("http");
const path = require("path");
const cors = require("cors");

const FRONTEND_URL = "https://tracker-six-delta.vercel.app/";

app.use(
  cors({
    origin: FRONTEND_URL,
  })
);

const socketio = require("socket.io");
const server = http.createServer(app);
const io = socketio(server);

// Set up EJS view engine
app.set("view engine", "ejs");

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "views"));

io.on("connection", function (socket) {
  console.log("A new user connected:", socket.id);

  socket.on("send-location", function (data) {
    console.log(`Location received from ${socket.id}:`, data);
    // Emit the location to all clients
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
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
