import { Square, State } from './index';

export class WinnerRetriever {
  public boardSize: number;
  public squares: Square[] = [];

  public constructor(squares: Square[], size: number) {
    this.squares = squares;
    this.boardSize = size;
  }

  public getWinningIndexesFor(square: Square): number[] {
    let steps = [
      this.getWinningSquareIndexesInRowOf,
      this.getWinningSquareIndexesInColumnOf,
      this.getWinningIndexesInDiagonal,
      this.getWinningIndexesInAntiDiagonal
    ];

    for (let step of steps) {
      let winningIndexes = step.call(this, square);
      if (winningIndexes) {
        return winningIndexes;
      }
    }
  }

  public getEmptySquares(): Square[] {
    let emptySquareIndexes: Square[] = [];

    for(let i = 0; i < 9; i++) {
      if(this.squares[i].state === State.Blank) {
        emptySquareIndexes.push(this.squares[i]);
      }
    }

    return emptySquareIndexes;
  }

  public calculateBoard(): any[] {
    const squares: Square[] = this.squares;
    let origBoard: any[] = [];

    for (let i = 0; i < squares.length; i++) {
      switch(squares[i].state) {
        case State.Cross: 
          origBoard.push('X');
        break;
        case State.Circle:
          origBoard.push('O');
        break;
        default:
          origBoard.push(i);
        break;
      }
    }

    return origBoard;
  }

  public getBestSpot(index: number): Square {
    return this.squares[index];
  }

  private getWinningIndexesInDiagonal(square: Square): number[] {
    if(square.xPosition == square.yPosition) {
      return this.getWinningSquareIndexes(square, 0, this.boardSize + 1);
    }
  }

  private getWinningSquareIndexesInRowOf(square: Square): number[]  {
    const numberOfSquares = this.boardSize * square.xPosition;
    return this.getWinningSquareIndexes(square, numberOfSquares, 1);
  }

  private getWinningSquareIndexesInColumnOf(square: Square): number[] {
    return this.getWinningSquareIndexes(square, square.yPosition, this.boardSize);
  }

  private getWinningIndexesInAntiDiagonal(square: Square): number[] {
    if(square.xPosition + square.yPosition === this.boardSize - 1) {
      return this.getWinningSquareIndexes(square, this.boardSize - 1, this.boardSize -1);
    }
  }

  private getWinningSquareIndexes(square: Square, offsetInitvalue: number, offsetIncrement): number[] {
    let winningSeriesIndexes: number[] = [];
    let offset = offsetInitvalue;

    for(let i = 0; i < this.boardSize; i++) {
      if(this.squares[offset].state != square.state) {
        return undefined;
      }

      winningSeriesIndexes.push(offset);
      offset += offsetIncrement;
    }

    return winningSeriesIndexes;
  }
}