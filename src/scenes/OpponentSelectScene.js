export default class TransitionScene extends Phaser.Scene {
    constructor() {
        super({ key: 'OpponenetSelectScene' });
    }

    preload() {
        this.load.bitmapFont('pixelFont', 'assets/font/pixel.png', 'assets/font/pixel.xml');
    }

    create() {
    }
}
