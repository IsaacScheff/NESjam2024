import BaseEnemyAI from "../ai/BaseEnemyAI";
import { setupGamepad } from "../GamepadHandler";

export default class FightScene extends Phaser.Scene {
    constructor() {
        super({ key: 'FightScene' });

        this.lastAttackTime = 0;  
        this.attackCooldown = 1000; // Cooldown time 1 second
    }

    preload() {
        this.load.bitmapFont('pixelFont', 'assets/font/pixel.png', 'assets/font/pixel.xml');
        this.load.image('stone', 'assets/images/StoneBlock1.png');
        this.load.image('w_p', 'assets/images/WhitePawn.png');
        this.load.image('w_n', 'assets/images/WhiteKnight.png');
        this.load.image('w_b', 'asses/images/WhiteBishop.png');
        this.load.image('pyroPawn1', 'assets/images/FirePawn1.png');
        this.load.image('pyroPawn2', 'assets/images/FirePawn2.png'); 
        this.load.image('pyroPawn3', 'assets/images/FirePawn3.png');  

        this.load.image('sword', 'assets/images/PawnSwordBase.png');
        this.load.image('swordSmear', 'assets/images/PawnSwordSmear.png');
        this.load.image('swordThrust', 'assets/images/PawnSwordFinal.png');
        this.load.spritesheet('bishopLightBall', 'assets/images/BishopLightBall.png', { frameWidth: 6, frameHeight: 6 });

        this.load.spritesheet('blackPawnBreak', 'assets/images/BlackPawnBreak.png', { frameWidth: 16, frameHeight: 16 });
        this.load.spritesheet('whitePawnBreak', 'assets/images/WhitePawnBreak.png', { frameWidth: 16, frameHeight: 16 });
        this.load.spritesheet('blackKnightBreak', 'assets/images/BlackKnightBreak.png', { frameWidth: 16, frameHeight: 16 });
        this.load.spritesheet('whiteKnightBreak', 'assets/images/WhiteKnightBreak.png', { frameWidth: 16, frameHeight: 16 });
        this.load.spritesheet('blackBishopBreak', 'assets/images/BlackBishopBreak.png', { frameWidth: 16, frameHeight: 16 });
        this.load.spritesheet('whiteBishopBreak', 'assets/images/WhiteBishopBreak.png', { frameWidth: 16, frameHeight: 16 });
        this.load.spritesheet('pyroKnight', 'assets/images/PyroKnight.png', { frameWidth: 19, frameHeight: 18 });

        this.load.image('heart', 'assets/images/Heart.png');
        this.load.image('violetHeart', 'assets/images/VioletHeart.png');
    }

    create(data) {
        setupGamepad(this);
        this.gamepadButtons = {};
        
        this.cameras.main.setBackgroundColor('#BCBCBC');
        const graphics = this.add.graphics({ fillStyle: { color: 0x000000 } });
        const screenHeight = this.sys.game.config.height;
        const screenWidth = this.sys.game.config.width;
        const barHeight = screenHeight / 10;
        graphics.fillRect(0, 0, screenWidth, barHeight);

        this.add.bitmapText(10, 5, 'pixelFont', 'PLAYER', 8);
        this.add.bitmapText(120, 5, 'pixelFont', 'OPPONENT', 8);

        const fightData = this.game.registry.get('fightData');
        this.playerHealth = healthMap[fightData.white] || 1;  // Default to 1 in case piece type is undefined
        this.opponentHealth = healthMap[fightData.black] || 1;

        this.attacker = this.game.registry.get('attacker');
        if(this.attacker == 'player'){
            this.playerHealth += 1;
        } else {
            this.opponentHealth += 1;
        }

        this.playerInvulnerable = false;
        this.opponentInvulnerable = false;

        this.playerHearts = this.add.group({
            key: 'heart',
            repeat: this.playerHealth - 1,
            setXY: {
                x: 68,
                y: 11,
                stepX: 10
            }
        });
        this.opponentHearts = this.add.group({
            key: 'violetHeart',
            repeat: this.opponentHealth - 1,
            setXY: {
                x: 194,
                y: 11,
                stepX: 10
            }
        });

        // Choose sprite based on the type of white piece
        let playerSpriteKey = 'w_p'; // default to pawn
        let isKnight = false;  // Flag to indicate if the player is a knight
        switch(fightData.white) {
            case 'n':
                playerSpriteKey = 'w_n';  
                isKnight = true;
                break;
            case 'b':
                playerSpriteKey = 'w_b'
                break;
        }

        let opponentSpriteKey = 'pyroPawn'; // Default to pawn
        let opponentBehaviour = 'normal'; // Default to normal pawn behavior

        if (fightData.black === 'n') { // Check if black piece is a knight
            opponentSpriteKey = 'pyroKnight';
            opponentBehaviour = 'knight'; 
        }

        this.tiles = this.createTiles();
        this.player = this.physics.add.sprite(100, 100, playerSpriteKey);
        this.player.setCollideWorldBounds(true);

        if (!this.anims.exists('playerSwordSwing')) {
            this.anims.create({
                key: 'playerSwordSwing',
                frames: [
                    { key: 'sword' },
                    { key: 'swordSmear' },
                    { key: 'swordThrust' },
                    { key: 'swordThrust' },
                    { key: 'swordThrust' },
                    { key: 'swordSmear' },
                    { key: 'sword' }
                ],
                frameRate: 20,
                repeat: 0
            });
        }

        if(!this.anims.exists('bishopLightBall')) {
            this.anims.create({
                key: 'bishopLightBall',
                frames: this.anims.generateFrameNumbers('bishopLightBall', { start: 0, end: 2 }), 
                frameRate: 10,
                repeat: -1 
            });
        }

        if (!this.anims.exists('pyroPawn')) {
            this.anims.create({
                key: 'pyroPawn',
                frames: [
                    { key: 'pyroPawn1' },
                    { key: 'pyroPawn2' },
                    { key: 'pyroPawn3' }
                ],
                frameRate: 10,
                repeat: -1
            });
        }

        if (!this.anims.exists('pyroKnight')) {
            this.anims.create({
                key: 'pyroKnight',
                frames: this.anims.generateFrameNumbers('pyroKnight', { start: 0, end: 2 }), 
                frameRate: 10,
                repeat: -1 
            });
        }

        if (!this.anims.exists('blackPawnBreaking')) {
            this.anims.create({
                key: 'blackPawnBreaking',
                frames: this.anims.generateFrameNumbers('blackPawnBreak', { start: 0, end: 8 }), 
                frameRate: 10,
                repeat: 0 
            });
        }
    
        if (!this.anims.exists('whitePawnBreaking')) {
            this.anims.create({
                key: 'whitePawnBreaking',
                frames: this.anims.generateFrameNumbers('whitePawnBreak', { start: 0, end: 8 }), 
                frameRate: 10,
                repeat: 0 
            });
        }

        if (!this.anims.exists('blackKnightBreaking')) {
            this.anims.create({
                key: 'blackKnightBreaking',
                frames: this.anims.generateFrameNumbers('blackKnightBreak', { start: 0, end: 8 }), 
                frameRate: 10,
                repeat: 0 
            });
        }
    
        if (!this.anims.exists('whiteKnightBreaking')) {
            this.anims.create({
                key: 'whiteKnightBreaking',
                frames: this.anims.generateFrameNumbers('whiteKnightBreak', { start: 0, end: 8 }), 
                frameRate: 10,
                repeat: 0 
            });
        }

        if (!this.anims.exists('blackBishopBreaking')) {
            this.anims.create({
                key: 'blackBishopBreaking',
                frames: this.anims.generateFrameNumbers('blackBishopBreak', { start: 0, end: 8 }), 
                frameRate: 10,
                repeat: 0 
            });
        }
    
        if (!this.anims.exists('whiteBishopBreaking')) {
            this.anims.create({
                key: 'whiteBishopBreaking',
                frames: this.anims.generateFrameNumbers('whiteBishopBreak', { start: 0, end: 8 }), 
                frameRate: 10,
                repeat: 0 
            });
        }

        this.opponentPiece = this.physics.add.sprite(200, 100, opponentSpriteKey); 
        this.opponentPiece.setCollideWorldBounds(true);
        if (opponentSpriteKey === 'pyroKnight') {
            this.anims.create({
                key: 'pyroKnight',
                frames: this.anims.generateFrameNumbers('pyroKnight', { start: 0, end: 2 }), 
                frameRate: 10,
                repeat: -1
            });
            this.opponentPiece.play('pyroKnight');
            this.opponentPiece.body.setSize(19, 18);
        } else {
            this.opponentPiece.play('pyroPawn');
            this.opponentPiece.body.setSize(16, 20);
        }
        this.opponentPiece.body.setSize(16, 20);
        this.opponentPiece.body.setOffset((this.opponentPiece.width - 16) / 2, (this.opponentPiece.height - 20) / 2);
        this.physics.add.collider(this.opponentPiece, this.tiles);

        if(fightData.white === 'p') {
            this.playerSword = this.createSword(this.player);
        } else if (fightData.white === 'b') {
            this.bishopLightBall = this.createLightBall(this.player);
        }

        // Initialize AI for the opponenent piece
        this.opponentAI = new BaseEnemyAI(this, this.opponentPiece, {
            minX: 16,
            maxX: this.sys.game.config.width - 16, 
            velocity: 100,
            jumpChance: 0.05, //ignored for knights 
            behaviorType: opponentBehaviour
        });

        this.physics.add.collider(this.player, this.tiles);

        if(this.playerSword) {
            this.physics.add.collider(this.playerSword, this.opponentAI.sprite, (sword, opponent) => {
                if (sword.anims.isPlaying && sword.anims.currentAnim.key === 'playerSwordSwing') {
                    this.damageOpponent();
                    opponent.setVelocityX(300 * (opponent.flipX ? 1 : -1)); // Knockback effect (opponent update function appears to counteract this right now)
                }
            });
        }

        this.physics.add.collider(this.player, this.opponentAI.sprite, (player, opponent) => {
            if (isKnight && this.isPlayerAboveOpponent(player, opponent)) {
                this.damageOpponent();  // Damage the opponent if the player is a knight and jumps on top
            } else {
                this.damagePlayer();  // Normal damage logic if not a jump attack or not a knight
            }
        });

        if(this.bishopLightBall) {
            this.physics.add.collider(this.bishopLightBall, this.opponentAI.sprite, () => {
                this.damageOpponent();
            });
        }

        this.setupControls();
    }

    update() {
        this.player.setVelocityX(0);

        if (this.arrowKeys.left.isDown || this.keys.left.isDown) {
            this.moveLeft();
        } else if (this.arrowKeys.right.isDown || this.keys.right.isDown) {
            this.moveRight();
        }

        if (Phaser.Input.Keyboard.JustDown(this.keys.jump) && this.player.body.touching.down) {
            this.jump();
        }

        if (Phaser.Input.Keyboard.JustDown(this.keys.swing)) {
            this.attack();
        }

        if (this.gamepad) {
            this.handleGamepadInput(14, 'left');
            this.handleGamepadInput(15, 'right');
            this.handleGamepadInput(12, 'up');
            this.handleGamepadInput(13, 'down');

            this.handleGamepadInput(0, 'A');
            this.handleGamepadInput(2, 'B');
        }

        if (this.playerSword) {
            this.updateSwordPosition();
        }

        if (this.bishopLightBall && this.player.texture.key === 'w_b') {
            const radius = 20;  // Radius of the orbit
            const speed = 0.003;  // Speed of the orbit
            this.bishopLightBall.x = this.player.x + Math.cos(this.time.now * speed) * radius;
            this.bishopLightBall.y = this.player.y + Math.sin(this.time.now * speed) * radius;
        }

        // Update the AI
        this.opponentAI.update();
    }

    setupControls() {
        this.arrowKeys = this.input.keyboard.createCursorKeys();
        this.keys = {
            up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
            left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
            jump: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.J),
            swing: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.H)
        };
    }

    handleGamepadInput(buttonIndex, action) {
        const isDown = this.gamepad.buttons[buttonIndex].pressed;
        if (isDown) {
            switch (action) {
                case 'left':
                    this.moveLeft();
                    break;
                case 'right':
                    this.moveRight();
                    break;
                case 'up':
                    //nothing for now
                    break;
                case 'down':
                    //nothing for now
                    break;
                case 'A':
                    this.jump();
                    break;
                case 'B':
                    this.attack();
            }
        }
    }

    createTiles() {
        const tiles = this.physics.add.staticGroup();
        const startY = this.sys.game.config.height - (4 * 16); // 4 rows from the bottom

        for (let y = startY; y < this.sys.game.config.height; y += 16) {
            for (let x = 0; x < this.sys.game.config.width; x += 16) {
                let tile = tiles.create(x, y, 'stone').setOrigin(0);
                tile.refreshBody();
            }
        }
        return tiles;
    }

    createSword(player) {
        // Offset the sword sprite to be in front of the player based on direction
        let xOffset = player.flipX ? -8 : 8; // Adjust offset based on facing direction
        let sword = this.physics.add.sprite(player.x + xOffset, player.y - 4, 'sword');
        sword.body.setAllowGravity(false);
        sword.body.enable = false; // Disable physics body by default
        return sword;
    }

    updateSwordPosition() {
        this.playerSword.x = this.player.x + (this.player.flipX ? -8 : 8);
        this.playerSword.y = this.player.y - 4;

        this.playerSword.flipX = this.player.flipX;
    }

    moveLeft() {
        this.player.setVelocityX(-130);
        this.player.flipX = true;
        if(this.playerSword) {
            this.playerSword.flipX = true;
            this.updateSwordPosition();
        }
    }

    moveRight() {
        this.player.setVelocityX(130);
        this.player.flipX = false; 
        if(this.playerSword) {
            this.playerSword.flipX = false;
            this.updateSwordPosition();
        }
    }

    jump() {
        if (this.player.body.touching.down) {
            this.player.setVelocityY(-160);
        }
    }

    attack() {
        const currentTime = this.time.now;
        if (currentTime > this.lastAttackTime + this.attackCooldown) {
            if(this.playerSword) {
                this.playerSword.body.enable = true;
                this.playerSword.play('playerSwordSwing').once('animationcomplete', () => {
                    this.playerSword.body.enable = false;
                });
            }
            this.lastAttackTime = currentTime;
        }
    }

    damagePlayer() {
        if (this.playerHealth > 0 && !this.playerInvulnerable) {
            this.playerHealth--;
            this.playerInvulnerable = true;
            this.blink(this.player, () => { this.playerInvulnerable = false; });
            if(this.playerSword) {
                this.blink(this.playerSword, () => {});
            }
    
            let heart = this.playerHearts.getChildren()[this.playerHealth];
            if (heart) {
                heart.setVisible(false);
            }
    
            if (this.playerHealth === 0) {
                this.player.setActive(false).setVisible(false); // Hide the player
                if(this.playerSword) {
                    this.playerSword.setActive(false).setVisible(false); 
                }
                if(this.bishopLightBall) {
                    this.bishopLightBall.setActive(false).setVisible(false);
                }

                // Determine the appropriate breaking sprite based on the fight data
                let breakingSpriteKey = 'whitePawnBreak';  // default to pawn breaking sprite
                const fightData = this.game.registry.get('fightData');
                switch(fightData.white) {
                    case 'n':
                        breakingSpriteKey = 'whiteKnightBreak';  
                        break;
                    case 'b':
                        breakingSpriteKey = 'whiteBishopBreak';
                        break;
                }

                // Create the breaking animation sprite at the player's last position
                let breakingSprite = this.add.sprite(this.player.x, this.player.y, breakingSpriteKey);
                breakingSprite.play(breakingSpriteKey + 'ing'); // Append 'ing' to match the animation key format
                breakingSprite.flipX = this.player.flipX;
    
                this.game.registry.set('fightWinner', (this.attacker === 'player' ? 'defender' : 'attacker'));

                breakingSprite.on('animationcomplete', () => {
                    breakingSprite.destroy(); 
                });
    
                this.time.delayedCall(2000, () => {
                    if(this.playerSword) {
                        this.playerSword = null;
                    }
                    if(this.bishopLightBall) {
                        this.bishopLightBall = null;
                    }

                    this.scene.switch('ChessScene');
                });
            }
        }
    }

    damageOpponent() {
        if (this.opponentHealth > 0 && !this.opponentInvulnerable) {
            this.opponentHealth--;
            this.opponentInvulnerable = true;
            this.blink(this.opponentAI.sprite, () => { this.opponentInvulnerable = false; });
    
            let heart = this.opponentHearts.getChildren()[this.opponentHealth];
            if (heart) {
                heart.setVisible(false);
            }
    
            if (this.opponentHealth === 0) {
                const fightData = this.game.registry.get('fightData');
                let breakingSpriteKey = 'blackPawnBreaking'; // Default to pawn breaking animation
                switch(fightData.black) {
                    case 'n':
                        breakingSpriteKey = 'blackKnightBreaking';  
                        break;
                    case 'b':
                        breakingSpriteKey = 'blackBishopBreaking';
                        break;
                }

                this.opponentAI.sprite.setActive(false).setVisible(false); 
                this.opponentAI.sprite.body.setEnable(false);
    
                this.playerInvulnerable = true; //otherwise player takes damage from invisible enemy
                let breakingSprite = this.add.sprite(this.opponentAI.sprite.x, this.opponentAI.sprite.y, breakingSpriteKey);
                breakingSprite.play(breakingSpriteKey);
                breakingSprite.on('animationcomplete', () => {
                    breakingSprite.destroy();
                });
            
                this.game.registry.set('fightWinner', (this.attacker === 'opponent' ? 'defender' : 'attacker'));

                breakingSprite.on('animationcomplete', () => {
                    breakingSprite.destroy();
                });
    
                this.time.delayedCall(2000, () => {
                    if(this.playerSword) {
                        this.playerSword = null;
                    }
                    if(this.bishopLightBall) {
                        this.bishopLightBall = null;
                    }

                    this.scene.switch('ChessScene');
                });

            }
        }
    }

    blink(sprite, callback) {
        const blinkTween = this.tweens.add({
            targets: sprite,
            alpha: 0.0,
            ease: 'Cubic.easeInOut',
            duration: 100,
            yoyo: true,
            repeat: 5,
            onComplete: () => {
                sprite.alpha = 1; // Reset the alpha to 1 after blinking
                callback();
            }
        });
    }

    isPlayerAboveOpponent(player, opponent) {
        return player.body.bottom <= opponent.body.top + 10;  // Check if player is sufficiently above the opponent
    }

    createLightBall(bishop) {
        const lightBall = this.physics.add.sprite(bishop.x, bishop.y, 'bishopLightBall');
        lightBall.play('bishopLightBall');  
        lightBall.setCircle(6);  //adjust size here
        lightBall.body.setAllowGravity(false);
    
        return lightBall;
    }
}

const healthMap = {
    'p': 2,  // Pawn
    'n': 3,  // Knight
    'b': 3,  // Bishop
    'r': 3,  // Rook
    'q': 3,  // Queen
};