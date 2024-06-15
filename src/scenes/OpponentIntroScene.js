import CRTEffect from '../CRTeffect.js';
import { setupGamepad } from "../GamepadHandler";
export default class OpponentIntroScene extends Phaser.Scene {
    constructor() {
        super({ key: 'OpponentIntroScene' });
    }

    preload() {
        this.load.bitmapFont('pixelFont', 'assets/font/pixel.png', 'assets/font/pixel.xml');
        this.load.image('noiseTexture', 'assets/images/noiseTexture.png');

        this.load.image('pyroPortrait', 'assets/images/PyroPortrait.png');
        this.load.image('witchPortrait', 'assets/images/WitchPortrait.png');
        this.load.image('necroPortrait', 'assets/images/NecroPortrait.png');
        this.load.image('royalPortrait', 'assets/images/RoyalPortrait.png');
        this.load.image('magnusPortrait', 'assets/images/MagnusPortrait.png');
    }

    create() { 
        setupGamepad(this);
        this.gamepadButtons = {};
        CRTEffect(this);

        this.selectedOpponent = this.game.registry.get('selectedOpponent');
        let backgroundColor = '#000000';
        switch(this.selectedOpponent) {
            case 'The Pyromancer':
                backgroundColor = '#BCBCBC';
                this.add.image(128, 80, 'pyroPortrait');
                this.challengeText = "Welcome to my cave, \nConjurer. To be \nhonest I'm still new \nto chess."
                break;
            case 'Witch of the Forrest':
                backgroundColor = '#503000'
                this.add.image(128, 80, 'witchPortrait');
                this.challengeText = "Conjurer, I hope you \nenjoy my cozy cabin."
                break;
            case 'Mr. Necromancer':
                backgroundColor = '#4428BC';
                this.add.image(128, 80, 'necroPortrait');
                this.challengeText = "Beware the march of my\nzombie pawns, Conjurer."
                break;
            case 'Royal Magician':
                this.add.image(128, 80, 'royalPortrait');
                this.challengeText = "A marvelous match we'll\nhave here in the castle."
                backgroundColor = '#BCBCBC'
                break;
            case 'Magnus the Magus':
                this.add.image(128, 80, 'magnusPortrait');
                this.challengeText = "I get more upset at \nlosing at other things \nthan chess. I always \nget upset when I lose \nat Monopoly."
                backgroundColor = '#A4E4FC';
                break;
        }
        this.cameras.main.setBackgroundColor(backgroundColor);
        const graphics = this.add.graphics({ fillStyle: { color: 0x000000 } });
        const screenHeight = this.sys.game.config.height;
        const screenWidth = this.sys.game.config.width;
        const barHeight = screenHeight / 2;
        graphics.fillRect(0, 120, screenWidth, barHeight);
        
        this.keyEnter = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
        
        this.add.bitmapText(40, 140, 'pixelFont', this.challengeText, 8);
        this.add.bitmapText(80, 200, 'pixelFont', 'PRESS START', 8);

    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.keyEnter)) {
            this.scene.start('ChessScene');
        }

        if (this.gamepad) {
            if (this.gamepad.buttons[9].pressed) {
                this.scene.start('ChessScene');
            }
        }
    }
}
