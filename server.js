import  http  from "node:http";
import { Server } from "socket.io";

const httpServer = http.createServer((req, res) => {
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

httpServer.listen(port, () => {
  console.log(`server listening at http://localhost:${port}`);
});

const io = new Server(httpServer, {
  cors: {
    origin: function (origin, callback){
      if(origin.substring(0,16) === 'http://localhost'){
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
});
