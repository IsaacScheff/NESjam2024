import { Chess } from 'chess.js' 
import { makeRandomMove } from '../ai/randomMoveAI.js';
import { setupGamepad } from '../GamepadHandler.js';

export default class ChessScene extends Phaser.Scene {
    constructor() {
        super("ChessScene");
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
        setupGamepad(this);
        this.gamepadButtons = {};

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
                    graphics.fillStyle(0x005800, 1); //Dark Squares (dark blue)
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

        this.input.keyboard.on('keydown-J', this.handleSelection, this);

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

        if (this.gamepad) {
            this.handleGamepadInput(14, 'left');
            this.handleGamepadInput(15, 'right');
            this.handleGamepadInput(12, 'up');
            this.handleGamepadInput(13, 'down');

            this.handleGamepadInput(0, 'A');
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

    handleGamepadInput(buttonIndex, action) {
        const isDown = this.gamepad.buttons[buttonIndex].pressed;
        const wasDown = this.gamepadButtons[buttonIndex];
    
        if (isDown && !wasDown) {
            switch (action) {
                case 'left':
                    this.moveCursor(-1, 0);
                    break;
                case 'right':
                    this.moveCursor(1, 0);
                    break;
                case 'up':
                    this.moveCursor(0, -1);
                    break;
                case 'down':
                    this.moveCursor(0, 1);
                    break;
                case 'A':
                    this.handleSelection();
            }
        }
    
        // Update the stored state for the next frame
        this.gamepadButtons[buttonIndex] = isDown;
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
        const lastMove = this.chess.history({ verbose: true }).pop(); 
        if (lastMove && lastMove.piece === 'k') {
            // If the piece is a King, handle the capture automatically
            console.log('King captures automatically.');
            this.endTurn();  // Continue to the next turn without entering the fight scene
        } else {
            this.playerTurn = !this.playerTurn; // Toggle player turn as we are not calling endTurn if we enter the fight scene
            this.game.registry.set('attacker', (!this.playerTurn ? 'player' : 'opponent')); //these have to be backwards as we're toggling turn above
            this.scene.switch('TransitionScene');
        }
    }

    initGameState() {
        this.placePieces();
    
        if (!this.playerTurn) {
            this.opponentTurn();  
        }
    }

    checkTurn() {
        const winner = this.game.registry.get('fightWinner');
        console.log("Winner from fight: ", winner);
        if (winner === 'defender') {
            this.handleDefenderWin(winner);
        } else if (!this.playerTurn) {
            this.opponentTurn();  // If it's the AI's turn, continue with opponent's move
        }
    }

    handleDefenderWin() {
        this.game.registry.set('fightWinner', null);
        const lastMove = this.chess.history({ verbose: true }).pop();
        console.log(lastMove);
    
        this.chess.undo();
        var currentFEN = this.chess.fen();
        var newBoardState = this.removePieceFromFEN(currentFEN, lastMove);
        var newFEN = this.updateFenFromBoardArray(newBoardState, this.chess.fen());
    
        try {
            this.chess.load(newFEN);
            if (this.chess.inCheck()) {
                console.log("King is in check, player must move again.");
                this.playerTurn = !this.playerTurn;
                if(!this.playerTurn){
                    this.opponentTurn();
                    this.placePieces();
                    return;
                }
            } else {
                newFEN = this.toggleTurn(newFEN);
                this.chess.load(newFEN);
            }
            this.placePieces(); 
            if (!this.playerTurn) {
                this.opponentTurn();
            }
        } catch (error) {
            console.log("Failed to load FEN: ", error);
            // Handle the error, possibly by resetting to a safe state or notifying the player
        }
    }

    removePieceFromFEN(fen, lastMove) {
        var boardArray = this.fenTo2DArray(fen);
        var fromX = 8 - parseInt(lastMove.from[1]); 
        var fromY = lastMove.from.charCodeAt(0) - 'a'.charCodeAt(0); 
        var updatedBoard = this.removePiece(boardArray, fromX, fromY); 
        return updatedBoard;
    }

    extractBoard(fen) {
        return fen.split(' ')[0];  // Extracts only the board part of the FEN string
    }

    fenTo2DArray(fen) {
        const board = this.extractBoard(fen);
        const ranks = board.split('/');
        const boardArray = [];
    
        for (let rank of ranks) {
            const row = [];
            for (let char of rank) {
                if (isNaN(char)) {
                    // If it's not a number, it's a piece
                    row.push(char);
                } else {
                    // If it's a number, it represents that many empty squares
                    const empty = parseInt(char, 10);
                    for (let i = 0; i < empty; i++) {
                        row.push('1');  // Use '1' or another character to represent empty squares
                    }
                }
            }
            boardArray.push(row);
        }
        return boardArray;
    }

    arrayToFen(boardArray) {
        let fenRows = [];
        for (let row of boardArray) {
            let currentRow = '';
            let emptyCount = 0;
    
            for (let square of row) {
                if (square === '1') {  // Assuming '1' is used for empty squares
                    emptyCount++;
                } else {
                    if (emptyCount > 0) {
                        currentRow += emptyCount.toString();
                        emptyCount = 0;
                    }
                    currentRow += square;
                }
            }
            if (emptyCount > 0) {  // Append any remaining empty squares at the end of the row
                currentRow += emptyCount;
            }
            fenRows.push(currentRow);
        }
        return fenRows.join('/');
    }

    updateFenFromBoardArray(boardArray, currentFen) {
        console.log(currentFen);
        const parts = currentFen.split(' ');
        const boardPart = this.arrayToFen(boardArray);  // Convert array back to FEN board part
        parts[0] = boardPart;  // Replace the board part of the existing FEN
        return parts.join(' ');
    }
    
    removePiece(boardArray, x, y) {
        // x is the row index, y is the column index
        boardArray[x][y] = '1';  // Set to '1' or your designated empty square marker
        return boardArray;
    }

    toggleTurn(fen) {
        const parts = fen.split(' ');
        parts[1] = parts[1] === 'w' ? 'b' : 'w'; // Toggle between 'w' (white) and 'b' (black)
        return parts.join(' ');
    }
      
}