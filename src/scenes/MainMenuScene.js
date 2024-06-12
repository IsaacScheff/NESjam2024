import CRTEffect from "../CRTeffect";
import { setupGamepad } from "../GamepadHandler";

export default class MainMenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainMenuScene' });
    }

    preload() {
        this.load.bitmapFont('pixelFont', 'assets/font/pixel.png', 'assets/font/pixel.xml');
        this.load.image('noiseTexture', 'assets/images/noiseTexture.png');
    }

    create() {
        setupGamepad(this);
        CRTEffect(this);
        // Display the placeholder text
        this.add.bitmapText(this.scale.width / 2, this.scale.height / 2 - 20, 'pixelFont', 'Placeholder', 8).setOrigin(0.5);
        this.add.bitmapText(this.scale.width / 2, this.scale.height / 2 + 10, 'pixelFont', 'Press Start', 8).setOrigin(0.5);

        // Setup the key for starting the game
        this.startKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
        this.startKey.on('down', () => {
            this.scene.start('OpponentSelectScene');
            //this.scene.start('ChessScene');
        });
    }

    update() {
        if (this.gamepad && this.gamepad.buttons[9].pressed) {
            this.scene.start('OpponentSelectScene');
            //this.scene.start('ChessScene');
        }
    }
}
