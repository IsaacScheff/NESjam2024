import CRTEffect from '../CRTeffect.js';
import { setupGamepad } from "../GamepadHandler";
export default class OpponentIntroScene extends Phaser.Scene {
    constructor() {
        super({ key: 'OpponentIntroScene' });
    }

    preload() {
        this.load.bitmapFont('pixelFont', 'assets/font/pixel.png', 'assets/font/pixel.xml');
        this.load.image('noiseTexture', 'assets/images/noiseTexture.png');
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
                this.challengeText = "Welcome to my cave, \nConjurer. I'm still \nnew to this game."
                break;
            case 'Witch of the Forrest':
                backgroundColor = '#503000'
                this.challengeText = "Conjurer, I hope you find \nmy cabin to be cozy."
                break;
            case 'Mr. Necromancer':
                backgroundColor = '#4428BC';
                this.challengeText = "Beware the march of my\nzombie pawns, Conjurer."
                break;
            case 'Royal Magician':
                this.challengeText = "A marvelous match we'll\nhave here in the castle."
                backgroundColor = '#BCBCBC'
                break;
            case 'Magnus the Magus':
                this.challengeText = "I get more upset at \nlosing at other things \nthan chess. I always \nget upset when I lose \nat Monopoly."
                backgroundColor = '#A4E4FC';
                break;
        }
        
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
