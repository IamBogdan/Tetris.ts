import { v4 as uuidv4 } from 'uuid';
import { GameController } from '../game_core/game_controller';
import { PlayerData } from './player_data';

class RoomData
{
  public roomId:         string;
  public isStarted:      boolean;
  public playersData:    PlayerData[];
  public gameController: GameController;

  constructor(roomId:         string,
              isStarted:      boolean,
              playersData:    PlayerData[],
              gameController: GameController)
  {
    this.roomId         = roomId;
    this.isStarted      = isStarted;
    this.playersData    = playersData;
    this.gameController = gameController;
  }
  
  static generateRoomId()
  {
    return uuidv4();
  }
}

export { RoomData }