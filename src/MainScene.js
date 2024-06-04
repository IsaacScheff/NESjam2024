import { Chess } from 'chess.js' 
import { makeRandomMove } from './ai/randomMoveAI.js';

export default class MainScene extends Phaser.Scene {
    constructor() {
        super("MainScene");
        this.selectedPiece = null;
        this.playerTurn = true;
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
        this.events.on('wake', this.checkTurn, this);

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
        
        this.initGameState();

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

        this.input.keyboard.on('keydown-H', this.handleSelection, this);

        // Log the current ASCII board (for debugging purposes)
        console.log(this.chess.ascii());
    }
   
    placePieces() {
        // Clear existing piece sprites
        if (this.pieceSprites) {
            this.pieceSprites.forEach(sprite => sprite.destroy());
        }
        this.pieceSprites = [];
    
        let board = this.chess.board();
        for (let row = 0; row < board.length; row++) {
            for (let col = 0; col < board[row].length; col++) {
                let piece = board[row][col];
                if (piece) {
                    let pieceKey = `${piece.color}_${piece.type}`;
                    let x = (col + 0.5) * this.squareSize + this.offSetX;
                    let y = (row + 0.5) * this.squareSize + this.offSetY;
                    let sprite = this.add.image(x, y, pieceKey);
                    this.pieceSprites.push(sprite);  // Store reference to the sprite
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

    handleSelection() {
        const piece = this.getPieceAt(this.cursorCol, this.cursorRow);
        if (this.selectedPiece) {
            try {
                const move = this.chess.move({
                    from: this.squareToCoords(this.selectedPiece),
                    to: this.squareToCoords({col: this.cursorCol, row: this.cursorRow}),
                    promotion: 'q'  // Defaults to promotion to queen; TODO: add promotion choice
                });
        
                if (move) {
                    console.log('Move successful:', move);
                    this.placePieces();  // Update the board visuals
    
                    // Check if the move is a capture
                    if (move.flags.includes('c')) {
                        this.handleCapture();
                    } else {
                        this.endTurn();
                    }
                } else {
                    console.log('Invalid move attempted');
                    // Optionally play error sound
                }
            } catch (error) {
                console.log('Error during move:', error.message);
                // Optionally play error sound
            }
    
            // Deselect piece regardless of move success or failure
            this.selectedPiece = null;
        } else if (piece && piece.color === 'w') {
            // Select the piece if it is a white piece
            this.selectedPiece = { col: this.cursorCol, row: this.cursorRow };
            console.log('Piece selected:', piece);
        }
    }      
    
    getPieceAt(col, row) {
        return this.chess.get(this.squareToCoords({ col, row }));
    }
    
    squareToCoords({col, row}) {
        return String.fromCharCode(97 + col) + (8 - row);
    }

    endTurn() {
        if (this.playerTurn) {
            //hide/destroy cursor
            this.playerTurn = false;  
            this.opponentTurn(); 
        } else {
            //remake cursor
            this.playerTurn = true; 
        }
    }

    opponentTurn() {
        if (!this.playerTurn) {
            this.time.delayedCall(1500, () => {
                const move = makeRandomMove(this.chess); 
                if (move) {
                    console.log('AI moved:', move);
                    this.placePieces();
                    // Check if the AI's move was a capture
                    if (move.flags.includes('c')) {
                        this.handleCapture();  
                    } else {
                        this.endTurn();
                    }
                } else {
                    console.log('AI has no moves available');
                    // Handle game over or checkmate
                }
            }, [], this);
        }
    }

    handleCapture() {
        this.playerTurn = !this.playerTurn; //as we're not calling endTurn if we enter fight must switch here
        console.log("Capture detected, transitioning to FightScene");
        this.scene.switch('FightScene');
    }

    initGameState() {
        this.placePieces();
    
        if (!this.playerTurn) {
            this.opponentTurn();  
        }
    }

    checkTurn() {
        console.log("turn check happened");
        console.log(this.playerTurn);
        if (!this.playerTurn) {
            this.opponentTurn();  // If it's the AI's turn, continue with opponent's move
        }
    }
}