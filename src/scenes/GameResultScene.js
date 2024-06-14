import CRTEffect from '../CRTeffect.js';
import { setupGamepad } from "../GamepadHandler";
export default class GameResultScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameResultScene' });
    }

    preload() {
        this.load.bitmapFont('pixelFont', 'assets/font/pixel.png', 'assets/font/pixel.xml');
        this.load.image('noiseTexture', 'assets/images/noiseTexture.png');
    }

    create() { 
        setupGamepad(this);
        this.gamepadButtons = {};
        CRTEffect(this);

        this.result = this.game.registry.get('result');
        this.selectedOpponent = this.game.registry.get('selectedOpponent');
        this.resultsText = '';

        switch(this.selectedOpponent) {
            case 'The Pyromancer':
                this.oppWinText = "Pyro wins.";
                this.playerWinText = 'Pyro Loses';
                this.drawText = 'Draw';
                //set potrait
                break;
            case 'Witch of the Forrest':
                this.oppWinText = "Witch wins.";
                this.playerWinText = 'Witch Loses';
                this.drawText = 'Draw';
                //set potrait
                break;
            case 'Mr. Necromancer':
                this.oppWinText = "Necro wins.";
                this.playerWinText = 'Necro Loses';
                this.drawText = 'Draw';
                //set potrait
                break;
            case 'Royal Magician':
                this.oppWinText = "Royal wins.";
                this.playerWinText = 'Royal Loses';
                this.drawText = 'Draw';
                //set potrait
                break;
            case 'Magnus the Magus':
                this.oppWinText = "Magnus wins.";
                this.playerWinText = 'Magnus Loses';
                this.drawText = 'Draw';
                //set potrait
                break;
        }

        switch(this.result) {
            case 'player':
                this.resultsText = this.playerWinText;
                break;
            case 'opponent':
                this.resultsText = this.oppWinText;
                break;
            case 'draw':
                this.resultsText = this.drawText;
        }       
        this.add.bitmapText(112, 100, 'pixelFont', this.resultsText, 8);
        this.add.bitmapText(80, 200, 'pixelFont', 'PRESS START', 8);

        this.keyEnter = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.keyEnter)) {
            this.returnToSelect();
        }

        if (this.gamepad) {
            if (this.gamepad.buttons[9].pressed) {
                this.returnToSelect();
            }
        }
    }

    returnToSelect() {
        this.scene.start('OpponentSelectScene');
    }
}
