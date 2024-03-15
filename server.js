import { createServer } from "node:http";
import { Server } from "socket.io";
import  Deck  from "./deck.js";
import { log } from "node:console";

var deck;
var flop;
var turn;
var river
var currentPlayers;
var numberOfPlayers;
var currentPlayer;
var currentPot;

async function newGame() {
  deck = await Deck.getNewDeck();
  log('deck ready: ' + deck.remaining + ' cards remaining');
  flop = await deck.drawCards(3);
  log('flop ready');
  turn = (await deck.drawCards(1))[0]; //drawCards always returns an array even for 1 card
  log('turn ready');
  river = (await deck.drawCards(1))[0];
  log('river ready');
  currentPlayers = [];
  numberOfPlayers = 0;
  currentPlayer = '';
  currentPot = 0;
}

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
    log(`${socket.id} : ${message.text}`);
    socket.broadcast.emit("message", message);
    callback('received');
  });

  socket.on("drawHand", async (callback) => {
    log(`${socket.id} called drawHand`);
    const hand = await deck.drawCards(2);
    callback(hand);
  });

  socket.on("getFlop", (callback) => {
    log(`${socket.id} called getFlop`);
    callback(flop);
  });

  socket.on("getTurn", (callback) => {
    log(`${socket.id} called getTurn`);
    callback(turn);
  });

  socket.on("getRiver", (callback) => {
    log(`${socket.id} called getRiver`);
    callback(river);
  });

  socket.on("newGame", async (callback) => {
    await newGame();
    log('new game started');
    callback("New game started");
  });
});

io.on("ping", (respond) => {
  respond("ack");
});

newGame();
