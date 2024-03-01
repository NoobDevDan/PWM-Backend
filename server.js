const {Server} = require("socket.io");
const http = require('node:http');

const httpServer = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello World\n');
});

const port = process.env.PORT || 3000;

httpServer.listen(port, () => {
  console.log(`server listening at http://localhost:${port}`);
});

const io = new Server(httpServer);

io.on("connection", (socket) => {
  console.log(`connected with transport ${socket.conn.transport.name}`);

  socket.conn.on("upgrade", (transport) => {
    console.log(`transport upgraded to ${transport.name}`);
  });

  socket.on("disconnect", (reason) => {
    console.log(`disconnected due to ${reason}`);
  });
});