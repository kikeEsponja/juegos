import express from 'express';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Server } from 'socket.io';

const app = express();
const server = createServer(app);
const io = new Server(server);

app.use(express.static('public'));

const __dirname = dirname(fileURLToPath(import.meta.url));

app.get('/', (req, res) =>{
    res.sendFile(join(__dirname, '/public/ppt.html'));
});

let jugadores = [];
let jugadas = {};
let yaJugo = {};
let cola = [];

io.on('connection', (socket) =>{
    console.log('🧠 jugador conectado', socket.id);
    console.log(' Conectado', socket.id);

    cola.push(socket);

    if(cola.length >= 2){
        const jugador1 = cola.shift();
        const jugador2 = cola.shift();

        const room = `sala-${jugador1.id}-${jugador2.id}`;

        jugador1.join(room);
        jugador2.join(room);

        jugador1.room = room;
        jugador2.room = room;

        jugador1.emit('inicio', { rival: jugador2.id });
        jugador2.emit('inicio', { rival: jugador1.id });

        console.log(`🏟️ Partida creada: ${room}`);
    }

    jugadores.push(socket.id);

    socket.on('jugada', (eleccion) =>{
        if(!socket.room) return;

        if(yaJugo[socket.id]){
            console.log('Jugada ignorada de', socket.id);
            return;
        }
        yaJugo[socket.id] = true;
        jugadas[socket.id] = eleccion;

        console.log(`🎮 ${socket.id} eligió: `, eleccion);

        if(Object.keys(jugadas).length === 2){
            const [j1, j2] = Object.keys(jugadas);
            const e1 = jugadas[j1];
            const e2 = jugadas[j2];

            const resultado = decidirGanador(e1, e2);

            io.to(j1).emit('resultado', {
                tuJugada: e1,
                rival: e2,
                resultado: resultado === 1 ? 'GANASTE' : resultado === 0 ? 'EMPATE' : 'PERDISTESSS'
            });

            io.to(j2).emit('resultado', {
                tuJugada: e2,
                rival: e1,
                resultado: resultado === 2 ? 'GANASTE' : resultado === 0 ? 'EMPATE' : 'PERDISTESSS'
            });

            jugadas = {};
            yaJugo = {};
        }

    });

    socket.on('disconnect', () =>{
        console.log('💀 jugador desconectado', socket.id);
        cola = cola.filter(s => s.id !== socket.id);
        delete jugadas[socket.id];
    });
});

function decidirGanador(a, b){
    if(a === b) return 0;

    if((a === 'piedra' && b === 'tijeras') || (a === 'tijeras' && b === 'papel') || (a === 'papel' && b === 'piedra')){
        return 1;
    }
    return 2;
}

server.listen(3000, ()=>{
    console.log('⚡ servidor corriendo en puerto 3000');
});