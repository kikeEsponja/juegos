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

io.on('connection', (socket) =>{
    console.log('🧠 jugador conectado', socket.id);
    jugadores.push(socket.id);

    socket.on('jugada', (eleccion) =>{
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
        jugadores = jugadores.filter(id => id !== socket.id);
        delete jugadas[socket.id];
    });
});

function decidirGanador(a, b){
    if(a === b) return 0;

    if((a === 'Piedra' && b === 'Tijeras') || (a === 'Tijeras' && b === 'Papel') || (a === 'Papel' && b === 'Piedra')){
        return 1;
    }
    return 2;
}

server.listen(3000, ()=>{
    console.log('⚡ servidor corriendo en puerto 3000');
});