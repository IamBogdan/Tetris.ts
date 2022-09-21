import { v4 as uuidv4 } from 'uuid';
import { PlayerData } from './player_data';

class Pool
{
  private pool: { [id: string]: PlayerData } = {};

  /**
   * Pushes the data in the pool
   * @param data - the player data
   * @returns the id (key) where the data is in the pool
   * @memberof Pool
   */
  pushDataIntoPool(data: PlayerData): string
  {
    const id = uuidv4();
    this.pool[id] = data;
    data.poolId = id;
    return id;
  }

  /**
   * Deletes the data from the pool by the id (key)
   * @param id - the id (key) where the data is in the pool
   * @returns the data that has been deleted
   * @memberof Pool
   */
  deleteDataFromPool(id: string): PlayerData
  { 
    const data = this.pool[id];
    delete this.pool[id];
    return data;
  }
  
  /**
   * Finds an opponent, deletes the opponent data from the pool
   * @param finderData - the player data
   * @returns the data of the opponent found
   * @memberof Pool
   */
  findOpponentForAnonyms(finderData: PlayerData): PlayerData | null
  {
    for (let [id, candidate] of Object.entries(this.pool)) {
      if (!candidate) {
        continue;
      }

      if (candidate.socketId !== finderData.socketId) {
        this.deleteDataFromPool(id);
        candidate.poolId = undefined;
        return candidate;
      }
    }
    
    return null;
  }
}

const pool = new Pool();

export { Pool, pool }