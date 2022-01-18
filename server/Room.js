const nlp = require("compromise");
const wordlists = require("./wordlists");

function randRange(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function equivalent(s1, s2) {
  if (!s1 || !s2) return false;
  return nlp(s1).text("root") === nlp(s2).text("root");
}

class Room {
  constructor(io, roomName) {
    this.io = io;
    this.roomName = roomName;

    this.roundId = 0;
    this.correct = 0;
    this.wrong = 0;

    this.activePlayer = undefined;
    this.clues = {}; // player -> {clue, visible}
    this.guess = undefined;
    this.judgment = undefined;
    this.pastWords = {}; // word -> true
    this.phase = "wait"; // "clue", "eliminate", "guess", "judge", "end"
    this.playerOrder = [];
    this.players = {}; // of name => {id, status}
    this.spectators = [];
    this.word = undefined;
    this.words = undefined;
  }

  // players

  sendPlayers() {
    this.io
      .to(this.roomName)
      .emit("players", this.players, this.playerOrder, this.spectators);
  }

  newPlayer(name, socketId) {
    let oldId = undefined;
    if (name in this.players) {
      oldId = this.players[name].id;
      this.io.to(oldId).emit("phase", "disconnected", null);
    } else {
      this.playerOrder.splice(
        randRange(0, this.playerOrder.length + 1),
        0,
        name
      );
      this.clues[name] = { clue: null, visible: true };
    }

    this.players[name] = {
      id: socketId,
      status: "connected",
    };
    this.sendPlayers();
    this.sendClues();

    return oldId;
  }

  addSpectator(socketId) {
    this.spectators.push(socketId);
    this.sendPlayers();
  }

  setWordList(wordlist) {
    if (this.words) return;
    this.words = wordlists[wordlist] || wordlists["beta"];
  }

  disconnectSocket(name, socketId) {
    if (name in this.players && this.players[name].id === socketId) {
      this.players[name].status = "disconnected";
      this.sendPlayers();
      return true;
    } else {
      this.spectators = this.spectators.filter((id) => id !== socketId);
      this.sendPlayers();
      return false;
    }
  }

  kickPlayer(name) {
    if (!(name in this.players)) return false;

    this.io.to(this.players[name].id).emit("phase", "disconnected");
    if (name === this.activePlayer) this.startPhase("clue");
    this.playerOrder = this.playerOrder.filter((name_) => name_ !== name);
    this.handleClue();
    delete this.players[name];
    this.sendPlayers();
    return true;
  }

  closeRoom() {
    let ids = [];
    for (let name in this.players) {
      ids.push(this.players[name].id);
      this.kickPlayer(name);
    }
    this.spectators.map((id) => {
      ids.push(id);
      this.io.to(id).emit("phase", "disconnected");
    });
    return ids;
  }

  // game

  toActive(event, data) {
    if (this.activePlayer in this.players) {
      this.io.to(this.players[this.activePlayer].id).emit(event, data);
    }
  }

  toInactive(event, data) {
    this.playerOrder.map((name) => {
      if (name !== this.activePlayer) {
        this.io.to(this.players[name].id).emit(event, data);
      }
    });
    this.spectators.map((id) => {
      this.io.to(id).emit(event, data);
    });
  }

  blindClues() {
    const newClues = Object.fromEntries(
      Object.entries(this.clues).map(([name, { clue, visible }]) => [
        name,
        { clue: Boolean(clue), visible: visible },
      ])
    );
    return newClues;
  }

  hiddenClues() {
    return Object.fromEntries(
      Object.entries(this.clues).map(([name, { clue, visible }]) => [
        name,
        { clue: visible && clue, visible: visible },
      ])
    );
  }

  sendClues() {
    const { phase } = this;
    if (phase === "clue") {
      this.io.to(this.roomName).emit("clues", this.blindClues());
    } else if (phase === "eliminate") {
      this.toActive("clues", this.blindClues());
      this.toInactive("clues", this.clues);
    } else if (phase === "guess" || phase === "judge" || phase === "end") {
      this.toActive("clues", this.hiddenClues());
      this.toInactive("clues", this.clues);
    }
  }

  sendWord() {
    this.toActive("word", "");
    this.toInactive("word", this.word);
  }

  sendGuess() {
    this.io.to(this.roomName).emit("guess", this.guess);
  }

  sendJudgment() {
    this.io.to(this.roomName).emit("judgment", this.judgment);
  }

  sendPhase() {
    this.io
      .to(this.roomName)
      .emit("phase", this.phase, this.roundId, this.activePlayer);
  }

  sendScore() {
    this.io.to(this.roomName).emit("score", this.correct, this.wrong);
  }

  sendState(name, socket) {
    const { phase } = this;
    socket.emit("phase", phase, this.roundId, this.activePlayer);
    socket.emit("score", this.correct, this.wrong);
    if (phase === "wait") return;
    let clues = this.clues;
    if (phase === "clue") {
      clues = this.blindClues();
      if (name in this.clues && this.clues[name].clue)
        socket.emit("myClue", this.clues[name].clue);
    }
    if (name === this.activePlayer) {
      if (phase === "eliminate") {
        clues = this.blindClues();
      } else if (phase === "guess" || phase === "judge" || phase === "end") {
        clues = this.hiddenClues();
      }
      socket.emit("word", "");
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
    if (this.phase !== "clue") return;
    if (name in this.clues) this.clues[name].clue = clue;
    this.sendClues();
    if (
      this.playerOrder.filter((name_) => {
        return name_ !== this.activePlayer && !this.clues[name_].clue;
      }).length === 0
    ) {
      this.startPhase("eliminate");
    }
  }

  toggleClue(name) {
    this.clues[name].visible = !this.clues[name].visible;
    this.sendClues();
  }

  handleGuess(guess) {
    if (this.phase === "guess") {
      this.guess = guess;
      this.sendGuess();
      this.startPhase("judge");
      if (equivalent(guess, this.word)) this.handleJudge(true);
    }
  }

  handleJudge(judgment) {
    if (this.phase === "judge") {
      this.judgment = judgment;
      judgment ? (this.correct += 1) : (this.wrong += 1);
      this.sendJudgment();
      this.sendScore();
      this.startPhase("end");
    }
  }

  softStartPhase(phase, id_) {
    if (phase === "clue" && this.phase !== "wait" && this.phase !== "end")
      return;
    this.startPhase(phase, id_);
  }

  startPhase(phase, id_) {
    if (phase !== "clue" && this.phase === phase) return;
    if (id_ && this.roundId !== id_) return;
    this.phase = phase;

    if (phase === "clue") {
      if (this.activePlayer) {
        // reveal everything from previous round
        this.toActive("word", this.word);
        this.toActive("clues", this.clues);
        this.roundId++;

        const ind = this.playerOrder.indexOf(this.activePlayer);
        this.activePlayer = this.playerOrder[
          (ind + 1) % this.playerOrder.length
        ];
      } else {
        this.activePlayer = this.playerOrder[0];
      }
      this.playerOrder.map((name) => {
        this.clues[name] = { clue: null, visible: true };
      });
      this.io.to(this.roomName).emit("myClue", null);
      if (!this.words) this.setWordList();
      do {
        this.word = this.words[randRange(0, this.words.length)];
      } while (this.pastWords.hasOwnProperty(this.word));
      this.pastWords[this.word] = true;
      this.sendPhase();
      this.sendClues();
      this.sendWord();
    } else if (phase === "eliminate") {
      this.playerOrder.map((name) => {
        const clue = this.clues[name].clue;
        if (!clue) return;
        if (
          this.playerOrder.filter((name_) =>
            equivalent(clue, this.clues[name_].clue)
          ).length > 1
        ) {
          this.toggleClue(name);
        }
      });
      this.sendPhase();
      this.sendClues();
    } else if (phase === "guess") {
      this.sendPhase();
      this.sendClues();
    } else {
      this.sendPhase();
    }
  }
}

module.exports = Room;
