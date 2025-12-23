export function initPong(io){
    const pongNamespace = io.of('/pong');

    let waitingPlayer = null;

    pongNamespace.on('connection', (socket) =>{
        console.log('Jugador conectado a PONG', socket.id);

        socket.on('ready', () => {
          if(waitingPlayer){
            const room = `pong-room-${waitingPlayer.id}-${socket.id}`;

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