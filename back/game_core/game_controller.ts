import { Server } from "socket.io";
import { Game } from './game';
import { DOWN, Playfield, Statistics } from './constants';

type PlayerDictionary = {
  [key: string]: {
    game: Game;
    passNextAutomaticDown: boolean;
    breakAutomaticDown: boolean;
    moveBlock: boolean;
  }
};

class GameController
{
  private playerDictionary: PlayerDictionary = {};
  private startTime = 1000; // ms

  constructor(ids: string[], seed = Date.now(), rows = 0, cols = 0)
  {
    for (let id of ids) {
      this.playerDictionary[id] = {
        game: new Game(seed.toString(), rows, cols),
        passNextAutomaticDown: false,
        breakAutomaticDown: false,
        moveBlock: false
      };
    }
  }

  private moveDownAuto(time: number, id: string, io: Server)
  {
    const playerData = this.playerDictionary[id];

    if (playerData.breakAutomaticDown) {
      return;
    }
    if (playerData.game.getIsLostGame()) {
      playerData.breakAutomaticDown = true;
      return;
    }

    if (!playerData.passNextAutomaticDown) {
      playerData.game.moveTetromino(DOWN);
      
      Object.keys(this.playerDictionary).forEach((id) => {
        const playfields = this.getPlayfields(id);
        const stats = this.getStatistics(id);
        
        io.to(id).emit('returnPlayfields', playfields);
        io.to(id).emit('returnStatistics', stats);
      });
    }
    else {
      playerData.passNextAutomaticDown = false;
    }
 
    time = this.startTime - 20 * (playerData.game.getLevel() - 1);
    setTimeout(this.moveDownAuto.bind(this), time, time, id, io);
  }

  startGame(io: Server)
  {
    Object.keys(this.playerDictionary).forEach((player) => {
      setTimeout(this.moveDownAuto.bind(this), this.startTime, this.startTime, player, io);
    });
  }

  moveTetromino(id: string, direction: number)
  {
    const playerData = this.playerDictionary[id];

    if (playerData.moveBlock) {
      return;
    }

    playerData.passNextAutomaticDown = direction === DOWN;
    playerData.game.moveTetromino(direction);
  
    playerData.moveBlock = true;
    setTimeout(() => {
      playerData.moveBlock = false;
    }, 40);
  }
  
  rotateTetrominoWallkick(id: string, direction: number)
  {
    const playerData = this.playerDictionary[id];

    if (playerData.moveBlock) {
      return;
    }

    playerData.game.rotateTetrominoWallkick(direction);

    playerData.moveBlock = true;
    setTimeout(() => {
      playerData.moveBlock = false;
    }, 40);
  }

  checkLost(id: string): boolean
  {
    return this.playerDictionary[id].game.checkLost();
  }

  getPlayfields(id: string): Playfield[]
  {
    const playfields: Playfield[] = [];

    Object.keys(this.playerDictionary).forEach((_id) => {
      const playfield = this.playerDictionary[_id].game.getPlayfield();
      if (id === _id) {
        playfields.unshift(playfield);
      }
      else {
        playfields.push(playfield);
      }
    });

    return playfields;
  }

  getStatistics(id: string): Statistics[]
  {
    const statistics: Statistics[] = [];

    Object.keys(this.playerDictionary).forEach((_id) => {
      const game = this.playerDictionary[_id].game;
      const stat: Statistics = { level: game.getLevel(), score: game.getScore(), lines: game.getLines() };
       
      if (id === _id) {
        statistics.unshift(stat);
      }
      else {
        statistics.push(stat);
      }
    });

    return statistics;
  }
}

export { GameController };