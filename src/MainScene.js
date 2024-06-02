import { Chess } from 'chess.js' 

export default class MainScene extends Phaser.Scene {
    constructor() {
        super("MainScene");
    }

    preload() {
        this.load.image('b_rook', 'assets/images/BlackRook.png');
        this.load.image('b_pawn', 'assets/images/BlackPawn.png');
        this.load.image('b_knight', 'assets/images/BlackKnight.png');
        this.load.image('b_king', 'assets/images/BlackKing.png');
        this.load.image('b_queen', 'assets/images/BlackQueen.png');
        this.load.image('b_bishop', 'assets/images/BlackBishop.png');

        this.load.image('w_rook', 'assets/images/WhiteRook.png');
        this.load.image('w_pawn', 'assets/images/WhitePawn.png');
        this.load.image('w_knight', 'assets/images/WhiteKnight.png');
        this.load.image('w_king', 'assets/images/WhiteKing.png');
        this.load.image('w_queen', 'assets/images/WhiteQueen.png');
        this.load.image('w_bishop', 'assets/images/WhiteBishop.png');
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

        const squareSize = 24;
        const offSetX = 32;
        const offSetY = 24;
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                // Calculate the x and y coordinates for each square
                let x = col * squareSize + offSetX;
                let y = row * squareSize + offSetY;

                // Alternate colors
                if ((row + col) % 2 === 0) {
                    graphics.fillStyle(0xF8F8F8, 1); // Light Squares (off-white)
                } else {
                    graphics.fillStyle(0x005800, 1); //Dark Squares (green)
                }

                // Draw the square
                graphics.fillRect(x, y, squareSize, squareSize);
            }
        }
    
        // Log the current ASCII board (for debugging purposes)
        console.log(this.chess.ascii());
    }        
}