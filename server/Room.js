class Room {
  constructor(io) {
    this.io = io;
    this.state = {
      activePlayer: undefined,
      clues: {}, // player -> {clue, visible}
      guess: undefined,
      phase: "wait", // "clue", "eliminate", "guess", "judge", "end"
      playerOrder: [],
      players: {}, // of name => {id, status}
      word: undefined,
    };
  }

  // players

  sendPlayers() {
    this.io.emit("players", this.state.players);
  }

  newPlayer(name, socketId) {
    // if name exists, kick other player
    // add to player order randomly
    this.state.players.push({
      id: socketId,
      name: name,
      status: "connected",
    });
    this.sendPlayerList();
  }

  disconnectPlayer(name) {
    // update player status
  }

  kickPlayer(name) {
    // remove from playerOrder
    // remove from player dictionary
  }

  // game

  sendClues() {}
  sendWord() {}
  sendGuess() {}
  sendPhase() {}

  handleClue(name, clue) {}
  toggleClue(name) {}
  handleGuess(guess) {}
  handleJudge(judgement) {}
  handleEnd(action) {}

  startPhase(phase) {}
}

module.exports = Room;
