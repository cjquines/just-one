# just one

a web app for playing [just one](https://boardgamegeek.com/boardgame/254640/just-one), a cooperative party word game.

why a web app, when the game works perfectly fine without one? because social distancing? the default wordlist is kinda eh? i want to be able to play the game over voice chat with friends? you figure it out.

## build

run `npm install`. then `npm start` slash `nodemon` starts the socket server, and `npm run hotloader` starts the client server.

`server/beta.json` is a wordlist that should exist; for copyright reasons you should replace with your own wordlist.

## deploy

remember to change `App.js` to have `socketIOClient(window.location.hostname + ":" + window.location.port)` rather than the hardcoded development port `4001`. then run `npm run build` in the client folder.

## todo

- style no clue differently
- add more metadata i guess
- allow clue resubmission (send clues to writer)
- next round should be harder to press accidentally
- score?? maybe?? 
- add more metadata to websocket emits? (should check if emitter still in game, at least)
- "i'm about to read guessing as a clue"
- guess should be visible at the end
- button for asking people to guess again
- reconnecting as the guesser should not trigger next round
- make pressing enter submit the clue
- i think if the answer is (case-insensitively) exactly right you should autoaccept
- clues that are case-insensitively identical should autohide
- implement rooms
- a log would be nice (a la castlefall?)
- sanitize names, clues, and guesses
- "add clues" feature after a round ends?
- style table column widths
- add a timer? or like, a timer that counts up, resetting every phase
