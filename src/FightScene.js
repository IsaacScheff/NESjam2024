export default class FightScene extends Phaser.Scene {
    constructor() {
        super({ key: 'FightScene' });
    }

    preload() {
        this.load.bitmapFont('pixelFont', 'assets/font/pixel.png', 'assets/font/pixel.xml');
    }

    create() {
        this.add.bitmapText(100, 100, 'pixelFont', 'FIGHT SCENE', 8);

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
    }
}
