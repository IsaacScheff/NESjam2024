import BaseEnemyAI from "../ai/BaseEnemyAI";
import { setupGamepad } from "../GamepadHandler";

export default class FightScene extends Phaser.Scene {
    constructor() {
        super({ key: 'FightScene' });

        this.lastAttackTime = 0;  
        this.attackCooldown = 1000; // Cooldown time 1 second
        this.playerJumping = false;
    }

    preload() {
        this.load.bitmapFont('pixelFont', 'assets/font/pixel.png', 'assets/font/pixel.xml');
        this.load.image('stone', 'assets/images/StoneBlock1.png');
        this.load.image('w_p', 'assets/images/WhitePawn.png');
        this.load.image('w_n', 'assets/images/WhiteKnight.png');
        this.load.image('w_b', 'asses/images/WhiteBishop.png');
        this.load.image('w_r', 'assets/images/WhiteRook.png');
        this.load.image('w_q', 'assets/images/WhiteQueen.png');
        this.load.image('pyroPawn1', 'assets/images/FirePawn1.png');
        this.load.image('pyroPawn2', 'assets/images/FirePawn2.png'); 
        this.load.image('pyroPawn3', 'assets/images/FirePawn3.png');  

        this.load.image('sword', 'assets/images/PawnSwordBase.png');
        this.load.image('swordSmear', 'assets/images/PawnSwordSmear.png');
        this.load.image('swordThrust', 'assets/images/PawnSwordFinal.png');
        this.load.image('rookProjectile', 'assets/images/rookProjectile.png');
        this.load.image('pyroProjectile', 'assets/images/pyroProjectile.png');
        this.load.spritesheet('bishopLightBall', 'assets/images/BishopLightBall.png', { frameWidth: 6, frameHeight: 6 });
        this.load.spritesheet('bishopFireBall', 'assets/images/BishopFireBall.png', { frameWidth: 6, frameHeight: 6 });

        this.load.spritesheet('blackPawnBreak', 'assets/images/BlackPawnBreak.png', { frameWidth: 16, frameHeight: 16 });
        this.load.spritesheet('whitePawnBreak', 'assets/images/WhitePawnBreak.png', { frameWidth: 16, frameHeight: 16 });
        this.load.spritesheet('blackKnightBreak', 'assets/images/BlackKnightBreak.png', { frameWidth: 16, frameHeight: 16 });
        this.load.spritesheet('whiteKnightBreak', 'assets/images/WhiteKnightBreak.png', { frameWidth: 16, frameHeight: 16 });
        this.load.spritesheet('blackBishopBreak', 'assets/images/BlackBishopBreak.png', { frameWidth: 16, frameHeight: 16 });
        this.load.spritesheet('whiteBishopBreak', 'assets/images/WhiteBishopBreak.png', { frameWidth: 16, frameHeight: 16 });
        this.load.spritesheet('blackRookBreak', 'assets/images/BlackRookBreak.png', { frameWidth: 16, frameHeight: 16 });
        this.load.spritesheet('whiteRookBreak', 'assets/images/WhiteRookBreak.png', { frameWidth: 16, frameHeight: 16 });
        this.load.spritesheet('blackQueenBreak', 'assets/images/BlackQueenBreak.png', { frameWidth: 16, frameHeight: 16 });
        this.load.spritesheet('whiteQueenBreak', 'assets/images/WhiteQueenBreak.png', { frameWidth: 16, frameHeight: 16 });
        this.load.spritesheet('pyroKnight', 'assets/images/PyroKnight.png', { frameWidth: 19, frameHeight: 18 });
        this.load.spritesheet('pyroBishop', 'assets/images/PyroBishop.png', { frameWidth: 16, frameHeight: 18});
        this.load.spritesheet('pyroRook', 'assets/images/PyroRook.png', { frameWidth: 18, frameHeight: 20});
        this.load.spritesheet('pyroQueen', 'assets/images/PyroQueen.png', { frameWidth: 20, frameHeight: 18});

        this.load.spritesheet('whitePawnWalking', 'assets/images/WhitePawnWalking.png', { frameWidth: 16, frameWidth: 16 });
        this.load.spritesheet('whitePawnJump', 'assets/images/WhitePawnJump.png', { frameWidth: 16, frameWidth: 16 });

        this.load.image('heart', 'assets/images/Heart.png');
        this.load.image('violetHeart', 'assets/images/VioletHeart.png');
        this.load.spritesheet('torches', 'assets/images/Torches.png', {frameWidth: 16, frameHeight: 16});
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
            case 'r':
                playerSpriteKey = 'w_r'
                break;
            case 'q':
                playerSpriteKey = 'w_q'
                break;
        }

        let opponentSpriteKey = 'pyroPawn'; // Default to pawn
        let opponentBehaviour = 'normal'; // Default to normal pawn behavior

        switch(fightData.black) {
            case 'n':
                opponentSpriteKey = 'pyroKnight';
                opponentBehaviour = 'knight';
                break;
            case 'b':
                opponentSpriteKey = 'pyroBishop';
                break;
            case 'r':
                opponentSpriteKey = 'pyroRook';
                opponentBehaviour = 'rook';
                break;
            case 'q':
                opponentSpriteKey = 'pyroQueen';
                opponentBehaviour = 'rook'; //queen has both bishop and rook abilities
                break;
        }

        this.tiles = this.createTiles();
        this.player = this.physics.add.sprite(100, 100, playerSpriteKey);
        this.player.setCollideWorldBounds(true);

        //TODO: add torches to a Pyromancer Arena set up function
        if (!this.anims.exists('torches')) {
            this.anims.create({
                key: 'torches',
                frames: this.anims.generateFrameNumbers('torches', { start: 0, end: 1 }), 
                frameRate: 10,
                repeat: -1 
            });
        }
        this.add.sprite(20, 60, 'torches').play('torches');
        this.add.sprite(128, 60, 'torches').play('torches');
        this.add.sprite(236, 60, 'torches').play('torches');

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

        if(!this.anims.exists('bishopFireBall')) {
            this.anims.create({
                key: 'bishopFireBall',
                frames: this.anims.generateFrameNumbers('bishopFireBall', { start: 0, end: 2 }), 
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

        if (!this.anims.exists('pyroBishop')) {
            this.anims.create({
                key: 'pyroBishop',
                frames: this.anims.generateFrameNumbers('pyroBishop', { start: 0, end: 2 }), 
                frameRate: 10,
                repeat: -1 
            });
        }

        if (!this.anims.exists('pyroRook')) {
            this.anims.create({
                key: 'pyroRook',
                frames: this.anims.generateFrameNumbers('pyroRook', { start: 0, end: 2 }), 
                frameRate: 10,
                repeat: -1 
            });
        }

        if (!this.anims.exists('pyroQueen')) {
            this.anims.create({
                key: 'pyroQueen',
                frames: this.anims.generateFrameNumbers('pyroQueen', { start: 0, end: 2 }), 
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

        if (!this.anims.exists('blackRookBreaking')) {
            this.anims.create({
                key: 'blackRookBreaking',
                frames: this.anims.generateFrameNumbers('blackRookBreak', { start: 0, end: 8 }), 
                frameRate: 10,
                repeat: 0 
            });
        }
    
        if (!this.anims.exists('whiteRookBreaking')) {
            this.anims.create({
                key: 'whiteRookBreaking',
                frames: this.anims.generateFrameNumbers('whiteRookBreak', { start: 0, end: 8 }), 
                frameRate: 10,
                repeat: 0 
            });
        }

        if (!this.anims.exists('blackQueenBreaking')) {
            this.anims.create({
                key: 'blackQueenBreaking',
                frames: this.anims.generateFrameNumbers('blackQueenBreak', { start: 0, end: 8 }), 
                frameRate: 10,
                repeat: 0 
            });
        }
    
        if (!this.anims.exists('whiteQueenBreaking')) {
            this.anims.create({
                key: 'whiteQueenBreaking',
                frames: this.anims.generateFrameNumbers('whiteQueenBreak', { start: 0, end: 8 }), 
                frameRate: 10,
                repeat: 0 
            });
        }

        if (!this.anims.exists('whitePawnWalking')) {
            this.anims.create({
                key: 'whitePawnWalking',
                frames: this.anims.generateFrameNumbers('whitePawnWalking', { start: 0, end: 3 }), 
                frameRate: 10,
                repeat: -1 
            });
        }

        if (!this.anims.exists('whitePawnJump')) {
            this.anims.create({
                key: 'whitePawnJump',
                frames: this.anims.generateFrameNumbers('whitePawnJump', { start: 0, end: 3 }), 
                frameRate: 30,
                repeat: 0 
            });
        }

        this.opponentPiece = this.physics.add.sprite(200, 100, opponentSpriteKey); 
        this.opponentPiece.setCollideWorldBounds(true);
        this.opponentPiece.play(opponentSpriteKey);
        this.opponentPiece.body.setSize(this.opponentPiece.width, this.opponentPiece.height);
        this.opponentPiece.body.setOffset((this.opponentPiece.width - 16) / 2, (this.opponentPiece.height - 20) / 2);
        this.physics.add.collider(this.opponentPiece, this.tiles);

        if(fightData.white === 'p') {
            this.playerSword = this.createSword(this.player);
        } else if (fightData.white === 'b' || fightData.white === 'q') {
            this.bishopLightBall = this.createLightBall(this.player);
        }

        if (opponentSpriteKey === 'pyroBishop' || opponentSpriteKey === 'pyroQueen') {
            this.bishopFireBall = this.createFireBall(this.opponentPiece);
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

        if (this.bishopLightBall && (this.player.texture.key === 'w_b' || this.player.texture.key === 'w_q')) {
            const radius = 20;  // Radius of the orbit
            const speed = 0.003;  // Speed of the orbit
            this.bishopLightBall.x = this.player.x + Math.cos(this.time.now * speed) * radius;
            this.bishopLightBall.y = this.player.y + Math.sin(this.time.now * speed) * radius;
        }

        if (this.bishopFireBall && (this.opponentPiece.texture.key === 'pyroBishop' || this.opponentPiece.texture.key === 'pyroQueen')) {
            const radius = 20;  // Radius of the orbit
            const speed = 0.003;  // Speed of the orbit
            this.bishopFireBall.x = this.opponentPiece.x + Math.cos(this.time.now * speed) * radius;
            this.bishopFireBall.y = this.opponentPiece.y + Math.sin(this.time.now * speed) * radius;
        }

        this.opponentAI.update();

        this.updatePlayerAnimation();
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
        if (this.player.texture.key === 'w_p' && this.player.body.touching.down) {
            this.player.anims.play('whitePawnWalking', true);
        }
    }

    moveRight() {
        this.player.setVelocityX(130);
        this.player.flipX = false; 
        if(this.playerSword) {
            this.playerSword.flipX = false;
            this.updateSwordPosition();
        }
        if (this.player.texture.key === 'w_p' && this.player.body.touching.down) {
            this.player.anims.play('whitePawnWalking', true);
        }
    }

    jump() {
        this.playerJumping = true;
        const fightData = this.game.registry.get('fightData');
        if (this.player.body.touching.down) {
            if (fightData.white === 'p') {
                console.log('jumper');
                this.player.anims.play('whitePawnJump', true).once('animationcomplete', () => {
                    this.player.setVelocityY(-160);
                    this.playerJumping = false;

                });
            } else {
                this.player.setVelocityY(-160);
                this.playerJumping = false;
            }
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
            if (this.player.texture.key === 'w_r' || this.player.texture.key === 'w_q') { 
                let projectile = this.createRookProjectile(this.player);
                let velocityX = this.player.flipX ? -200 : 200; 
                let velocityY = -50; // Initial upward force to create an arc
                projectile.setVelocity(velocityX, velocityY);
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
            if(this.bishopLightBall) {
                this.bishopLightBall.body.setEnable(false) //intentionally only doing this for player and not opponent
                this.blink(this.bishopLightBall, () => { this.bishopLightBall.body.setEnable(true)});
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
                    case 'r':
                        breakingSpriteKey = 'whiteRookBreak';
                        break;
                    case 'q':
                        breakingSpriteKey = 'whiteRookBreak';
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
                if(this.bishopFireBall) {
                    this.bishopFireBall.setActive(false).setVisible(false);
                }
                const fightData = this.game.registry.get('fightData');
                let breakingSpriteKey = 'blackPawnBreaking'; // Default to pawn breaking animation
                switch(fightData.black) {
                    case 'n':
                        breakingSpriteKey = 'blackKnightBreaking';  
                        break;
                    case 'b':
                        breakingSpriteKey = 'blackBishopBreaking';
                        break;
                    case 'r':
                        breakingSpriteKey = 'blackRookBreaking';
                        break;
                    case 'q':
                        breakingSpriteKey = 'blackQueenBreaking';
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

    createFireBall(pyroPawn) {
        const fireBall = this.physics.add.sprite(pyroPawn.x, pyroPawn.y, 'bishopFireBall');
        fireBall.play('bishopFireBall');
        fireBall.setCircle(6);  
        fireBall.body.setAllowGravity(false);  

        this.physics.add.overlap(fireBall, this.player, this.damagePlayer, null, this);
    
        return fireBall;
    }

    createRookProjectile(rook) {
        let projectile = this.physics.add.sprite(rook.x, rook.y - 8, 'rookProjectile');
        projectile.body.onWorldBounds = true; 
        projectile.body.world.on('worldbounds', (body) => {
            if (body.gameObject === projectile) {
                projectile.destroy();
            }
        });
        this.physics.add.collider(projectile, this.opponentPiece, (proj) => {
            this.damageOpponent();
            proj.destroy();
        });
        this.physics.add.collider(projectile, this.tiles, (proj) => {
            proj.destroy();
        });
        return projectile;
    }

    createPyroRookProjectile(rook) {
        let projectile = this.physics.add.sprite(rook.x, rook.y - 8, 'pyroProjectile');
        projectile.body.onWorldBounds = true;
        projectile.body.world.on('worldbounds', (body) => {
            if (body.gameObject === projectile) {
                projectile.destroy();
            }
        });
        this.physics.add.collider(projectile, this.player, (proj) => {
            this.damagePlayer();
            proj.destroy();
        });
        this.physics.add.collider(projectile, this.tiles, (proj) => {
            proj.destroy();
        });
        return projectile;
    }

    updatePlayerAnimation() {
        const fightData = this.game.registry.get('fightData');
        if(this.playerJumping === true) {
            return;
        }
        if (this.player.body.velocity.x !== 0 && this.player.body.touching.down) {
            if (fightData.white === 'p') {
                this.player.anims.play('whitePawnWalking', true);
            }
        } else {
            if (fightData.white === 'p') {
                this.player.anims.stop();
                this.player.setTexture('w_p');
            }
        }
    }
}

const healthMap = {
    'p': 2,  // Pawn
    'n': 3,  // Knight
    'b': 3,  // Bishop
    'r': 3,  // Rook
    'q': 3,  // Queen
};