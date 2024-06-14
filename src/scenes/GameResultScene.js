import CRTEffect from '../CRTeffect.js';
export default class GameResultScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameResultScene' });
    }

    preload() {
        this.load.bitmapFont('pixelFont', 'assets/font/pixel.png', 'assets/font/pixel.xml');
        this.load.image('noiseTexture', 'assets/images/noiseTexture.png');
    }

    create() { 
        CRTEffect(this);
        this.resultsText = 'result text';
        this.add.bitmapText(112, 100, 'pixelFont', this.resultsText, 8);

    }

    returnToSelect() {
        this.scene.start('OpponentSelectScene');
    }
}
