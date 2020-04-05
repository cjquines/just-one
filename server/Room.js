function randRange(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

class Room {
  constructor(io) {
    this.io = io;
    
    this.activePlayer = undefined;
    this.clues = {}; // player -> {clue, visible}
    this.guess = undefined;
    this.judgment = undefined;
    this.phase = "wait"; // "clue", "eliminate", "guess", "judge", "end"
    this.playerOrder = [];
    this.players = {}; // of name => {id, status}
    this.spectators = [];
    this.word = undefined;
  }

  // players

  sendPlayers() {
    this.io.emit("players", this.players, this.playerOrder, this.spectators);
  }

  newPlayer(name, socketId) {
    if (name in this.players) {
      this.io.to(this.players[name].id).emit("phase", "disconnected", null);
      if (name === this.activePlayer) this.startPhase("clue");
    } else {
      this.playerOrder.splice(randRange(0, this.playerOrder.length + 1), 0, name);
      this.clues[name] = { clue: null, visible: true };
    }

    this.players[name] = {
      id: socketId,
      status: "connected",
    };
    this.sendPlayers();
    this.sendClues();
  }

  addSpectator(socket) {
    this.sendState(null, socket);
    this.spectators.push(socket.id);
  }

  disconnectPlayer(name, socketId) {
    if (name in this.players) {
      this.players[name].status = "disconnected";
      this.sendPlayers();
    }
    this.spectators = this.spectators.filter(id => id !== socketId);
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
    this.spectators.map(id => {
      this.io.to(id).emit(event, data);
    })
  }

  blindClues() {
    const newClues = Object.fromEntries(
      Object.entries(this.clues).map(([name, {clue, visible}]) => 
        [name, {clue: Boolean(clue), visible: visible}]
      )
    );
    newClues[this.activePlayer].clue = "guessing";
    return newClues;
  }

  hiddenClues() {
    return Object.fromEntries(
      Object.entries(this.clues).map(([name, {clue, visible}]) => 
        [name, {clue: visible && clue, visible: visible}]
      )
    );
  }

  sendClues() {
    const { phase } = this;
    if (phase === "clue") {
      this.io.emit("clues", this.blindClues());
    } else if (phase === "eliminate") {
      this.toActive("clues", this.blindClues());
      this.toInactive("clues", this.clues);
    } else if (phase === "guess" || phase === "judge" || phase === "end") {
      this.toActive("clues", this.hiddenClues());
      this.toInactive("clues", this.clues);
    }
  }

  sendWord() {
    this.toInactive("word", this.word);
  }

  sendGuess() {
    this.io.emit("guess", this.guess);
  }

  sendJudgment() {
    this.io.emit("judgment", this.judgment);
  }

  sendPhase() {
    this.io.emit("phase", this.phase, this.activePlayer);
  }

  sendState(name, socket) {
    const { phase } = this;
    socket.emit("phase", phase, this.activePlayer);
    if (phase === "wait") return;
    let clues = this.clues;
    if (phase === "clue") clues = this.blindClues();
    if (name === this.activePlayer) {
      if (phase === "eliminate") {
        clues = this.blindClues();
      } else if (phase === "guess" || phase === "judge" || phase === "end") {
        clues = this.hiddenClues();
      }
    } else {
      socket.emit("word", this.word);
    }
    socket.emit("clues", clues);
    if (phase === "judge" || phase === "end") {
      socket.emit("guess", this.guess);
    }
    if (phase === "end") socket.emit("judgment", this.judgment);
  }

  handleClue(name, clue) {
    this.clues[name].clue = clue;
    this.sendClues();
  }

  toggleClue(name) {
    this.clues[name].visible = !this.clues[name].visible;
    this.sendClues();
  }

  handleGuess(guess) {
    this.guess = guess;
    this.sendGuess();
    this.startPhase("judge");
  }

  handleJudge(judgment) {
    this.judgment = judgment;
    this.sendJudgment();
    this.startPhase("end");
  }

  handleReveal() {
    for (const name in this.clues) {
      this.clues[name].visible = true;
    }
    this.sendClues();
  }

  startPhase(phase) {
    this.phase = phase;
    if (phase === "clue") {
      if (this.activePlayer) {
        const ind = this.playerOrder.indexOf(this.activePlayer);
        this.activePlayer = this.playerOrder[(ind + 1) % this.playerOrder.length];
      } else {
        this.activePlayer = this.playerOrder[0];
      }
      this.playerOrder.map(name => {
        this.clues[name] = { clue: null, visible: true };
      });
      this.clues[this.activePlayer].clue = "guessing";
      this.word = "soap";
      this.sendClues();
      this.sendWord();
    } else if (phase === "eliminate") {
      this.sendClues();
    } else if (phase === "guess") {
      this.sendClues();
    }
    this.sendPhase();
  }
}

module.exports = Room;
