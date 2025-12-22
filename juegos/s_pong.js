export function initPong(io){
    const pongNamespace = io.of('/pong');

    let readyPlayerCount = 0;

    pongNamespace.on('connection', (socket) =>{
        let room;

        console.log('Jugador conectado a PONG', socket.id);

        socket.on('ready', () => {
          room = 'room' + Math.floor(readyPlayerCount / 2);
          socket.join(room);

          console.log('Player ready', socket.id, room);

          readyPlayerCount++;

          if (readyPlayerCount % 2 === 0) {
            const players = Array.from(pongNamespace.adapter.rooms.get(room));
            pongNamespace.to(room).emit('startGame', players[0]);
          }
        });

        socket.on('paddleMove', (data) => {
            socket.to(room).emit('paddleMove', data);
        });

        socket.on('ballMove', (data) => {
          socket.to(room).emit('ballMove', data);
        });

        socket.on('disconnect', (reason) => {
          console.log('usuario PONG desconectado', socket.id);
          readyPlayerCount = Math.max(readyPlayerCount -1, 0);
        });
    });
};