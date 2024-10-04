const express = require("express");
const app = express();
const http = require("http");
const path = require("path");
const cors = require("cors");

app.use(cors()); // Enable CORS for all requests
const socketio = require("socket.io");
const server = http.createServer(app);
const io = socketio(server);

app.set("view engine", "ejs");
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

app.get("/", (req, res) => {
  res.render("index");
});

server.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
