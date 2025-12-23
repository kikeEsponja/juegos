let cola = [];
let partidas = {};

function crearMazo() {
  const mazo = [];
  for (let i = 1; i <= 10; i++) {
    mazo.push(i, i);
  }
  return mazo.sort(() => Math.random() - 0.5);
}

export function initTW(io, socket) {
    console.log('🧠 Jugador conectado TW:', socket.id);

    socket.on('join-21', () => {
        cola.push(socket);
        console.log('⏳ En cola:', socket.id);

        if (cola.length >= 2) {
            const jugador1 = cola.shift();
            const jugador2 = cola.shift();

            const room = `tw-${jugador1.id}-${jugador2.id}`;
            jugador1.join(room);
            jugador2.join(room);

            const partida = {
                mazo: crearMazo(),
                jugadores: {
                    A: { id: jugador1.id, cartas: [], puntos: 0, plantado: false },
                    B: { id: jugador2.id, cartas: [], puntos: 0, plantado: false }
                },
                turno: 'A',
                finalizada: false
            };

            partidas[room] = partida;
            jugador1.room = room;
            jugador2.room = room;

            io.to(room).emit('inicio-partida');
            console.log(`🏟️ Partida TW creada: ${room}`);
        }
    });

    socket.on('pedir-carta', () => {
        const room = socket.room;
        const partida = partidas[room];
        if (!partida || partida.finalizada) return;

        const jugador = partida.jugadores.A.id === socket.id ? partida.jugadores.A : partida.jugadores.B;

        const carta = partida.mazo.pop();
        jugador.cartas.push(carta);
        jugador.puntos += carta;

        io.to(socket.id).emit('recibir-carta', {
            carta,
            puntos: jugador.puntos
        });

        if (jugador.puntos > 21) {
            partida.finalizada = true;

            const rival = partida.jugadores.A.id === socket.id ? partida.jugadores.B : partida.jugadores.A;

            io.to(room).emit('resultado', {
                mensaje: '💥 Te pasaste de 21. Has perdido',
                misPuntos: jugador.puntos,
                puntosRival: `Rival gana con ${rival.puntos}` //DEVOLVER A CERO SI FALLA o jugador.puntos
            });

            io.to(rival.id).emit('resultado', {
                mensaje: 'Tu rival se pasó de 21. GANASTE',
                misPuntos: rival.puntos,
                puntosRival: jugador.puntos
            });
        }
    });

    socket.on('plantarse', () => {
        const room = socket.room;
        const partida = partidas[room];
        if (!partida || partida.finalizada) return;

        const jugador = partida.jugadores.A.id === socket.id ? partida.jugadores.A : partida.jugadores.B;

        jugador.plantado = true;

        if(!ambosPlantados(partida)){
            cambiarTurno(partida);
        }

        evaluarFin(partida, room, io);

        function ambosPlantados(partida){
            return(
                partida.jugadores.A.plantado && partida.jugadores.B.plantado
            );
        }

        function evaluarFin(partida, room, io){
            const A = partida.jugadores.A;
            const B = partida.jugadores.B;

            if(A.puntos > 21 || B.puntos > 21 || ambosPlantados(partida)){
                partida.finalizada = true;

                let mensaje;

                if(A.puntos > 21){
                    mensaje = 'A se pasó';
                }else if(B.puntos > 21){
                    mensaje = 'B se pasó';
                }else if(A.puntos === B.puntos){
                    mensaje = 'Empate';
                }else{
                    mensaje = A.puntos > B.puntos ? 'Gana A' : 'GANA B';
                }

                const mensajeParaA = A.puntos > B.puntos ? 'GANASTE' : A.puntos < B.puntos ? 'PERDISTE' : 'EMPATE';
                const mensajeParaB = B.puntos > A.puntos ? 'GANASTE' : B.puntos < A.puntos ? 'PERDISTE' : 'EMPATE';

                io.to(A.id).emit('resultado', {
                    mensaje: mensajeParaA,
                    misPuntos: A.puntos,
                    puntosRival: B.puntos
                });
                io.to(B.id).emit('resultado', {
                    mensaje: mensajeParaB,
                    misPuntos: B.puntos,
                    puntosRival: A.puntos
                });
            }
        }

        function cambiarTurno(partida){
            partida.turno = partida.turno === 'A' ? 'B' : 'A';
        }

        socket.on('disconnect', () => {
            console.log('💀 Desertor:', socket.id);
            cola = cola.filter(s => s.id !== socket.id);
            if (socket.room) delete partidas[socket.room];
        });
    });
}