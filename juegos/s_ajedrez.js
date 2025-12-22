export function initPPT(io, socket){
    let partidas = {};
    let jugadas = {};
    let yaJugo = {};
    let cola = [];

    console.log('Jugador conectado (PPT)', socket.id);

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

        partidas[room] = {
            jugadas: {},
            yaJugo: {}
        };
    }

    //jugadores.push(socket.id);

    socket.on('jugada', (eleccion) =>{
        const partida = partidas[socket.room];
        if(!partida) return;

        if(partida.yaJugo[socket.id]) return;

        partida.yaJugo[socket.id] = true;
        partida.jugadas[socket.id] = eleccion;

        console.log(`🎮 ${socket.id} eligió: `, eleccion);

        if(Object.keys(partida.jugadas).length === 2){
            const [j1, j2] = Object.keys(partida.jugadas);
            const e1 = partida.jugadas[j1];
            const e2 = partida.jugadas[j2];

            const r = decidirGanador(e1, e2);

            io.to(j1).emit('resultado', {
                tuJugada: e1,
                rival: e2,
                resultado: r === 1 ? 'GANASTE' : r === 0 ? 'EMPATE' : 'PERDISTESSS'
            });

            io.to(j2).emit('resultado', {
                tuJugada: e2,
                rival: e1,
                resultado: r === 2 ? 'GANASTE' : r === 0 ? 'EMPATE' : 'PERDISTESSS'
            });

            partida.jugadas = {};
            partida.yaJugo = {};
            io.to(socket.room).emit('nueva-ronda');
        }

    });

    socket.on('disconnect', () =>{
        console.log('💀 jugador desconectado', socket.id);
        cola = cola.filter(s => s.id !== socket.id);
        if(socket.room && partidas[socket.room]){
            delete partidas[socket.room];
        }
    });
};

function decidirGanador(a, b){
    if(a === b) return 0;

    if((a === 'Piedra' && b === 'Tijeras') || (a === 'Tijeras' && b === 'Papel') || (a === 'Papel' && b === 'Piedra')){
        return 1;
    }else{
        return 2;
    }
}