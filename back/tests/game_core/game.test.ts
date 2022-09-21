import {describe, expect, test} from '@jest/globals';
import { Game } from '../../game_core/game';

function sum(a: number, b:number): number
{
    return a + b;
}

describe('Game', () => {
  test('Hello world', () => {
    expect(sum(2, 2)).toBe(4);
  });
});