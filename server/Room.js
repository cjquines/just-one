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
      this.io.to(this.players[name].id).emit("phase", "disconnected", null);
      if (name === this.activePlayer) this.startPhase("clue");
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
    this.io.to(this.players[name].id).emit("phase", "disconnected", null);
    if (name === this.activePlayer) this.startPhase("clue");
    this.playerOrder = this.playerOrder.filter(name_ => name_ !== name);
    delete this.players[name];
    this.sendPlayers();
  }

  // game

  toActive(event, data) {
    this.io.to(this.players[this.activePlayer].id).emit(event, data);
  }

  toInactive(event, data) {
    this.playerOrder.map(name => {
      if (name !== this.activePlayer) {
        this.io.to(this.players[name].id).emit(event, data);
      }
    });
  }

  sendClues() {
    if (this.phase === "clue") {
      const newClues = Object.fromEntries(
        Object.entries(this.clues).map(([name, {clue, visible}]) => 
          [name, {clue: clue ? "submitted!" : "typing...", visible: visible}]
        )
      );
      newClues[this.activePlayer].clue = "guessing";
      this.io.emit("clues", newClues);
    }
  }

  sendWord() {
    this.toInactive("word", this.word);
  }

  sendGuess() {}
  sendPhase() {
    this.io.emit("phase", this.phase, this.activePlayer);
  }

  sendState(socket) {}

  handleClue(name, clue) {
    this.clues[name].clue = clue;
    this.sendClues();
  }

  toggleClue(name) {}
  handleGuess(guess) {}
  handleJudge(judgement) {}
  handleEnd(action) {}

  startPhase(phase) {
    this.phase = phase;
    if (phase === "clue") {
      if (this.activePlayer) {
        const ind = this.playerOrder.indexOf(this.activePlayer);
        this.activePlayer = this.playerOrder[(ind + 1) % this.playerOrder.length];
      } else {
        this.activePlayer = this.playerOrder[0];
      }
      this.playerOrder.map(name => { this.clues[name] = { clue: null, visible: true }; });
      this.clues[this.activePlayer].clue = "guessing";
      this.word = "soap";
      this.sendClues();
      this.sendWord();
      this.sendPhase();      
    }
  }
}

module.exports = Room;
