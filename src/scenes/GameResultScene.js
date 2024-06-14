import CRTEffect from '../CRTeffect.js';
export default class TransitionScene extends Phaser.Scene {
    constructor() {
        super({ key: 'TransitionScene' });
    }

    preload() {
        this.load.bitmapFont('pixelFont', 'assets/font/pixel.png', 'assets/font/pixel.xml');
        this.load.image('noiseTexture', 'assets/images/noiseTexture.png');
    }

    create() { 
        CRTEffect(this);

        this.add.bitmapText(112, 100, 'pixelFont', , 8);

        // this.time.delayedCall(1000, () => {
        //     this.scene.start('OpponentSelectScene');
        // });
    }
}
