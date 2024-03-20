import { Server } from "socket.io";
import { createServer } from "node:http";

const socketServer = () => {
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
    })

    io.on("ping", (respond) => {
        respond("ack");
    });

    return io;
}

export default socketServer;