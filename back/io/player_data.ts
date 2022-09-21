import { RoomData } from './room_data';

class PlayerData
{
  public socketId:  string;
  //public username:  string;
  public isPlaying: boolean;
  public room?:     RoomData;
  public poolId?:   string;

  constructor(socketId:  string,
              //username:  string,
              isPlaying: boolean = false,
              room?:     RoomData,
              poolId?:   string)
  {
    this.socketId  = socketId;
    this.room      = room;
    //this.username  = username;
    this.isPlaying = isPlaying;
    this.poolId    = poolId;
  }
}

export { PlayerData }