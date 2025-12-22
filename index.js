import express from 'express';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Server } from 'socket.io';
import { initPPT } from './juegos/s_ppt.js';
import { initPong } from './juegos/s_pong.js';
import { initTW } from './juegos/s_tw.js';

const app = express();
const server = createServer(app);
const io = new Server(server);

app.use(express.static('public'));

const __dirname = dirname(fileURLToPath(import.meta.url));

app.get('/', (req, res) =>{
    res.sendFile(join(__dirname, '/public/'));
});

io.on('connection', (socket) => {
    socket.on('join-ppt', () => initPPT(io, socket));
    socket.on('join-tw', () => initTW(io, socket));
});

initPong(io);

server.listen(3000, ()=>{
    console.log('⚡ servidor corriendo en puerto 3000');
});