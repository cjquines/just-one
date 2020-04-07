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

let clients = {};
let rooms = {};

function kickAndClean(roomName) {
  if (!rooms[roomName]) return;
  if (rooms[roomName].players === 1) {
    const ids = rooms[roomName].room.closeRoom();
    ids.map((id) => {
      if (id in clients) clients[id].leave(roomName);
    });
    delete rooms[roomName];
  } else {
    rooms[roomName].players -= 1;
  }
}

io.on("connection", (socket) => {
  clients[socket.id] = socket;

  let name = undefined;
  let roomName = undefined;
  let room = undefined;

  socket.on("join", (roomName_) => {
    roomName = roomName_;
    socket.join(roomName);
    if (roomName in rooms) {
      room = rooms[roomName].room;
    } else {
      room = new Room(io, roomName);
      rooms[roomName] = { room: room, players: 0 };
    }
  });
  socket.on("leave", (roomName_) => {
    if (roomName_ in rooms && rooms[roomName_].room.kickPlayer(name)) {
      kickAndClean(roomName_);
    }
    socket.leave(roomName_);
    roomName = undefined;
  });

  socket.on("name", (name_) => {
    name = name_;
    const oldId = room.newPlayer(name, socket.id);
    if (oldId in clients) {
      clients[oldId].leave(roomName);
      rooms[roomName].players -= 1;
    }
    room.sendState(name, socket);
    rooms[roomName].players += 1;
    
  });
  socket.on("spectator", () => {
    room.addSpectator(socket.id);
    room.sendState(null, socket);
  });
  socket.on("disconnect", () => {
    if (socket.id in clients) delete clients[socket.id];
    if (room && room.disconnectSocket(name, socket.id)) kickAndClean(roomName);
  });
  socket.on("kick", (name_, id_) => {
    if (id_ in clients) clients[id_].leave(roomName);
    if (room.kickPlayer(name_)) kickAndClean(roomName);
  });

  socket.on("phase", phase => room.startPhase(phase));
  socket.on("clue", clue => {
    socket.emit("myClue", clue);
    room.handleClue(name, clue);
  });
  socket.on("toggle", name_ => room.toggleClue(name_));
  socket.on("guess", guess => room.handleGuess(guess));
  socket.on("judge", judgement => room.handleJudge(judgement));
  socket.on("reveal", thing => room.handleReveal(thing));
});

const port = process.env.PORT || 4001;

http.listen(port, () => {
  console.log(`listening on port ${port}`);
});
