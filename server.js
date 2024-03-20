import socketServer from "./utils/socketServer.js";
import Player from "./objects/player.js"
import  Game  from "./objects/game.js"
import { log } from "node:console";

export const io = socketServer();

var game = new Game;

function broadcastPlayersOnline(){
  const onlinePlayers = game.playersJoined.map((player) => {
    return({
      id: player.id,
      name: player.name,
      chipCount: player.chipCount,
      status: player.status,
      lastAction: player.lastAction,
      lastBid: player.lastBid,
      avatarURL: player.avatarURL,
    });
  })
  io.emit("playerJoined", onlinePlayers);
}

function broadcastNewRound(){
  io.emit("newRound", game.currentRound);
}

function broadcastPlayersUpdated(){
  io.emit("playersUpdated");
}

io.on("connection", (socket) => {
  log(`connected with transport ${socket.conn.transport.name}`);

  socket.conn.on("upgrade", (transport) => {
    log(`${socket.id} connection upgraded to ${transport.name}`);
  });

  socket.on("disconnect", (reason) => {
    log(`${socket.id} disconnected due to ${reason}`);
  });

  socket.on("message", (message, callback) => {
    if(message.text.includes("admin:reset")){
      game.reset();
      io.emit("reset");
    }
    log(message);
    io.emit("message", message);
    callback('received');
  });

  socket.on("joinGame", (player, callback) => {
    log(player);
    log(game.getJoinedPlayer(player.id));
    var newPlayer = new Player(player.id, player.name, player.avatarURL);
    callback(game.addPlayer(newPlayer)? 'joined' : 'error');
    broadcastPlayersOnline();
  })

  socket.on("startGame", () => {
    log("startGame Called");
    if(!game.gameStarted){
      game.start();
      io.emit("gameStarted");
      //broadcastPlayersUpdated();
    }
  })

  socket.on("newRound", async(callback) => {
    if(game.gameStarted){
      await (game.newRound());
      broadcastPlayersUpdated();
      broadcastNewRound();
      callback(`round ${game.currentRound} started`)
    }

    callback('Game not started');
  })

  socket.on("getHand", (playerId, callback) => {
    log(`${playerId} called getHand`);
    let player = game.getJoinedPlayer(playerId);
    log(player);
    const hand = player.currentHand;
    log(hand)
    callback(hand);
  });

  socket.on("getFlop", (callback) => {
    log(`${socket.id} called getFlop`);
    if(game.currentRound == 1){
      log(game.flop);
      io.emit("setFlop", game.flop);
    }
  });

  socket.on("getTurn", (callback) => {
    log(`${socket.id} called getTurn`);
    if(game.currentRound == 2){
      log(game.turn);
      io.emit("setTurn", game.turn);
    }
  });

  socket.on("getRiver", (callback) => {
    log(`${socket.id} called getRiver`);
    if(game.currentRound == 3){
      log(game.river);
      io.emit("setRiver", game.river);
    }
  });

  socket.on("updatePlayer",  (playerId, callback) => {
    log(`${playerId} called updatePlayer`);
    let player = game.getJoinedPlayer(playerId);
    callback(player);
  });
});




