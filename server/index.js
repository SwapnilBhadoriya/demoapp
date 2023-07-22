const express = require("express");
const cors = require("cors");
const app = express();
const { Server } = require("socket.io");
const server = require("http").createServer(app);

app.use(cors());
const { v4: uuidv4 } = require("uuid");

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const { ExpressPeerServer } = require("peer");
const opinions = {
  debug: true,
};
app.use("/", (req, res, next) => {
  console.log("Reached the server");
  console.log(req.url);
  next();
});
app.use("/peerjs", ExpressPeerServer(server, opinions));

app.get("/", (req, res) => {
  return res.send("Hello");
  res.redirect(`/${uuidv4()}`);
});

app.get("/:room", (req, res) => {
  res.status(200).json({ roomId: uuidv4() });
});
server.on("connection", (stream) => {
  console.log("someone connected!");
});

io.on("connection", (socket) => {
  console.log(socket.id);

  socket.on("join-room", (roomId, userId) => {
    console.log("Room join request by .." + userId);
    socket.join(roomId);

    socket.to(roomId).emit("user-joined", userId);

    socket.on("hello", (message) => {
      io.to(roomId).emit("getMsgs", message);
    });
  });
});

server.listen(process.env.PORT || 5000, () => {
  console.log("Server is running ");
});
