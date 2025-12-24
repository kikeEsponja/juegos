export function initPong(io){
    const pongNamespace = io.of('/pong');
    const partidas = {};
    let waitingPlayer = null;

    //const room = `sala-${pongNamespace.id}-${pongNamespace.id}`;

    pongNamespace.on('connection', (socket) =>{
        console.log('Jugador conectado a PONG', socket.id);

        socket.on('ready', () => {
          if(waitingPlayer){
            const room = `pong-room-${waitingPlayer.id}-${socket.id}`;

            partidas[room] = {
              score: [0, 0],
              finalizada: false
            }

            waitingPlayer.join(room);
            socket.join(room);

            waitingPlayer.room = room;
            socket.room = room;

            pongNamespace.to(room).emit('startGame', waitingPlayer.id);

            waitingPlayer = null;
          }else{
            waitingPlayer = socket;
            console.log(`jugador ${socket.id} esperando oponente...`);
          }
        });

        socket.on('paddleMove', (data) => {
            socket.to(socket.room).emit('paddleMove', data);
        });

        socket.on('ballMove', (data) => {
          socket.to(socket.room).emit('ballMove', data);
        });

        socket.on('goal', ({ scorer }) =>{
          const room = socket.room;
          const partida = partidas[room];

          if(!partida || partida.finalizada) return;

          partida.score[scorer]++;

          pongNamespace.to(room).emit('scoreUpdate', partida.score);

          if(partida.score[scorer] >= 10){
            partida.finalizada = true;

            pongNamespace.to(room).emit('gameOver', {
              ganador: scorer,
              score: partida.score
            });
          }
        });

        socket.on('disconnect', (reason) => {
          console.log('usuario PONG desconectado', socket.id);
          if(waitingPlayer && waitingPlayer.id === socket.id){
            waitingPlayer = null;
          }

          if(socket.room){
            socket.to(socket.room).emit('opponentLeft');
          }
        });
    });
}