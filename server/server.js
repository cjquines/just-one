const Room = require("./Room");
const express = require("express");
const app = express();
const path = require("path");
const http = require("http").createServer(app);
const io = require("socket.io")(http);

const reactPath = path.resolve(__dirname, "..", "client", "dist");
app.use(express.static(reactPath));

app.get("*", (req, res) => {
  res.sendFile(path.join(reactPath, "index.html"));
});

// IO

let room = new Room(io);

io.on("connection", (socket) => {
  let name = undefined;

  socket.on("name", (name_) => {
    name = name_;
    room.newPlayer(name, socket.id);
    room.sendState(name, socket);
  });

  socket.on("disconnect", () => room.disconnectPlayer(name));
  socket.on("kick", name_ => room.kickPlayer(name_));

  socket.on("phase", phase => room.startPhase(phase));
  socket.on("clue", clue => room.handleClue(name, clue));
  socket.on("toggle", name_ => room.toggleClue(name_));
  socket.on("guess", guess => room.handleGuess(guess));
  socket.on("judge", judgement => room.handleJudge(judgement));
  socket.on("reveal", () => room.handleReveal());
});

// serve

http.listen(process.env.PORT || 4001, () => {
  console.log("listening!");
});
