export const LEFT  = -1;
export const RIGHT = 1;
export const DOWN  = 2;

export const LONG        = 'I';
export const SQUARE      = 'Q';
export const T_SPINS     = 'T';
export const RIGHT_SNAKE = 'S';
export const LEFT_SNAKE  = 'Z';
export const LEFT_GUN    = 'J';
export const RIGHT_GUN   = 'L';

export type Playfield = (string|number)[][];

export type Statistics = {
level: number;
  score: number;
  lines: number;
};