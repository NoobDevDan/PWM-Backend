import { createServer } from "node:http";
import { Server } from "socket.io";
import Player from "./objects/player.js"
import Game from "./objects/game.js"
import { log } from "node:console";

var game = new Game();
var chips = 5000;

const port = process.env.PORT || 3001;

const server = createServer(async (req, res) => {
  if (req.method === "GET" && req.url === "/is-https") {
    res.writeHead(200, {
      "content-type": "text/html"
    });
    res.write("false");
    res.end();
  } else {
    res.writeHead(404).end();
  }
});

server.listen(port, () => {
  console.log(`server listening at https://localhost:${port}`);
});

const io = new Server(server, {
  perMessageDeflate: false,
  cors: {
    origin: function (origin, callback){
      if(origin && (origin.includes('://localhost') || origin.includes('127.0.0.1'))){
        callback(null, true);
      }

      else{
        callback(new Error('Not allowed by CORS'), false);
      }
    }
  }
});

io.on("connection", (socket) => {
  log(`connected with transport ${socket.conn.transport.name}`);

  socket.conn.on("upgrade", (transport) => {
    log(`${socket.id} connection upgraded to ${transport.name}`);
  });

  socket.on("disconnect", (reason) => {
    log(`${socket.id} disconnected due to ${reason}`);
  });

  socket.on("message", (message, callback) => {
    log(message);
    socket.broadcast.emit("message", message);
    callback('received');
  });

  socket.on("joinGame", ({playerId, playerName}, callback) => {
    var newPlayer = new Player(playerId, playerName, chips)
    callback(game.addPlayer(newPlayer)? 'joined' : 'error');
  })

  socket.on("drawHand", (playerId, callback) => {
    log(`${playerId} called drawHand`);
    const hand = game.getJoinedPlayer(playerId).currentHand; 
    callback(hand);
  });

  socket.on("getFlop", (callback) => {
    log(`${socket.id} called getFlop`);
    callback(game.flop);
  });

  socket.on("getTurn", (callback) => {
    log(`${socket.id} called getTurn`);
    callback(game.turn);
  });

  socket.on("getRiver", (callback) => {
    log(`${socket.id} called getRiver`);
    callback(game.river);
  });

  socket.on("resetGame", async (callback) => {
    await game.reset();
    log('game has been reset');
    callback("Game Reset");
  });
});

io.on("ping", (respond) => {
  respond("ack");
});


