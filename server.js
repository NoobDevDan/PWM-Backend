import socketServer from "./utils/socketServer.js";
import Player from "./objects/player.js"
import  Game  from "./objects/game.js"
import { log } from "node:console";
import Helper from "./utils/helper.js";

export const io = socketServer();
export var game = new Game;
var helper = new Helper;


///
//game event handlers
///
function actionEventHandler(playerId, actionType, actionAmount){
  const _player = game.getOnlinePlayer(playerId);
  switch(actionType){
    case "Fold":
      _player.lastAction = 'Folded';
      _player.status = 'Folded';
      game.onlinePlayers = game.onlinePlayers.map((player) => (player.id == playerId ? {...player, ..._player} : player));
      return true;
    case "Check":
      _player.lastAction = 'Checked';
      game.onlinePlayers = game.onlinePlayers.map((player) => (player.id == playerId ? {...player, ..._player} : player));
      return true;
    case "Bet":
      _player.amountBidThisRound += actionAmount;
      _player.lastAction = 'Bet';
      game.onlinePlayers = game.onlinePlayers.map((player) => (player.id === playerId ? {...player, ..._player} : player));
      game.currentPot += actionAmount;
      return true;
    case "Call":
      _player.amountBidThisRound += actionAmount;
      _player.lastAction = 'Called';
      game.onlinePlayers = game.onlinePlayers.map((player) => (player.id === playerId ? {...player, ..._player} : player));
      game.currentPot += actionAmount;
      return true;
    case "Raise":
      _player.amountBidThisRound += actionAmount;
      _player.lastAction = 'Raise';
      game.onlinePlayers = game.onlinePlayers.map((player) => (player.id === playerId ? {...player, ..._player} : player));
      game.currentPot += actionAmount;
      return true;
    case "All-in":
      _player.amountBidThisRound += actionAmount;
      _player.lastAction = 'All-in';
      game.onlinePlayers = game.onlinePlayers.map((player) => (player.id === playerId ? {...player, ..._player} : player));
      game.currentPot += actionAmount;
      return true;
    default:
      log(`WARN: ${actionType} does not exist`);
      return false;
  }
}

async function nextRound(){
  await (game.newRound());
  broadcastStateOfPlay();
  broadcastPlayersUpdated();
}

function nextPlayer(){
  log(game.indexOfCurrentPlayer);
  log(game.onlinePlayers.length);
  if(game.indexOfCurrentPlayer < game.onlinePlayers.length){
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
  let onlinePlayers = game.onlinePlayers.map((player) => {
    let playerNoCards = helper.removeCardsFromPlayer(player);
    return playerNoCards;
  });
  io.emit("playersUpdated", onlinePlayers);
}

function broadcastStateOfPlay(){
  if(game.gameStarted){
    log('Broadcasting State of Play');
    let SOP = {
      currentRound: game.currentRound,
      smallBlind: game.smallBlind,
      bigBlind: game.bigBlind,
      currentPot: game.currentPot,
      currentPlayerId: game.onlinePlayers[game.indexOfCurrentPlayer].id,
      smallBlindPlayerId: game.onlinePlayers[game.indexOfSmallBlindPlayer].id,
      bigBlindPlayerId: game.onlinePlayers[game.indexOfBigBlindPlayer].id,
      minimumBet: game.minimumBet,
      gameStarted: game.gameStarted,
    }
    io.emit("stateOfPlay", SOP);
  }
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

  socket.on("message", (message) => {
    if(message.text.includes("admin:reset")){
      game.reset();
      io.emit("reset");
    }
    else if(message.text.includes("admin:nextRound")){
      nextRound();
    }
    else if(message.text.includes("admin:nextPlayer")){
      nextPlayer();
    }
    else{
      io.emit("message", message);
    }
    log(message);
  });

  socket.on("joinGame", (player, callback) => {
    var newPlayer = new Player(player.id, player.name, player.avatarURL);
    const success = game.addPlayer(newPlayer);
    callback(success? 'joined' : 'error joining');
    success ? console.log(`${newPlayer.name} has joined the game`) : console.log(`${newPlayer.name} has already joined`);
    if(success){
      broadcastPlayersUpdated();
    }
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

  socket.on("getHand", async (playerId, callback) => {
    log(`${playerId} called getHand`);
    let _hand = await (game.deck.drawCards(2));
    let _currentHand = {currentHand: _hand};
    game.onlinePlayers = game.onlinePlayers.map((player) => playerId == player.id ? {...player, ..._currentHand} : player);
    let player = game.getOnlinePlayer(playerId);
    callback(player.currentHand);
    return game.onlinePlayers;
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

  socket.on("actionEvent", async(playerId, actionType, actionAmount, callback) => {
    log(`${playerId} has sent a ${actionType} actionEvent: ${actionAmount}`);
    let success = actionEventHandler(playerId, actionType, actionAmount);
    if(success){
      let totalBidThisRound = 0; 
      game.onlinePlayers.forEach((player) => {
        totalBidThisRound += player.amountBidThisRound;
      })
      game.currentPot != totalBidThisRound ? nextPlayer() : await game.newRound();
      broadcastPlayersUpdated();
      broadcastStateOfPlay();
      callback('success');
    }

    else{
      callback('action failed');
    }
  });
});




