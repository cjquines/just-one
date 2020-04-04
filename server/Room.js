function randRange(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

class Room {
  constructor(io) {
    this.io = io;
    
    this.activePlayer = undefined;
    this.clues = {}; // player -> {clue, visible}
    this.guess = undefined;
    this.phase = "wait"; // "clue", "eliminate", "guess", "judge", "end"
    this.playerOrder = [];
    this.players = {}; // of name => {id, status}
    this.word = undefined;
  }

  // players

  sendPlayers() {
    this.io.emit("players", this.players, this.playerOrder);
  }

  newPlayer(name, socketId) {
    if (name in this.players) {
      this.kickPlayer(name);
    } else {
      this.playerOrder.splice(randRange(0, this.playerOrder.length + 1), 0, name);
    }

    this.players[name] = {
      id: socketId,
      status: "connected",
    };
    this.sendPlayers();
  }

  disconnectPlayer(name) {
    if (name in this.players) {
      this.players[name].status = "disconnected";
      this.sendPlayers();
    }
  }

  kickPlayer(name) {
    this.io.to(this.players[name].id).emit("phase", "disconnected", undefined);
    if (name === this.activePlayer) this.startPhase("clue");
    this.playerOrder = this.playerOrder.filter(name_ => name_ !== name);
    delete this.players[name];
    this.sendPlayers();
  }

  // game

  sendClues() {}
  sendWord() {}
  sendGuess() {}
  sendPhase() {}
  sendState(socket) {}

  handleClue(name, clue) {}
  toggleClue(name) {}
  handleGuess(guess) {}
  handleJudge(judgement) {}
  handleEnd(action) {}

  startPhase(phase) {}
}

module.exports = Room;
