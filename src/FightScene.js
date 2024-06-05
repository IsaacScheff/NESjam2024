export default class FightScene extends Phaser.Scene {
    constructor() {
        super({ key: 'FightScene' });
    }

    preload() {
        this.load.bitmapFont('pixelFont', 'assets/font/pixel.png', 'assets/font/pixel.xml');
        this.load.image('stone', 'assets/images/StoneBlock1.png');
        this.load.image('w_p', 'assets/images/WhitePawn.png');
    }

    create() {
        // Handle the Enter key to switch back to the chess game
        this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
        this.enterKey.on('down', () => {
            console.log("Returning to chess game");
            this.game.registry.set('fightWinner', 'attacker');
            this.scene.switch('MainScene');  
        });

        this.defenderWinKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.H); 
        this.defenderWinKey.on('down', () => {
            console.log("Defender wins, returning to chess game");
            this.game.registry.set('fightWinner', 'defender');
            this.scene.switch('MainScene');
        });

        this.tiles = this.createTiles();  // Save the tiles static group

        this.player = this.physics.add.sprite(100, 100, 'w_p');
        this.player.setCollideWorldBounds(true);

        // Enable collision between the player and the tiles
        this.physics.add.collider(this.player, this.tiles);
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
}

