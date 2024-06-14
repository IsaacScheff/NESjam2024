import { Chess } from 'chess.js' 
import CRTEffect from '../CRTeffect.js';
import { makeAlphaBetaMove } from '../ai/alphaBetaAI.js';
import { makeMagnusMove } from '../ai/magnusMoveAI.js';
import { makeMinimaxMove } from '../ai/minimaxAI.js';
import { makeRandomMove } from '../ai/randomMoveAI.js';
import { makeSimpleMove } from '../ai/simpleCaptureAI.js';
import { setupGamepad } from '../GamepadHandler.js';

export default class ChessScene extends Phaser.Scene {
    constructor() {
        super("ChessScene");
        this.selectedPiece = null;
        this.playerTurn = true;
        this.allowMusic = true;
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
        this.load.image('cursorSelected', 'assets/images/CursorSelection.png');

        this.load.audio('placePiece', 'assets/sounds/placePiece.mp3');
        this.load.audio('illegalMove', 'assets/sounds/illegalMove.wav');
        this.load.audio('chessTheme', 'assets/sounds/ChessTheme.mp3');

        this.load.image('noiseTexture', 'assets/images/noiseTexture.png');
    }

    create() {
        setupGamepad(this);
        this.gamepadButtons = {};
        CRTEffect(this);

        let backgroundColor = '#000000';
        this.selectedOpponent = this.game.registry.get('selectedOpponent');
        switch(this.selectedOpponent) {
            case 'The Pyromancer':
                backgroundColor = '#BCBCBC';
                this.opponentMove = makeRandomMove;
                break;
            case 'Witch of the Forrest':
                backgroundColor = '#503000'
                this.opponentMove = makeSimpleMove;
                break;
            case 'Mr. Necromancer':
                backgroundColor = '#4428BC';
                this.opponentMove = makeMinimaxMove;
                break;
            case 'Royal Magician':
                backgroundColor = '#BCBCBC'
                this.opponentMove = makeAlphaBetaMove;
                break;
            case 'Magnus the Magus':
                backgroundColor = '#A4E4FC';
                this.opponentMove = makeMagnusMove;
                break;
        }
        this.cameras.main.setBackgroundColor(backgroundColor);

        this.themeMusicTimeStamps = [0, 6.4, 12.8, 19.2, 25.6, 32,  38.4, 44.8, 51.2, 57.6, 60.4]
        this.themeMusic = this.sound.add('chessTheme');

        this.musicConfig = {
            mute: false,
            volume: 1,
            rate: 1,
            detune: 0,
            loop: true,
            delay: 0
        };

        this.themeMusic.play(this.musicConfig);
        this.events.on('wake', () => {
            this.allowMusic = true;  // Reset flag when scene is awakened
            let lastTime = this.game.registry.get('lastMusicTime');
            let startTime = this.getNearestTimestamp(lastTime);
            if (!this.themeMusic.isPlaying) {
                this.themeMusic.play({
                    ...this.musicConfig,
                    seek: startTime
                });
            }
        });

        this.chess = new Chess();
        this.events.on('wake', this.checkTurn, this);

        // Graphics object to draw squares
        const boardGraphics = this.add.graphics({ fillStyle: { color: 0x000000 } });

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
                    boardGraphics.fillStyle(0xFCE0A8, 1); //Light Squares (tan off-white)
                } else {
                    boardGraphics.fillStyle(0x005800, 1); //Dark Squares (dark green)
                }

                // Draw the square
                boardGraphics.fillRect(x, y, this.squareSize, this.squareSize);
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
        this.input.keyboard.on('keydown-H', this.unselectPiece, this);

        const graphics = this.add.graphics({ fillStyle: { color: 0x000000 } });
        const screenHeight = this.sys.game.config.height;
        const screenWidth = this.sys.game.config.width;
        const barHeight = screenHeight / 11;
        graphics.fillRect(0, 0, screenWidth, barHeight);
        this.gameText = '';
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

                    if (piece.type === 'n') { //flip the knights
                        sprite.setFlipX(true);
                    }
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
            this.handleGamepadInput(2, 'B');
        }
        
        if(!this.themeMusic.isPlaying && this.allowMusic) {
            this.themeMusic.play(this.musicConfig);
        }

        if(!this.playerTurn) {
            this.cursorSprite.setVisible(false);
        } else {
            this.cursorSprite.setVisible(true);
        }

        this.add.bitmapText(112, 8, 'pixelFont', this.gameText, 8);
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
                    break;
                case 'B':
                    this.unselectPiece();
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
                    this.sound.play("placePiece");
                    this.placePieces();  // Update the board visuals
    
                    // Check if the move is a capture
                    if (move.flags.includes('c')) {
                        this.game.registry.set('fightData', {
                            white: `${move.piece}`,
                            black: `${move.captured}`
                        });
                        this.handleCapture();
                    } else {
                        this.endTurn();
                    }
                } else {
                    console.log('Invalid move attempted');
                    this.sound.play("illegalMove");
                }
            } catch (error) {
                console.log('Error during move:', error.message);
                this.sound.play("illegalMove");
            }
    
            // Deselect piece regardless of move success or failure
            this.toggleCursor(false);
            this.selectedPiece = null;
        } else if (piece && piece.color === 'w') {
            // Select the piece if it is a white piece
            this.selectedPiece = { col: this.cursorCol, row: this.cursorRow };
            this.toggleCursor(true);
        }
    }  
    
    toggleCursor(isSelected) {
        if (isSelected) {
            this.cursorSprite.setTexture('cursorSelected');
            this.cursorSprite.anims.pause();
        } else {
            this.cursorSprite.setTexture('cursorBase');
            this.cursorSprite.anims.resume();
        }
    }
    
    getPieceAt(col, row) {
        return this.chess.get(this.squareToCoords({ col, row }));
    }
    
    squareToCoords({col, row}) {
        return String.fromCharCode(97 + col) + (8 - row);
    }

    endTurn() {
        this.checkGameStatus(); 
        if (this.playerTurn) {
            this.playerTurn = false; 
            this.opponentTurn(); 
        } else {
            this.playerTurn = true;  
        }
    } 

    opponentTurn() {
        if (!this.playerTurn) {
            this.time.delayedCall(1500, () => {
                const move = this.opponentMove(this.chess); 
                if (move) {
                    this.sound.play("placePiece");
                    this.placePieces();
                    // Check if the AI's move was a capture
                    if (move.flags.includes('c')) {
                        this.game.registry.set('fightData', {
                            white: `${move.captured}`,
                            black: `${move.piece}` 
                        });
                        this.handleCapture();  
                    } else {
                        this.endTurn();
                    }
                } else {
                    console.log('AI has no moves available');
                    this.checkGameStatus();
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
            this.allowMusic = false;
            this.game.registry.set('lastMusicTime', this.themeMusic.seek);
            this.themeMusic.stop();
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
        //console.log("Winner from fight: ", winner);
        if (winner === 'defender') {
            this.handleDefenderWin(winner);
        } else { 
            this.checkGameStatus(); 
            if (!this.playerTurn) {
                this.opponentTurn();  // If it's the AI's turn, continue with opponent's move
            }
        }
    }

    handleDefenderWin() {
        this.game.registry.set('fightWinner', null);
        const lastMove = this.chess.history({ verbose: true }).pop();
        //console.log(lastMove);
    
        this.chess.undo();
        var currentFEN = this.chess.fen();
        var newBoardState = this.removePieceFromFEN(currentFEN, lastMove);
        var newFEN = this.updateFenFromBoardArray(newBoardState, this.chess.fen());
    
        try {
            this.chess.load(newFEN);
            if (this.chess.inCheck()) {
                //console.log("King is in check, player must move again.");
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

    unselectPiece() {
        if (this.selectedPiece) {
            this.toggleCursor(false);
            this.selectedPiece = null;
        }
    }
    getNearestTimestamp(currentTime) {
        let nearest = this.themeMusicTimeStamps.reduce((prev, curr) => {
            return (Math.abs(curr - currentTime) < Math.abs(prev - currentTime) ? curr : prev);
        });
        return nearest;
    }
    checkGameStatus() {
        let gameOver = false;
        if (this.chess.isCheckmate()) {
            const winner = this.chess.turn() === 'w' ? 'opponent' : 'player';
            this.game.registry.set('result', `${winner}`);
            this.gameText = 'Checkmate!';
            console.log(`${winner} wins by checkmate`);
            gameOver = true;
        } else if (this.chess.isStalemate()) {
            this.game.registry.set('result', 'draw');
            this.gameText = "Stalemate!"
            console.log("Stalemate");
            gameOver = true;
        } else if (this.chess.isDraw()) {
            this.game.registry.set('result', 'draw');
            this.gameText = "Draw!";
            gameOver = true;
            console.log("Draw");
        } else if (this.chess.isCheck()) {
            this.gameText = "Check!"
            console.log("Check");
        } else {
            this.gameText = '';
        }
        if(gameOver) {
            this.time.delayedCall(4000, () => {
                this.playerTurn = !this.playerTurn;
                this.allowMusic = false;
                this.game.registry.set('lastMusicTime', 0);
                this.themeMusic.stop();
                this.scene.start('GameResultScene'); 
            });
        }
    }
}
