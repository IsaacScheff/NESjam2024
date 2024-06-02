import Phaser from 'phaser';
import MainScene from './MainScene';

const config = {
    type: Phaser.AUTO,
    width: 256,
    height: 240,
    parent: 'game-container',
    physics: {
        default: 'arcade',
        matter: {
            gravity: { y: 0 },
            debug: false 
        }
    },
    scene: [MainScene]
};

new Phaser.Game(config);
// import Phaser from 'phaser';
// import { Chess } from 'chess.js';

// const config = {
//     type: Phaser.AUTO,
//     width: 256,
//     height: 240,
//     physics: {
//         default: 'arcade',
//         arcade: {
//             gravity: { y: 300 }
//         }
//     },
//     scene: {
//         preload: preload,
//         create: create,
//         update: update
//     }
// };

// const game = new Phaser.Game(config);

// function preload() {
//     // this.load.image('b_rook', 'assets/images/BlackRook.png');
//     // this.load.image('b_pawn', 'assets/images/BlackPawm.png');
//     // this.load.image('b_knight', 'assets/images/BlackKnight.png');
//     // this.load.image('b_king', 'assets/images/BlackKing.png');
//     // this.load.image('b_queen', 'assets/images/BlackQueen.png');
//     // this.load.image('b_bishop', 'assets/images/BlackBishop.png');

//     // this.load.image('w_rook', 'assets/images/WhiteRook.png');
//     // this.load.image('w_pawn', 'assets/images/WhitePawn.png');
//     // this.load.image('w_knight', 'assets/images/WhiteKnight.png');
//     // this.load.image('w_king', 'assets/images/WhiteKing.png');
//     // this.load.image('w_queen', 'assets/images/WhiteQueen.png');
//     // this.load.image('w_bishop', 'assets/images/WhiteBishop.png');
// }

// function create() {
//     this.load.image('b_rook', 'assets/images/BlackRook.png');
//     this.load.image('b_pawn', 'assets/images/BlackPawm.png');
//     this.load.image('b_knight', 'assets/images/BlackKnight.png');
//     this.load.image('b_king', 'assets/images/BlackKing.png');
//     this.load.image('b_queen', 'assets/images/BlackQueen.png');
//     this.load.image('b_bishop', 'assets/images/BlackBishop.png');

//     this.load.image('w_rook', 'assets/images/WhiteRook.png');
//     this.load.image('w_pawn', 'assets/images/WhitePawn.png');
//     this.load.image('w_knight', 'assets/images/WhiteKnight.png');
//     this.load.image('w_king', 'assets/images/WhiteKing.png');
//     this.load.image('w_queen', 'assets/images/WhiteQueen.png');
//     this.load.image('w_bishop', 'assets/images/WhiteBishop.png');
//     this.chess = new Chess();

//     // Make a test move
//     const move = this.chess.move('e4');

//     // Check and log the move object
//     if (move) {
//         console.log('Move successful:', move);
//     } else {
//         console.log('Move failed:', move);
//     }

//     // Log the current ASCII board (for debugging purposes)
//     console.log(this.chess.ascii());
//     createBoard(this);
// }

// function createBoard(scene) {
//     const boardSize = 224; // Total size of the board
//     const squareSize = boardSize / 8; // Size of each square
//     //const offset = (256 - boardSize) / 2; // Center the board in the game width

//     const board = scene.chess.board();

//     for (let i = 0; i < 8; i++) {
//         for (let j = 0; j < 8; j++) {
//             const piece = board[i][j];
//             const x = j * squareSize + squareSize / 2;
//             const y = i * squareSize + squareSize / 2;

//             // Create a square
//             const color = (i + j) % 2 === 0 ? 0xFFFFFF : 0x000000;
//             const square = scene.add.rectangle(x, y, squareSize, squareSize, color);
//             square.setOrigin(0.5, 0.5); // Center the square

//             // // Place a piece if there is one
//             if (piece) {
//                 scene.add.image(x, y, piece.color + '_' + piece.type);
//             }
//         }
//     }
// }

// function update() { 
    
// }
