import CRTEffect from '../CRTeffect.js';
export default class TransitionScene extends Phaser.Scene {
    constructor() {
        super({ key: 'TransitionScene' });
    }

    preload() {
        this.load.bitmapFont('pixelFont', 'assets/font/pixel.png', 'assets/font/pixel.xml');
        this.load.image('noiseTexture', 'assets/images/noiseTexture.png');
        this.load.audio('gong', 'assets/sounds/gong.wav');

        this.load.image('b_r', 'assets/images/BlackRook.png');
        this.load.image('b_p', 'assets/images/BlackPawn.png');
        this.load.image('b_n', 'assets/images/BlackKnight.png');
        this.load.image('b_k', 'assets/images/BlackKing.png');
        this.load.image('b_q', 'assets/images/BlackQueen.png');
        this.load.image('b_b', 'assets/images/BlackBishop.png');

        this.load.image('w_r', 'assets/images/WhiteRook.png');
        this.load.image('w_p', 'assets/images/WhitePawn.png');
        this.load.image('w_n', 'assets/images/WhiteKnight.png');
        this.load.image('w_k', 'assets/images/WhiteKing.png');
        this.load.image('w_q', 'assets/images/WhiteQueen.png');
        this.load.image('w_b', 'assets/images/WhiteBishop.png');
    }

    create() { 
        CRTEffect(this);
        const fightData = this.game.registry.get('fightData');
        const whitePieceKey = `w_${fightData.white}`;
        const blackPieceKey = `b_${fightData.black}`;

        this.add.bitmapText(112, 100, 'pixelFont', 'FIGHT!', 8);

        const whitePieceImage = this.add.image(56, 100, whitePieceKey);
        const blackPieceImage = this.add.image(200, 100, blackPieceKey);

        this.sound.play("gong");

        this.time.delayedCall(1000, () => {
            this.scene.start('FightScene');
        });
    }
}
