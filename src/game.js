export default class Game {
  static point = {
    '1': 40,
    '2': 100,
    '3': 300,
    '4': 1200
  }
  constructor() {
    this.reset();
  }

  get level() {
    return Math.floor(this.lines * 0.1);
  }

  getState() {
    const playfield = this.createPlayfield();
    for (let y = 0; y < this.playfield.length; y++) {
      playfield[y] = [];
      for (let x = 0; x < this.playfield[y].length; x++) {
        playfield[y][x] = this.playfield[y][x];
      }
    }

    for (let y = 0; y < this.activePiece.blocks.length; y++) {
      for (let x = 0; x < this.activePiece.blocks[y].length; x++) {
        if (this.activePiece.blocks[y][x]) {
          playfield[this.activePiece.y + y][this.activePiece.x + x] = this.activePiece.blocks[y][x];
        }
      }
    }
    return {
      score: this.score,
      level: this.level,
      lines: this.lines,
      nextPiece: this.nextPiece,
      playfield,
      isGameOver: this.tapOut
    }
  }

  createPlayfield() {
    const playfield = [];

    for (let y = 0; y < 20; y++) {
      playfield[y] = [];
      for (let x = 0; x < 10; x++) {
        playfield[y][x] = 0;
      }
    }
    return playfield;
  }

  createPiece() {
    const index = Math.floor(Math.random() * 7);
    const type = 'IJLOSTZ'[index];
    const piece = {};

    switch (type) {
      case 'I':
        piece.blocks = [
          [0, 0, 0, 0],
          [1, 1, 1, 1],
          [0, 0, 0, 0],
          [0, 0, 0, 0]
        ];
        break;
      case 'J':
        piece.blocks = [
          [0, 0, 0],
          [1, 1, 1],
          [0, 0, 1]
        ];
        break;
      case 'L':
        piece.blocks = [
          [0, 0, 0],
          [1, 1, 1],
          [1, 0, 0]
        ];
        break;
      case 'O':
        piece.blocks = [
          [0, 0, 0, 0],
          [0, 1, 1, 0],
          [0, 1, 1, 0],
          [0, 0, 0, 0]
        ];
        break;
      case 'S':
        piece.blocks = [
          [0, 0, 0],
          [0, 1, 1],
          [1, 1, 0]
        ];
        break;
      case 'T':
        piece.blocks = [
          [0, 0, 0],
          [1, 1, 1],
          [0, 1, 0]
        ];
        break;
      case 'Z':
        piece.blocks = [
          [0, 0, 0],
          [1, 1, 0],
          [0, 1, 1]
        ];
        break;
      default:
        throw new Error('Неизвестный тмп фигуры');
    }

    piece.x = Math.floor((10 - piece.blocks[0].length) / 2);
    piece.y = -1;

    const colorIndex = Math.floor(1 + Math.random() * 7);

    for (let i = 0; i < piece.blocks.length; i++) {
      for (let k = 0; k < piece.blocks[i].length; k++) {
        if (piece.blocks[i][k]) {
          piece.blocks[i][k] = colorIndex;
        }
      }
    }
    // console.log(piece.blocks);
    return piece;

  }

  movePieceLeft() {
    this.activePiece.x -= 1;

    if (this.hasCollision()) {
      this.activePiece.x += 1;
    }
  };

  movePieceRight() {
    this.activePiece.x += 1;

    if (this.hasCollision()) {
      this.activePiece.x -= 1;
    }
  };

  movePieceDown() {
    if (this.tapOut) return;

    this.activePiece.y += 1;

    if (this.hasCollision()) {
      this.activePiece.y -= 1;
      this.lockPiece();
      const clearedLines = this.clearLines();
      this.updateScore(clearedLines);
      this.updatePeaces();
    }

    if (this.hasCollision()) {
      this.tapOut = true;
    }
  };

  rotatePeace() {
    let blocks = this.activePiece.blocks;
    let length = blocks.length;

    let temp = [];
    for (let i = 0; i < length; i++) {
      temp[i] = new Array(length).fill(0);

    }
    for (let y = 0; y < length; y++) {
      for (let x = 0; x < length; x++) {
        temp[x][y] = blocks[length - 1 - y][x];
      }
    }
    this.activePiece.blocks = temp;

    if (this.hasCollision()) {
      this.activePiece.blocks = blocks;
    }
  }

  hasCollision() {
    const { y: pieceY, x: pieceX, blocks } = this.activePiece;

    for (let y = 0; y < blocks.length; y++) {
      for (let x = 0; x < blocks[y].length; x++) {
        if (
          blocks[y][x] &&
          ((this.playfield[pieceY + y] === undefined || this.playfield[pieceY + y][pieceX + x] === undefined) ||
            this.playfield[pieceY + y][pieceX + x])
        ) {
          return true;
        }
      }
    }
    return false;
  };

  lockPiece() {
    const { y: pieceY, x: pieceX, blocks } = this.activePiece;

    for (let y = 0; y < blocks.length; y++) {
      for (let x = 0; x < blocks[y].length; x++) {
        if (blocks[y][x]) {
          this.playfield[pieceY + y][pieceX + x] = blocks[y][x];
        }
      }
    }

  }

  clearLines() {
    const rows = 20;
    const columns = 10;
    let lines = [];

    for (let y = rows - 1; y >= 0; y--) {
      let numberOfBlocks = 0;
      for (let x = 0; x < columns; x++) {
        if (this.playfield[y][x]) {
          numberOfBlocks++;
        }
      }

      if (numberOfBlocks === 0) {
        break;
      } else if (numberOfBlocks < columns) {
        continue;
      } else if (numberOfBlocks === columns) {
        lines.unshift(y);
      }
    }

    for (let index of lines) {
      this.playfield.splice(index, 1);
      this.playfield.unshift(new Array(columns).fill(0));
    }
    return lines.length;
  }

  updateScore(clearedLines) {
    if (clearedLines > 0) {
      this.score += Game.point[clearedLines] * (this.level + 1);
      this.lines += clearedLines;
    }
  
  }

  updatePeaces() {
    this.activePiece = this.nextPiece;
    this.nextPiece = this.createPiece();
  }

  reset() {
    this.score = 0;
    this.lines = 0;
    this.tapOut = false;
    this.playfield = this.createPlayfield();
    this.activePiece = this.createPiece();
    this.nextPiece = this.createPiece();
  }
}