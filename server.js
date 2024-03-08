import {createServer} from "node:https";
import { readFile } from "node:fs/promises";
import { Server } from "socket.io";
import { Http3Server } from "@fails-components/webtransport";

const key = process.env.NODE_ENV == 'production' ? await readFile(process.env.SSL_KEY) : await readFile('./key.pem');
const cert = process.env.NODE_ENV == 'production' ? await readFile(process.env.SSL_CERT) : await readFile('./cert.pem');

const httpsServer = createServer({key,cert},async (req, res) => {
  if (req.method === "GET" && req.url === "/") {
    res.writeHead(200, {
      "content-type": "text/html"
    });
    res.write("connected");
    res.end();
  } else {
    res.writeHead(404).end();
  }
});

const port = process.env.PORT || 3001;

httpsServer.listen(port, () => {
  console.log(`server listening at https://localhost:${port}`);
});

const io = new Server(httpsServer, {
  transports: ["polling", "websocket", "webtransport"],
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
  console.log(`connected with transport ${socket.conn.transport.name}`);

  socket.conn.on("upgrade", (transport) => {
    console.log(`connection upgraded to ${transport.name}`);
  });

  socket.on("disconnect", (reason) => {
    console.log(`disconnected due to ${reason}`);
  });

  socket.on("message", (message, callback) => {
    console.log(message);
    callback("ok");
  })
});

io.on("ping", (respond) => {
  respond("ack");
})

const h3Server = new Http3Server({
  port,
  host: "0.0.0.0",
  secret: "changeit",
  cert,
  privKey: key,
});

h3Server.startServer();

(async () => {
  const stream = await h3Server.sessionStream("/socket.io/");
  const sessionReader = stream.getReader();

  while (true) {
    const { done, value } = await sessionReader.read();
    if (done) {
      break;
    }
    io.engine.onWebTransportSession(value);
  }
})();
