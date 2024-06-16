import BaseEnemyAI from "../ai/BaseEnemyAI";
import createPalettes from "../CreatePalettes.js";
import CRTEffect from '../CRTeffect.js';
import { setupGamepad } from "../GamepadHandler";

export default class FightScene extends Phaser.Scene {
    constructor() {
        super({ key: 'FightScene' });

        this.lastAttackTime = 0;  
        this.attackCooldown = 1000; // Cooldown time 1 second
        this.playerJumping = false;
    }

    preload() {
        this.selectedOpponent = this.game.registry.get('selectedOpponent');
        const fightData = this.game.registry.get('fightData');

        switch(fightData.white) {
            case 'p':
                this.load.image('w_p', 'assets/images/WhitePawn.png');
                this.load.image('sword', 'assets/images/PawnSwordBase.png');
                this.load.image('swordSmear', 'assets/images/PawnSwordSmear.png');
                this.load.image('swordThrust', 'assets/images/PawnSwordFinal.png');
                this.load.spritesheet('whitePawnBreak', 'assets/images/WhitePawnBreak.png', { frameWidth: 16, frameHeight: 16 });
                this.load.spritesheet('whitePawnWalking', 'assets/images/WhitePawnWalking.png', { frameWidth: 16, frameWidth: 16 });
                this.load.spritesheet('whitePawnJump', 'assets/images/WhitePawnJump.png', { frameWidth: 16, frameWidth: 16 });
                break;
            case 'n':
                this.load.image('w_n', 'assets/images/WhiteKnight.png');
                this.load.spritesheet('whiteKnightBreak', 'assets/images/WhiteKnightBreak.png', { frameWidth: 16, frameHeight: 16 });
                break;
            case 'b':
                this.load.image('w_b', 'assets/images/WhiteBishop.png');
                this.load.spritesheet('whiteBishopBreak', 'assets/images/WhiteBishopBreak.png', { frameWidth: 16, frameHeight: 16 });
                this.load.spritesheet('bishopLightBall', 'assets/images/BishopLightBall.png', { frameWidth: 6, frameHeight: 6 });
                break;
            case 'r':
                this.load.image('w_r', 'assets/images/WhiteRook.png');
                this.load.spritesheet('whiteRookBreak', 'assets/images/WhiteRookBreak.png', { frameWidth: 16, frameHeight: 16 });
                this.load.image('rookProjectile', 'assets/images/rookProjectile.png');
                break;
            case 'q':
                this.load.image('w_q', 'assets/images/WhiteQueen.png'); 
                this.load.image('rookProjectile', 'assets/images/rookProjectile.png');
                this.load.spritesheet('whiteQueenBreak', 'assets/images/WhiteQueenBreak.png', { frameWidth: 16, frameHeight: 16 });
                this.load.spritesheet('bishopLightBall', 'assets/images/BishopLightBall.png', { frameWidth: 6, frameHeight: 6 });
                break;
        }
        
        switch(fightData.black) {
            case 'p':
                this.load.spritesheet('pyroPawn', 'assets/images/PyroPawn.png',  { frameWidth: 16, frameHeight: 20 });
                this.load.audio('pawnMusic', 'assets/sounds/pawnbattle.mp3');
                this.load.spritesheet('blackPawnBreak', 'assets/images/BlackPawnBreak.png', { frameWidth: 16, frameHeight: 16 });
                break;
            case 'n':
                this.load.spritesheet('pyroKnight', 'assets/images/PyroKnight.png', { frameWidth: 19, frameHeight: 18 });
                this.load.spritesheet('blackKnightBreak', 'assets/images/BlackKnightBreak.png', { frameWidth: 16, frameHeight: 16 });
                this.load.audio('knightMusic', 'assets/sounds/knightbattle.mp3');
                break;
            case 'b':
                this.load.spritesheet('pyroBishop', 'assets/images/PyroBishop.png', { frameWidth: 16, frameHeight: 18});
                this.load.spritesheet('blackBishopBreak', 'assets/images/BlackBishopBreak.png', { frameWidth: 16, frameHeight: 16 });
                this.load.spritesheet('pyroBishopBall', 'assets/images/BishopFireBall.png', { frameWidth: 6, frameHeight: 6 });
                this.load.audio('bishopMusic', 'assets/sounds/bishopbattle.mp3');
                break;
            case 'r':
                this.load.spritesheet('pyroRook', 'assets/images/PyroRook.png', { frameWidth: 18, frameHeight: 20});
                this.load.spritesheet('blackRookBreak', 'assets/images/BlackRookBreak.png', { frameWidth: 16, frameHeight: 16 });
                this.load.audio('rookMusic', 'assets/sounds/rookbattle.mp3');
                this.load.image('pyroProjectile', 'assets/images/pyroProjectile.png');
                break;
            case 'q':
                this.load.spritesheet('pyroQueen', 'assets/images/PyroQueen.png', { frameWidth: 20, frameHeight: 18});
                this.load.audio('queenMusic', 'assets/sounds/queenbattle.mp3');
                this.load.spritesheet('blackQueenBreak', 'assets/images/BlackQueenBreak.png', { frameWidth: 16, frameHeight: 16 });
                this.load.spritesheet('pyroBishopBall', 'assets/images/BishopFireBall.png', { frameWidth: 6, frameHeight: 6 });
                this.load.image('pyroProjectile', 'assets/images/pyroProjectile.png');
                break;
        } 

        this.load.bitmapFont('pixelFont', 'assets/font/pixel.png', 'assets/font/pixel.xml');
        this.load.image('noiseTexture', 'assets/images/noiseTexture.png');

        this.load.image('heart', 'assets/images/Heart.png');
        this.load.image('violetHeart', 'assets/images/VioletHeart.png');

        this.load.image('oppPalette', 'assets/images/OpponentPalette.png');

        switch(this.selectedOpponent) {
            case 'The Pyromancer':
                this.load.image('stone', 'assets/images/StoneBlock1.png');
                this.load.spritesheet('torches', 'assets/images/Torches.png', {frameWidth: 16, frameHeight: 16});
                break;
            case 'Witch of the Forrest':
                this.load.image('wood', 'assets/images/CabinTiles.png');
                this.load.image('backgroundWood', 'assets/images/VerticalCabinTiles.png');
                this.load.image('witchesWindow', 'assets/images/WitchesWindow.png');
                break;
            case 'Mr. Necromancer':
                this.load.spritesheet('zombiePawn', 'assets/images/ZombiePawn.png', { frameWidth: 16, frameHeight: 16 });
                this.load.spritesheet('zombiePawnBreak', 'assets/images/ZombiePawnBreak.png', { frameWidth: 16, frameHeight: 16 });
                this.load.image('dirt', 'assets/images/Dirt.png');
                this.load.image('star', 'assets/images/Star.png');
                break;
            case 'Royal Magician':
                this.load.image('carpet', 'assets/images/CastleCarpet.png');
                this.load.image('castleWindow', 'assets/images/CastleWindow.png');
                this.load.image('sword', 'assets/images/PawnSwordBase.png');
                break;
            case 'Magnus the Magus':
                this.load.image('stone', 'assets/images/StoneBlock1.png');
                this.load.spritesheet('torches', 'assets/images/Torches.png', {frameWidth: 16, frameHeight: 16});
                break;
        }
    }

    create() {
        setupGamepad(this);
        this.gamepadButtons = {};
        CRTEffect(this);

        this.musicConfig = {
            mute: false,
            volume: 1,
            rate: 1,
            detune: 0,
            loop: true,
            delay: 0
        };

        const graphics = this.add.graphics({ fillStyle: { color: 0x000000 } });
        const screenHeight = this.sys.game.config.height;
        const screenWidth = this.sys.game.config.width;
        const barHeight = screenHeight / 10;
        graphics.fillRect(0, 0, screenWidth, barHeight);

        let backgroundColor = '#000000';
        this.opponentSuffix = '';
        switch(this.selectedOpponent) {
            case 'The Pyromancer':
                backgroundColor = '#BCBCBC';
                this.pyroCaveSetUp();
                this.pieceVelocity = 80;
                this.opponentSuffix = 'pyro';
                break;
            case 'Witch of the Forrest':
                backgroundColor = '#503000'
                this.witchCabinSetUp();
                this.pieceVelocity = 100;
                this.opponentSuffix = 'witch';
                break;
            case 'Mr. Necromancer':
                backgroundColor = '#4428BC';
                this.necroSetUp();
                this.pieceVelocity = 85;
                this.opponentSuffix = 'necro';
                break;
            case 'Royal Magician':
                backgroundColor = '#BCBCBC'
                //this.pyroCaveSetUp();
                this.royalSetUp();
                this.pieceVelocity = 130;
                this.opponentSuffix = 'royal';
                break;
            case 'Magnus the Magus':
                backgroundColor = '#A4E4FC';
                this.pyroCaveSetUp();
                this.pieceVelocity = 140;
                this.opponentSuffix = 'magnus';
                break;
        }
        this.cameras.main.setBackgroundColor(backgroundColor);

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
            case 'p':
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
                if (!this.anims.exists('whitePawnJump')) {
                    this.anims.create({
                        key: 'whitePawnJump',
                        frames: this.anims.generateFrameNumbers('whitePawnJump', { start: 0, end: 3 }), 
                        frameRate: 30,
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
                if (!this.anims.exists('whitePawnBreaking')) {
                    this.anims.create({
                        key: 'whitePawnBreaking',
                        frames: this.anims.generateFrameNumbers('whitePawnBreak', { start: 0, end: 8 }), 
                        frameRate: 10,
                        repeat: 0 
                    });
                }
                break;
            case 'n':
                playerSpriteKey = 'w_n'; 
                if (!this.anims.exists('whiteKnightBreaking')) {
                    this.anims.create({
                        key: 'whiteKnightBreaking',
                        frames: this.anims.generateFrameNumbers('whiteKnightBreak', { start: 0, end: 8 }), 
                        frameRate: 10,
                        repeat: 0 
                    });
                } 
                isKnight = true;
                break;
            case 'b':
                playerSpriteKey = 'w_b'
                if (!this.anims.exists('whiteBishopBreaking')) {
                    this.anims.create({
                        key: 'whiteBishopBreaking',
                        frames: this.anims.generateFrameNumbers('whiteBishopBreak', { start: 0, end: 8 }), 
                        frameRate: 10,
                        repeat: 0 
                    });
                }
                break;
            case 'r':
                playerSpriteKey = 'w_r'
                if (!this.anims.exists('whiteRookBreaking')) {
                    this.anims.create({
                        key: 'whiteRookBreaking',
                        frames: this.anims.generateFrameNumbers('whiteRookBreak', { start: 0, end: 8 }), 
                        frameRate: 10,
                        repeat: 0 
                    });
                }
                break;
            case 'q':
                playerSpriteKey = 'w_q'
                if (!this.anims.exists('whiteQueenBreaking')) {
                    this.anims.create({
                        key: 'whiteQueenBreaking',
                        frames: this.anims.generateFrameNumbers('whiteQueenBreak', { start: 0, end: 8 }), 
                        frameRate: 10,
                        repeat: 0 
                    });
                }
                break;
        } 

        this.opponentSpriteKey = 'pyroPawn-' + this.opponentSuffix; // Default to pawn
        let opponentBehaviour = 'normal'; // Default to normal pawn behavior

        switch(fightData.black) {
            case 'p':
                let pawnConfig = {
                    paletteKey: 'oppPalette',
                    paletteNames: ['pyro', 'witch', 'necro', 'royal', 'magnus'],
                    spriteSheet: {
                        key: 'pyroPawn',
                        frameWidth: 16,
                        frameHeight: 20
                    },
                    animations: [
                        { key: 'sizzle', frameRate: 10, startFrame: 0, endFrame: 2 }
                    ]
                };
                createPalettes(pawnConfig, this.game);
                this.opponentSpriteKey = 'pyroPawn-' + this.opponentSuffix;
                this.musicKey = 'pawnMusic';
                if (!this.anims.exists('blackPawnBreaking')) {
                    this.anims.create({
                        key: 'blackPawnBreaking',
                        frames: this.anims.generateFrameNumbers('blackPawnBreak', { start: 0, end: 8 }), 
                        frameRate: 10,
                        repeat: 0 
                    });
                }
                break;
            case 'n':
                let knightConfig = {
                    paletteKey: 'oppPalette',
                    paletteNames: ['pyro', 'witch', 'necro', 'royal', 'magnus'],
                    spriteSheet: {
                        key: 'pyroKnight',
                        frameWidth: 19,
                        frameHeight: 18
                    },
                    animations: [
                        { key: 'sizzle', frameRate: 10, startFrame: 0, endFrame: 2 }
                    ]
                };
                createPalettes(knightConfig, this.game);
                this.opponentSpriteKey = 'pyroKnight-' + this.opponentSuffix;
                opponentBehaviour = 'knight';
                this.musicKey = 'knightMusic';
                if (!this.anims.exists('blackKnightBreaking')) {
                    this.anims.create({
                        key: 'blackKnightBreaking',
                        frames: this.anims.generateFrameNumbers('blackKnightBreak', { start: 0, end: 8 }), 
                        frameRate: 10,
                        repeat: 0 
                    });
                }
                break;
            case 'b':
                let bishopConfig = {
                    paletteKey: 'oppPalette',
                    paletteNames: ['pyro', 'witch', 'necro', 'royal', 'magnus'],
                    spriteSheet: {
                        key: 'pyroBishop',
                        frameWidth: 16,
                        frameHeight: 18
                    },
                    animations: [
                        { key: 'sizzle', frameRate: 10, startFrame: 0, endFrame: 2 }
                    ]
                };
                createPalettes(bishopConfig, this.game);
                this.opponentSpriteKey = 'pyroBishop-' + this.opponentSuffix;
                this.musicKey = 'bishopMusic';
                if (!this.anims.exists('blackBishopBreaking')) {
                    this.anims.create({
                        key: 'blackBishopBreaking',
                        frames: this.anims.generateFrameNumbers('blackBishopBreak', { start: 0, end: 8 }), 
                        frameRate: 10,
                        repeat: 0 
                    });
                }
                break;
            case 'r':
                let rookConfig = {
                    paletteKey: 'oppPalette',
                    paletteNames: ['pyro', 'witch', 'necro', 'royal', 'magnus'],
                    spriteSheet: {
                        key: 'pyroRook',
                        frameWidth: 18,
                        frameHeight: 20
                    },
                    animations: [
                        { key: 'sizzle', frameRate: 10, startFrame: 0, endFrame: 2 }
                    ]
                };
                createPalettes(rookConfig, this.game);
                this.opponentSpriteKey = 'pyroRook-' + this.opponentSuffix;
                opponentBehaviour = 'rook';
                this.musicKey = 'rookMusic';
                if (!this.anims.exists('blackRookBreaking')) {
                    this.anims.create({
                        key: 'blackRookBreaking',
                        frames: this.anims.generateFrameNumbers('blackRookBreak', { start: 0, end: 8 }), 
                        frameRate: 10,
                        repeat: 0 
                    });
                }
                break;
            case 'q':
                let queenConfig = {
                    paletteKey: 'oppPalette',
                    paletteNames: ['pyro', 'witch', 'necro', 'royal', 'magnus'],
                    spriteSheet: {
                        key: 'pyroQueen',
                        frameWidth: 20,
                        frameHeight: 18
                    },
                    animations: [
                        { key: 'sizzle', frameRate: 10, startFrame: 0, endFrame: 2 }
                    ]
                };
                createPalettes(queenConfig, this.game);
                this.opponentSpriteKey = 'pyroQueen-' + this.opponentSuffix;
                opponentBehaviour = 'rook'; //queen has both bishop and rook abilities
                this.musicKey = 'queenMusic';
                if (!this.anims.exists('blackQueenBreaking')) {
                    this.anims.create({
                        key: 'blackQueenBreaking',
                        frames: this.anims.generateFrameNumbers('blackQueenBreak', { start: 0, end: 8 }), 
                        frameRate: 10,
                        repeat: 0 
                    });
                }
                break;
        }
        this.battleMusic = this.sound.add(this.musicKey);
        this.battleMusic.play(this.musicConfig);


        this.player = this.physics.add.sprite(56, 100, playerSpriteKey);
        this.player.setCollideWorldBounds(true);

        if((fightData.white === 'b' || fightData.white === 'q') && !this.anims.exists('bishopLightBall')) {
            this.anims.create({
                key: 'bishopLightBall',
                frames: this.anims.generateFrameNumbers('bishopLightBall', { start: 0, end: 2 }), 
                frameRate: 10,
                repeat: -1 
            });
        }

        if((fightData.black === 'b' || fightData.black === 'q')) {
            let pyroBishopBallConfig = {
                paletteKey: 'oppPalette',
                paletteNames: ['pyro', 'witch', 'necro', 'royal', 'magnus'],
                spriteSheet: {
                    key: 'pyroBishopBall',
                    frameWidth: 6,
                    frameHeight: 6
                },
                animations: [
                    { key: 'sizzle', frameRate: 10, startFrame: 0, endFrame: 2 }
                ]
            };
            createPalettes(pyroBishopBallConfig, this.game);
        }
        if((fightData.black === 'r' || fightData.black === 'q')) {
            let pyroProjectileConfig = {
                paletteKey: 'oppPalette',
                paletteNames: ['pyro', 'witch', 'necro', 'royal', 'magnus'],
                spriteSheet: {
                    key: 'pyroProjectile',
                    frameWidth: 5,
                    frameHeight: 5
                },
                animations: []
            };
            createPalettes(pyroProjectileConfig, this.game);
        }

        this.opponentPiece = this.physics.add.sprite(200, 100, this.opponentSpriteKey); 
        this.opponentPiece.setCollideWorldBounds(true);
        this.opponentPiece.play(this.opponentSpriteKey + '-sizzle');
        this.opponentPiece.body.setSize(this.opponentPiece.width, this.opponentPiece.height);
        this.opponentPiece.body.setOffset((this.opponentPiece.width - 16) / 2, (this.opponentPiece.height - 20) / 2);
        this.physics.add.collider(this.opponentPiece, this.tiles);

        if(fightData.white === 'p') {
            this.playerSword = this.createSword(this.player);
        } else if (fightData.white === 'b' || fightData.white === 'q') {
            this.bishopLightBall = this.createLightBall(this.player);
        }

        if (this.opponentSpriteKey === 'pyroBishop-' + this.opponentSuffix || this.opponentSpriteKey === 'pyroQueen-' + this.opponentSuffix) {
            this.bishopFireBall = this.createFireBall(this.opponentPiece);
        }

        // Initialize AI for the opponenent piece
        this.opponentAI = new BaseEnemyAI(this, this.opponentPiece, {
            minX: 16,
            maxX: this.sys.game.config.width - 16, 
            velocity: this.pieceVelocity,
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

        if (this.bishopFireBall && (this.opponentSpriteKey === 'pyroBishop-' + this.opponentSuffix || this.opponentSpriteKey === 'pyroQueen-' + this.opponentSuffix)) {
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

    createGroundTiles(tileSprite) {
        const tiles = this.physics.add.staticGroup();
        const startY = this.sys.game.config.height - (4 * 16); // 4 rows from the bottom

        for (let y = startY; y < this.sys.game.config.height; y += 16) {
            for (let x = 0; x < this.sys.game.config.width; x += 16) {
                let tile = tiles.create(x, y, tileSprite).setOrigin(0);
                tile.refreshBody();
            }
        }
        return tiles;
    }

    createBackgroundTiles(tileSprite) {
        const tiles = this.physics.add.staticGroup();
        const groundHeight = 4 * 16; // Height of the ground tiles from the bottom
        const tileHeight = 16; 
    
        for (let y = 32; y < this.sys.game.config.height - groundHeight; y += tileHeight) {
            for (let x = 0; x < this.sys.game.config.width; x += tileHeight) {
                let tile = tiles.create(x, y, tileSprite).setOrigin(0);
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
                this.player.anims.play('whitePawnJump', true).once('animationcomplete', () => {
                    this.player.setVelocityY(-180);
                    this.playerJumping = false;

                });
            } else {
                this.player.setVelocityY(-180);
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
        if (this.opponentHealth <= 0) return;
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
                this.opponentInvulnerable = true;
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
                        breakingSpriteKey = 'whiteQueenBreak';
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
                    this.battleMusic.stop();
                    this.scene.switch('ChessScene');
                });
            }
        }
    }

    damageOpponent() {
        if (this.playerHealth <= 0) return;
        if (this.opponentHealth > 0 && !this.opponentInvulnerable) {
            this.opponentHealth--;
            this.opponentInvulnerable = true;
            this.blink(this.opponentAI.sprite, () => { this.opponentInvulnerable = false; });
    
            let heart = this.opponentHearts.getChildren()[this.opponentHealth];
            if (heart) {
                heart.setVisible(false);
            }
    
            if (this.opponentHealth === 0) {
                this.playerInvulnerable = true;
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
                    this.battleMusic.stop();
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

    createFireBall(oppPiece) { 
        const fireBall = this.physics.add.sprite(oppPiece.x, oppPiece.y, 'pyroBishopBall-' + this.opponentSuffix);
        fireBall.play('pyroBishopBall-' + this.opponentSuffix + '-sizzle');
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
        let projectile = this.physics.add.sprite(rook.x, rook.y - 8, 'pyroProjectile-' + this.opponentSuffix);
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

    pyroCaveSetUp() {
        this.tiles = this.createGroundTiles('stone');

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
    }

    witchCabinSetUp() {
        this.tiles = this.createGroundTiles('wood');
        this.createBackgroundTiles('backgroundWood');
        this.add.sprite(48, 58, 'witchesWindow');
        this.add.sprite(208, 58, 'witchesWindow');
    }

    necroSetUp() {
        this.tiles = this.createGroundTiles('dirt');
        this.stars = this.createStarSky('star');
        this.spawnZombieInterval = 3000; //(3 seconds)
        if (!this.anims.exists('zombieWalk')) {
            this.anims.create({
                key: 'zombieWalk',
                frames: this.anims.generateFrameNumbers('zombiePawn', { start: 0, end: 3 }), 
                frameRate: 10,
                repeat: -1 
            });
        }
        if (!this.anims.exists('zombieBreak')) {
            this.anims.create({
                key: 'zombieBreak',
                frames: this.anims.generateFrameNumbers('zombiePawnBreak', { start: 0, end: 5 }), 
                frameRate: 10,
                repeat: 0 
            });
        }
        this.zombies = this.physics.add.group({
            classType: Phaser.Physics.Arcade.Sprite
        });
        this.time.addEvent({
            delay: this.spawnZombieInterval,
            callback: this.spawnZombiePawn,
            callbackScope: this,
            loop: true
        });
    }

    royalSetUp() {
        this.tiles = this.createGroundTiles('carpet');
        this.add.sprite(48, 58, 'castleWindow');
        this.add.sprite(208, 58, 'castleWindow'); 
    
        this.knives = this.physics.add.group({
            classType: Phaser.Physics.Arcade.Sprite
        });
    
        // Timer to spawn knives at random positions
        this.time.addEvent({
            delay: 1500,  //1.5 seconds
            callback: this.spawnKnife,
            callbackScope: this,
            loop: true
        });
    }
    
    spawnKnife() {
        const xPosition = Phaser.Math.Between(0, this.sys.game.config.width);  // Random x position within game width
        const knife = this.knives.create(xPosition, 0, 'sword');  // Spawn at top of the game world
        knife.setVelocityY(100);  // Set velocity so knife falls down
        knife.setAngle(180);  // Flip the knife vertically

        this.physics.add.collider(knife, this.tiles, this.knifeHitsGround, null, this);
        this.physics.add.collider(knife, this.player, this.damagePlayer, null, this);
    }
    
    knifeHitsGround(knife) {
        knife.destroy();  // Destroy knife when it hits the ground
    }

    magnusSetUp() {

    }
    createStarSky(tileSprite) {
        const tiles = this.physics.add.staticGroup();
        const groundHeight = 4 * 16; // Height of the ground tiles from the bottom
        const tileHeight = 16; // want to space them out
    
        const screenHeight = this.sys.game.config.height;
        const topLimit = screenHeight / 10; //player health data takes up this space
        const bottomLimit = 155; 
    
        for (let y = topLimit; y < bottomLimit; y += tileHeight) {
            for (let x = 0; x < this.sys.game.config.width; x += tileHeight) {
                if (Math.random() > 0.5) { 
                    let tile = tiles.create(x + Math.random() * tileHeight, y + Math.random() * tileHeight, tileSprite).setOrigin(0);
                    tile.refreshBody();
                }
            }
        }
        return tiles;
    }
    spawnZombiePawn() {
        const zombieY = this.sys.game.config.height - (4 * 16) - 32; 
        const zombie = this.zombies.create(0, zombieY, 'zombiePawn');
        zombie.setVelocityX(50); // Move right
        zombie.setCollideWorldBounds(false);
        zombie.play('zombieWalk'); 
    
        this.physics.add.collider(zombie, this.player, (zombie, player) => {
            this.damagePlayer(zombie, player);
            this.playZombieBreakAnimation(zombie.x, zombie.y);
            zombie.destroy();
        }, null, this);
    
        this.physics.add.collider(zombie, this.tiles); // Collide with ground tiles
    
        // Destroy zombie when it goes out of the game world bounds on the right
        zombie.setInteractive().on('pointerout', () => {
            if (zombie.x > this.sys.game.config.width) {
                zombie.destroy();
            }
        });
    }
    playZombieBreakAnimation(x, y) {
        const breakAnimation = this.add.sprite(x, y, 'zombiePawnBreak');
        breakAnimation.play('zombieBreak');
        breakAnimation.on('animationcomplete', () => {
            breakAnimation.destroy(); 
        });
    }
}

const healthMap = {
    'p': 2,  // Pawn
    'n': 3,  // Knight
    'b': 3,  // Bishop
    'r': 3,  // Rook
    'q': 3,  // Queen
};