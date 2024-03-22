import socketServer from "./utils/socketServer.js";
import Player from "./objects/player.js"
import  Game  from "./objects/game.js"
import { log } from "node:console";
import Helper from "./utils/helper.js";

export const io = socketServer();
var game = new Game;
var helper = new Helper;


///
//game event handlers
///
function transactionEventHandler(playerId, eventType, transactionAmount){
  switch(eventType){
    case "Fold":
      break;
    case "Check":
      break;
    case "Call":
      break;
    case "Raise":
      break;
    case "All-in":
      break;
    default:
      log(`WARN: ${eventType} does not exist`)
  }

  broadcastPlayersUpdated();
}

async function nextRound(){
  await game.newRound();
  broadcastStateOfPlay();
  broadcastPlayersUpdated();
}

function nextPlayer(){
  if(game.indexOfCurrentPlayer < game.playersJoined.length){
    game.indexOfCurrentPlayer += 1;
  }
  else{
    game.indexOfCurrentPlayer = 0;
  }
  
}


///
//broadcast handling functions
///
function broadcastPlayersUpdated(){
  log('Broadcasting PlayersUpdated');
  let onlinePlayers = game.playersJoined.map((player) => {
    let playerNoCards = helper.removeCardsFromPlayer(player);
    return playerNoCards;
  })
  io.emit("playersUpdated", onlinePlayers);
}

function broadcastStateOfPlay(){
  log('Broadcasting State of Play');
  let SOP = {
    currentRound: game.currentRound,
    smallBlind: game.smallBlind,
    bigBlind: game.bigBlind,
    currentPot: game.currentPot,
    currentPlayerId: game.playersJoined[game.indexOfCurrentPlayer].id,
    smallBlindPlayerId: game.smallBlindPlayerId,
    bigBlindPlayerId: game.bigBlindPlayerId,
    minimumBet: game.minimumBet,
    gameStarted: game.gameStarted,
  }
  io.emit("stateOfPlay", SOP);
}



///
//Socket connection event handling
///
io.on("connection", (socket) => {
  log(`connected with transport ${socket.conn.transport.name}`);

  socket.conn.on("upgrade", (transport) => {
    log(`${socket.id} connection upgraded to ${transport.name}`);
  });

  socket.on("disconnect", (reason) => {
    log(`${socket.id} disconnected due to ${reason}`);
  });

  socket.on("message", async (message) => {
    if(message.text.includes("admin:reset")){
      game.reset();
      io.emit("reset");
    }
    if(message.text.includes("admin:nextRound")){
      nextRound();
    }
    if(message.text.includes("admin:nextPlayer")){
      nextPlayer();
    }
    else{
      io.emit("message", message);
    }
    log(message);
  });

  socket.on("joinGame", (player, callback) => {
    log(player.name + ' joined the game');
    var newPlayer = new Player(player.id, player.name, player.avatarURL);
    callback(game.addPlayer(newPlayer)? 'joined' : 'error joining');
    broadcastPlayersUpdated();
  })

  socket.on("startGame", async() => {
    log("startGame Called");
    if(!game.gameStarted){
      game.start();
      await nextRound();
    }
  })

  socket.on("requestStateOfPlay", () => {
    log('requestStateOfPlay called');
      broadcastStateOfPlay();
  })

  socket.on("getHand", (playerId, callback) => {
    log(`${playerId} called getHand`);
    let player = game.getJoinedPlayer(playerId);
    const hand = player.currentHand;
    callback(hand);
  });

  socket.on("getFlop", () => {
    log(`getFlop called`);
    if(game.currentRound == 1){
      io.emit("setFlop", game.flop);
    }
  });

  socket.on("getTurn", () => {
    log(`getTurn called`);
    if(game.currentRound == 2){
      io.emit("setTurn", game.turn);
    }
  });

  socket.on("getRiver", () => {
    log(`getRiver called`);
    if(game.currentRound == 3){
      io.emit("setRiver", game.river);
    }
  });

  socket.on("updatePlayer",  (playerId, callback) => {
    log(`${playerId} called updatePlayer`);
    let player = game.getJoinedPlayer(playerId);
    let updatedPlayer = helper.removeCardsFromPlayer(player);
    callback(updatedPlayer);
  });

  socket.on("transactionEvent", (playerId, eventType, transactionAmount) => {
    log(`${playerId} has sent a ${eventType} transactionEvent`);
    transactionEventHandler(playerId, eventType, transactionAmount);
  });
});




