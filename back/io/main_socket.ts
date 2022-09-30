import { Server } from "socket.io";
import { RoomData } from './room_data';
import { PlayerData } from './player_data';
import { pool } from './pool';
import { GameController } from '../game_core/game_controller';
import { DOWN } from './../game_core/constants';

declare module 'socket.io' {
  interface SocketData {
    playerData: PlayerData;
  }
}

function listenIO(io: Server) 
{
  io.on('connection', (socket: any) => {
    const playerData = new PlayerData(socket.id, false);
    socket.data.playerData = playerData;

    socket.on('findGame', () => {
      if (playerData.isPlaying || playerData.room || playerData.poolId) {
        return;
      }
      //console.log('findGame socket: ', playerData.socketId);

      const opponentData = pool.findOpponentForAnonyms(playerData);
      
      if (opponentData) {
        const controller = new GameController([socket.id, opponentData.socketId]);
        const roomData = new RoomData(RoomData.generateRoomId(), false, [playerData, opponentData], controller);

        playerData.room = roomData;
        opponentData.room = roomData; // changes opp's data, too

        // joins
        socket.join(playerData.room.roomId);
        io.sockets.sockets.get(opponentData.socketId)!.join(playerData.room.roomId);

        join(playerData.room.roomId, socket.id);
        join(playerData.room.roomId, opponentData.socketId);
      }
      else {
        pool.pushDataIntoPool(playerData);
      }
    });

    const join = (roomId: string, socketId: string) => {
      const room = io.sockets.adapter.rooms.get(roomId)!;
      const user = io.sockets.sockets.get(socketId)!;
      const userData: PlayerData = user.data.playerData;

      if (!userData || !userData.room || userData.isPlaying) {
        return;
      }
      
      userData.isPlaying = true;

      if (room.size == userData.room.playersData.length) {
        // console.log('join::start game');

        // start game
        if (!userData.room.isStarted) {
          userData.room.isStarted = true; // changes for another sockets
          userData.room.gameController.startGame(io);
        }
       }
    }

    socket.on('moveTetromino', (direction: number) => {
      if (!playerData.isPlaying || !playerData.room || !playerData.room.isStarted) {
        return;
      }
      const controller = playerData.room.gameController;

      controller.moveTetromino(socket.id, direction);

      const isDown = direction === DOWN;
      playerData.room.playersData.forEach((player: PlayerData) => {
        const playfields = controller.getPlayfields(player.socketId);
        io.to(player.socketId).emit('returnPlayfields', playfields);
        
        if (isDown) {
          const stats = controller.getStatistics(player.socketId);
          io.to(player.socketId).emit('returnStatistics', stats);
        }
      });
    });

    socket.on('dropHard', () => {
      if (!playerData.isPlaying || !playerData.room || !playerData.room.isStarted) {
        return;
      }
      const controller = playerData.room.gameController;

      controller.dropHard(socket.id);

      playerData.room.playersData.forEach((player) => {
        const playfields = controller.getPlayfields(player.socketId);

        io.to(player.socketId).emit('returnPlayfields', playfields);
      });
    });

    socket.on('rotateTetromino', (direction: number) => {
      if (!playerData.isPlaying || !playerData.room || !playerData.room.isStarted) {
        return;
      }
      const controller = playerData.room.gameController;

      controller.rotateTetrominoWallkick(socket.id, direction);
      
      playerData.room.playersData.forEach((player) => {
        const playfields = controller.getPlayfields(player.socketId);

        io.to(player.socketId).emit('returnPlayfields', playfields);
      });
    });

    socket.on('disconnect', (reason: any) => {
      if (playerData.poolId) {
        pool.deleteDataFromPool(playerData.poolId);
      }
      if (playerData.isPlaying && playerData.room && playerData.room.isStarted) {
        const room = io.sockets.adapter.rooms.get(playerData.room.roomId);
        
        if (room && room.size === 1) {
          // TODO: make the victory after getting more points than the opponent
          const remainingSocketId = room.values().next().value;
          io.to(remainingSocketId).emit('returnWin');
          io.sockets.sockets.get(remainingSocketId)?.disconnect();
        }
      }
    });
  });
}

export { listenIO };