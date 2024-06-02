import { Chess } from 'chess.js' 

export default class MainScene extends Phaser.Scene {
    constructor() {
        super("MainScene");
    }

    preload() {
        this.load.image('b_r', 'assets/images/BlackRook.png');
        this.load.image('b_p', 'assets/images/BlackPawn.png');
        this.load.image('b_n', 'assets/images/BlackKnight.png');
        this.load.image('b_k', 'assets/images/BlackKing.png');
        this.load.image('b_q', 'assets/images/BlackQueen.png');
        this.load.image('b_b', 'assets/images/BlackBishop.png');

        this.load.image('w_r', 'assets/images/WhiteRook.png');
        this.load.image('w_p', 'assets/images/WhitePawn.png');
        this.load.image('w_n', 'assets/images/WhiteKnight.png');
        this.load.image('w_k', 'assets/images/WhiteKing.png');
        this.load.image('w_q', 'assets/images/WhiteQueen.png');
        this.load.image('w_b', 'assets/images/WhiteBishop.png');
    }

    create() {
        this.chess = new Chess();
    
        // Make a test move
        const move = this.chess.move('e4');
    
        // Check and log the move object
        if (move) {
            console.log('Move successful:', move);
        } else {
            console.log('Move failed:', move);
        }

        // Graphics object to draw squares
        const graphics = this.add.graphics({ fillStyle: { color: 0x000000 } });

        this.squareSize = 24;
        this.offSetX = 32;
        this.offSetY = 24;
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                // Calculate the x and y coordinates for each square
                let x = col * this.squareSize + this.offSetX;
                let y = row * this.squareSize + this.offSetY;

                // Alternate colors
                if ((row + col) % 2 === 0) {
                    graphics.fillStyle(0xFCE0A8, 1); //Light Squares (tan off-white)
                } else {
                    graphics.fillStyle(0x005800, 1); //Dark Squares (green)
                }

                // Draw the square
                graphics.fillRect(x, y, this.squareSize, this.squareSize);
            }
        }
        
        this.placePieces();
        // Log the current ASCII board (for debugging purposes)
        console.log(this.chess.ascii());
    }
   
    placePieces() {
        let board = this.chess.board();
        for (let row = 0; row < board.length; row++) {
            for (let col = 0; col < board[row].length; col++) {
                let piece = board[row][col];
                if (piece) {
                    let pieceKey = `${piece.color}_${piece.type}`; 
                    let x = col * this.squareSize + this.offSetX;
                    let y = row * this.squareSize + this.offSetY;

                    this.add.image(x + this.squareSize / 2, y + this.squareSize / 2, pieceKey);
                }
            }
        }
    }        
}