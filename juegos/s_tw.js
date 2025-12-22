let partidas = {};
let cola = [];

/*let partidas[room] = {
    mazo: [],
    jugadores: {
        A: { id: jugador1.id, cartas: [], puntos: 0, plantado: false },
        B: { id: jugador2.id, cartas: [], puntos: 0, plantado: false }
    },
    Turno: 'A',
    finalizada: false
};*/

function crearMazo(){
    const mazo = [];
    for(let i = 1; i <= 10; i++){
        mazo.push(i, i);
    }
    return mazo.sort(() => Math.random() -0.5);
}

function obtenerJugador(partida, socketId){
    return Object.keys(partida.jugadores)
        .find(k => partida.jugadores[k].id === socketId);
}

function esSuTurno(partida, socketId){
    return partida.turno === obtenerClaveJugador(partida, socketId);
}

function terminarPartida(io, room, partida){
    const { A, B } = partida.jugadores;

    let resultado;

    if(A.puntos > 21 && B.puntos > 21){
        resultado = 'EMPATE';
    }else if(A.puntos > 21){
        resultado = 'B';
    }else if(B.puntos > 21){
        resultado = 'A';
    }else if(A.puntos === B.puntos){
        resultado = 'EMPATE';
    }else{
        resultado = A.puntos > B.puntos ? 'A' : 'B';
    }

    io.to(room).emit('fin-partida', {
        jugadores: {
            A: { puntos: A.puntos, cartas: A.cartas },
            B: { puntos: B.puntos, cartas: B.cartas }
        },
    });
}

function enviarEstado(io, room, partida){
    for(const [clave, jugador] of Object.entries(parties.jugadores)){
        io.to(jugador.id).emit('estado', {
            tusCartas: jugador.cartas,
            tusPuntos: jugador.puntos,
            tuTurno: partida.turno === clave,
            rivalPlantado: Object.values(partida.jugadores)
                .find(j => j.id !== jugador.id).plantado
        });
    }
}

export function initTW(io, socket){
    console.log('Jugador conectado (21)', socket.id);

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
            mazo: crearMazo(),
            jugadores: {
                A: { id: jugador1.id, cartas: [], puntos: 0, plantado: false },
                A: { id: jugador2.id, cartas: [], puntos: 0, plantado: false }
            },
            turno: 'A',
            finalizada: false
        };

        for(let i = 0; i < 2; i++){
            partidas[room].jugadores.A.cartas.push(partidas[room].mazo.pop());
            partidas[room].jugadores.B.cartas.push(partidas[room].mazo.pop());
        }

        partidas[room].jugadores.A.puntos = partidas[room].jugadores.A.cartas.reduce((a, b) => a + b, 0);
        partidas[room].jugadores.B.puntos = partidas[room].jugadores.B.cartas.reduce((a, b) => a + b, 0);

        jugador1.emit('inicio', { letra: 'A' });
        jugador2.emit('inicio', { letra: 'B' });

        enviarEstado(io, room, partidas[room]);

        console.log(`Partida de 21 creada: ${room}`);
    }

    socket.on('pedir-carta', () =>{
        const partida = partidas[socket.room];
        if(!partida || partida.finalizada) return;
        if(!esSuTurno(partida, socket.id)) return;

        const jugador = obtenerJugador(partida, socket.id);
        
        const carta = partida.mazo.pop();
        jugador.cartas.push(carta);
        jugador.puntos += carta;

        if(jugador.puntos > 21){
            partida.finalizada = true;
            terminarPartida(io, socket.room, partida);
            return;
        }
        partida.turno = partida.turno === 'A' ? 'B' : 'A';
        enviarEstado(io, socket, partida);
    });

    socket.on('plantarse', () =>{
        const partida = partidas[socket.room];
        if(!partida || partida.finalizada) return;

        const jugador = obtenerJugador(partida, socket.id);
        jugador.plantado = true;

        const { A, B } = partida.jugadores;

        if(A.plantado && B.plantado){
            partida.finalizada = true;
            terminarPartida(io, socket.room, partida);
            return;
        }

        partida.turno = partida.turno === 'A' ? 'B' : 'A';
        enviarEstado(io, socket.room, partida);
    });

    socket.on('disconnect', () =>{
        console.log('💀 jugador desconectado', socket.id);
        cola = cola.filter(s => s.id !== socket.id);
        if(socket.room && partidas[socket.room]){
            delete partidas[socket.room];
        }
    });
};