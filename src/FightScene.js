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

        this.load.image('heart', 'assets/images/Heart.png');
    }

    create(data) {
        this.setupGamepad();
        this.gamepadButtons = {};
        
        this.cameras.main.setBackgroundColor('#F87858');
        this.attacker = this.game.registry.get('attacker');

        this.playerHealth = 3;
        this.opponentHealth = 3;
        this.playerInvulnerable = false;
        this.opponentInvulnerable = false;

        this.playerHearts = this.add.group({
            key: 'heart',
            repeat: this.playerHealth - 1,
            setXY: {
                x: 10,
                y: 10,
                stepX: 16
            }
        });
        this.opponentHearts = this.add.group({
            key: 'heart',
            repeat: this.opponentHealth - 1,
            setXY: {
                x: 10,
                y: 30,
                stepX: 16
            }
        });

        this.tiles = this.createTiles();
        this.player = this.physics.add.sprite(100, 100, 'w_p');
        this.player.setCollideWorldBounds(true);

        this.playerSword = this.createSword(this.player);

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
                //this.makeEnemyRed(opponent); //this.damageEnemy(opponent);
                this.damageOpponent();
                opponent.setVelocityX(300 * (opponent.flipX ? 1 : -1)); // Knockback effect
            }
        });

        this.physics.add.collider(this.player, this.opponentAI.sprite, (player, opponent) => {
            this.damagePlayer();
        });

        // Set up controls
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

        //const currentTime = this.time.now;
        if (Phaser.Input.Keyboard.JustDown(this.keys.swing)) {
            this.attack();
            // && currentTime > this.lastAttackTime + this.attackCooldown) {
            // this.playerSword.body.enable = true; // Enable physics body
            // this.playerSword.play('playerSwordSwing').once('animationcomplete', () => {
            //     this.playerSword.body.enable = false; // Disable physics body after animation
            // });
            // this.lastAttackTime = currentTime; // Update last swing time
        }

        if (this.gamepad) {
            this.handleGamepadInput(14, 'left');
            this.handleGamepadInput(15, 'right');
            this.handleGamepadInput(12, 'up');
            this.handleGamepadInput(13, 'down');

            this.handleGamepadInput(1, 'A');
            this.handleGamepadInput(0, 'B');
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
        let sword = this.physics.add.sprite(player.x + xOffset, player.y, 'sword');
        sword.body.setAllowGravity(false);
        sword.body.enable = false; // Disable physics body by default
        return sword;
    }

    updateSwordPosition() {
        this.playerSword.x = this.player.x + (this.player.flipX ? -8 : 8);
        this.playerSword.y = this.player.y - 4;
    }

    moveLeft() {
        this.player.setVelocityX(-130);
        this.player.flipX = true;
        this.playerSword.flipX = true;
        this.updateSwordPosition();
    }

    moveRight() {
        this.player.setVelocityX(130);
        this.player.flipX = false; 
        this.playerSword.flipX = false;
        this.updateSwordPosition();
    }

    jump() {
        if (this.player.body.touching.down) {
            this.player.setVelocityY(-160);
        }
    }

    attack() {
        const currentTime = this.time.now;
        if (currentTime > this.lastAttackTime + this.attackCooldown) {
            this.playerSword.body.enable = true;
            this.playerSword.play('playerSwordSwing').once('animationcomplete', () => {
                this.playerSword.body.enable = false;
            });
            this.lastAttackTime = currentTime;
        }
    }
    
    damagePlayer() {
        if (this.playerHealth > 0 && !this.playerInvulnerable) {
            this.playerHealth--;
            this.playerInvulnerable = true;
            this.blink(this.player, () => { this.playerInvulnerable = false; });
    
            let heart = this.playerHearts.getChildren()[this.playerHealth];
            if (heart) {
                heart.setVisible(false);
            }
    
            if (this.playerHealth === 0) {
                // Player dies, opponent wins
                this.game.registry.set('fightWinner', (this.attacker === 'player' ? 'defender' : 'attacker'));
                this.scene.switch('ChessScene');
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
                // Opponent dies, player wins
                this.game.registry.set('fightWinner', (this.attacker === 'opponent' ? 'defender' : 'attacker'));
                this.scene.switch('ChessScene');
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

    setupGamepad() {
        // Check if any gamepad is already connected
        if (this.input.gamepad.total > 0) {
            this.gamepad = this.input.gamepad.pad1;
            console.log('Gamepad connected!');
        } else {
            console.log('No gamepad connected at start.');
        }
    
        // Listen for gamepad connection
        this.input.gamepad.once('connected', (pad) => {
            this.gamepad = pad;
            console.log('Gamepad connected during scene!');
        });
    
        // Optional: Listen for gamepad disconnection
        this.input.gamepad.once('disconnected', (pad) => {
            if (this.gamepad === pad) {
                this.gamepad = null;
                console.log('Gamepad disconnected!');
            }
        });
    }
}