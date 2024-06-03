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

        this.load.image('cursorBase', 'assets/images/CursorBase.png');
        this.load.image('cursorOuter', 'assets/images/CursorOuter.png');
        this.load.image('cursorMiddle', 'assets/images/CursorMiddle.png');
        this.load.image('cursorInner', 'assets/images/CursorInner.png');
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

        this.anims.create({
            key: 'cursorAnimation',
            frames: [
                { key: 'cursorBase' },
                { key: 'cursorOuter' },
                { key: 'cursorMiddle' },
                { key: 'cursorInner' }
            ],
            frameRate: 3,  
            repeat: -1  // loops permanantly 
        });
        this.cursorCol = 4; // cursor initialised on e2
        this.cursorRow = 6; 
        const cursor = this.add.sprite(
            (this.cursorCol + 0.5)* this.squareSize + this.offSetX, 
            (this.cursorRow + 0.5)* this.squareSize + this.offSetY, 
            'cursorBase'
        );
    
        cursor.play('cursorAnimation');
        this.cursorSprite = cursor;
        this.cursors = this.input.keyboard.createCursorKeys();

        this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);  
        this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

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
    
    update() {
        if (Phaser.Input.Keyboard.JustDown(this.cursors.left) || Phaser.Input.Keyboard.JustDown(this.keyA)) {
            this.moveCursor(-1, 0);
        } else if (Phaser.Input.Keyboard.JustDown(this.cursors.right) || Phaser.Input.Keyboard.JustDown(this.keyD)) {
            this.moveCursor(1, 0);
        } else if (Phaser.Input.Keyboard.JustDown(this.cursors.up) || Phaser.Input.Keyboard.JustDown(this.keyW)) {
            this.moveCursor(0, -1);
        } else if (Phaser.Input.Keyboard.JustDown(this.cursors.down) || Phaser.Input.Keyboard.JustDown(this.keyS)) {
            this.moveCursor(0, 1);
        }
    }
    
    moveCursor(dx, dy) { //the added 0.5 to column and row value correct cursor alignment
        // Temporarily calculate new positions
        let newCol = this.cursorCol + dx;
        let newRow = this.cursorRow + dy;
    
        this.cursorCol = Phaser.Math.Clamp(newCol, 0, 7);
        this.cursorRow = Phaser.Math.Clamp(newRow, 0, 7);

        this.cursorSprite.x = (this.cursorCol + 0.5) * this.squareSize + this.offSetX;
        this.cursorSprite.y = (this.cursorRow + 0.5) * this.squareSize + this.offSetY;
    }
    
}