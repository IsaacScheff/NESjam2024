import BasePawnAI from "./ai/basePawnAI";

export default class FightScene extends Phaser.Scene {
    constructor() {
        super({ key: 'FightScene' });

        this.lastAttackTime = 0;  // Timestamp of the last swing
        this.attackCooldown = 1000; // Cooldown time in milliseconds (1 second)
    }

    preload() {
        this.load.bitmapFont('pixelFont', 'assets/font/pixel.png', 'assets/font/pixel.xml');
        this.load.image('stone', 'assets/images/StoneBlock1.png');
        this.load.image('w_p', 'assets/images/WhitePawn.png');
        this.load.image('b_p', 'assets/images/BlackPawn.png'); 

        this.load.image('sword', 'assets/images/PawnSwordBase.png');
        this.load.image('swordSmear', 'assets/images/PawnSwordSmear.png');
        this.load.image('swordThrust', 'assets/images/PawnSwordFinal.png');
    }

    create() {
        this.tiles = this.createTiles();
        this.player = this.physics.add.sprite(100, 100, 'w_p');
        this.player.setCollideWorldBounds(true);

        this.playerSword = this.createSword(this.player);

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

        // Create opponent pawn
        let opponentPawn = this.physics.add.sprite(200, 100, 'b_p'); 
        opponentPawn.setCollideWorldBounds(true);
        this.physics.add.collider(opponentPawn, this.tiles);

        // Initialize AI for the opponent pawn
        this.opponentAI = new BasePawnAI(this, opponentPawn, {
            minX: 16,
            maxX: this.sys.game.config.width - 16, 
            velocity: 100,
            jumpChance: 0.05
        });

        this.physics.add.collider(this.player, this.tiles);

        this.physics.add.collider(this.playerSword, this.opponentAI.sprite, (sword, opponent) => {
            if (sword.anims.isPlaying && sword.anims.currentAnim.key === 'playerSwordSwing') {
                this.makeEnemyRed(opponent); //this.damageEnemy(opponent);
                opponent.setVelocityX(300 * (opponent.flipX ? 1 : -1)); // Knockback effect
            }
        });

        this.physics.add.collider(this.player, this.opponentAI.sprite, (player, opponent) => {
            // Handle damage to player or bounce off logic
        });

        // Set up controls
        this.setupControls();
    }

    update() {
        this.player.setVelocityX(0);

        if (this.arrowKeys.left.isDown || this.keys.left.isDown) {
            this.player.setVelocityX(-130);
            this.player.flipX = true; 
            this.playerSword.flipX = true;
            this.updateSwordPosition();
        } else if (this.arrowKeys.right.isDown || this.keys.right.isDown) {
            this.player.setVelocityX(130);
            this.player.flipX = false; 
            this.playerSword.flipX = false;
            this.updateSwordPosition();
        }

        if (Phaser.Input.Keyboard.JustDown(this.keys.jump) && this.player.body.touching.down) {
            this.player.setVelocityY(-160); // Adjust jump strength as needed
        }

        const currentTime = this.time.now;
        if (Phaser.Input.Keyboard.JustDown(this.keys.swing) && currentTime > this.lastAttackTime + this.attackCooldown) {
            this.playerSword.body.enable = true; // Enable physics body
            this.playerSword.play('playerSwordSwing').once('animationcomplete', () => {
                this.playerSword.body.enable = false; // Disable physics body after animation
            });
            this.lastAttackTime = currentTime; // Update last swing time
        }

        this.updateSwordPosition();

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
        let sword = this.physics.add.sprite(player.x + xOffset, player.y, 'sword');
        sword.body.setAllowGravity(false);
        sword.body.enable = false; // Disable physics body by default
        return sword;
    }

    updateSwordPosition() {
        this.playerSword.x = this.player.x + (this.player.flipX ? -8 : 8);
        this.playerSword.y = this.player.y - 4;
    }

    makeEnemyRed(opponent) {
        opponent.setTint(0xff0000); // Set to red
        this.time.delayedCall(200, () => {
            opponent.clearTint(); // Remove tint after 200ms
        });
    }
}