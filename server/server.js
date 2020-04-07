const Room = require("./Room");
const express = require("express");
const app = express();
const path = require("path");

const reactPath = path.resolve(__dirname, "..", "client", "build");
app.use(express.static(reactPath));

app.get("*", (req, res) => {
  res.sendFile(path.join(reactPath, "index.html"));
});

const http = require("http").createServer(app);
const io = require("socket.io")(http);

let rooms = {};

function kickAndClean(roomName) {
  if (rooms[roomName].players === 1) {
    rooms[roomName].room.closeRoom();
    delete rooms[roomName];
  } else {
    rooms[roomName].players -= 1;
  }
}

io.on("connection", (socket) => {
  let name = undefined;
  let roomName = undefined;
  let room = undefined;

  socket.on("room", (roomName_) => {
    roomName = roomName_;
    socket.join(roomName);
    if (roomName in rooms) {
      room = rooms[roomName].room;
    } else {
      room = new Room(io, roomName);
      rooms[roomName] = { room: room, players: 0 };
    }
  });

  socket.on("name", (name_) => {
    name = name_;
    room.newPlayer(name, socket.id);
    room.sendState(name, socket);
    rooms[roomName].players += 1;
  });
  socket.on("spectator", () => room.addSpectator(socket));
  socket.on("disconnect", () => {
    if (room.disconnectSocket(name, socket.id)) kickAndClean(roomName);
  });
  socket.on("kick", (name_) => {
    if (room.kickPlayer(name_)) kickAndClean(roomName);
  });

  socket.on("phase", phase => room.startPhase(phase));
  socket.on("clue", clue => room.handleClue(name, clue));
  socket.on("toggle", name_ => room.toggleClue(name_));
  socket.on("guess", guess => room.handleGuess(guess));
  socket.on("judge", judgement => room.handleJudge(judgement));
  socket.on("reveal", thing => room.handleReveal(thing));
});

const port = process.env.PORT || 4001;

http.listen(port, () => {
  console.log(`listening on port ${port}`);
});
