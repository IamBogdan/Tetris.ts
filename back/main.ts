import express from 'express';
import { createServer } from 'http';
import { Server } from "socket.io";
import path from 'path';
import { listenIO } from './io/main_socket';

const PORT = 3000;

const app = express();
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.use(express.static(path.join(__dirname, '..', 'front')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'front', 'main.html'));
});

function startServer()
{
  listenIO(io);
  server.listen(PORT, () => {  
    console.log(`Server started. PID: ${process.pid}. Listening port: ${PORT}.`);
  });
} 

startServer();