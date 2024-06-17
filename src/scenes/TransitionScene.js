import CRTEffect from '../CRTeffect.js';
export default class TransitionScene extends Phaser.Scene {
    constructor() {
        super({ key: 'TransitionScene' });
    }

    preload() {
        this.load.bitmapFont('pixelFont', 'assets/font/pixel.png', 'assets/font/pixel.xml');
        this.load.image('noiseTexture', 'assets/images/noiseTexture.png');

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

        this.fightData = this.game.registry.get('fightData');
        switch(this.fightData.black) {
            case 'p':
                this.load.audio('pawnMusic', 'assets/sounds/pawnbattle.mp3');
                this.musicKey = 'pawnMusic';
                break;
            case 'n':
                this.load.audio('knightMusic', 'assets/sounds/knightbattle.mp3');
                this.musicKey = 'knightMusic';
                break;
            case 'b':
                this.load.audio('bishopMusic', 'assets/sounds/bishopbattle.mp3');
                this.musicKey = 'bishopMusic';
                break;
            case 'r':
                this.load.audio('rookMusic', 'assets/sounds/rookbattle.mp3');
                this.musicKey = 'rookMusic';
                break;
            case 'q':
                this.load.audio('queenMusic', 'assets/sounds/queenbattle.mp3');
                this.musicKey = 'queenMusic';
                break;
        } 
    }

    create() { 
        CRTEffect(this);
        const fightData = this.game.registry.get('fightData');
        const whitePieceKey = `w_${fightData.white}`;
        const blackPieceKey = `b_${fightData.black}`;

        this.musicConfig = {
            mute: false,
            volume: 1,
            rate: 1,
            detune: 0,
            loop: true,
            delay: 0
        };
        this.battleMusic = this.sound.add(this.musicKey);
        this.battleMusic.play(this.musicConfig);
        this.game.registry.set('battleMusic', this.battleMusic);

        this.add.bitmapText(112, 100, 'pixelFont', 'BATTLE!', 8);

        const whitePieceImage = this.add.image(56, 100, whitePieceKey);
        const blackPieceImage = this.add.image(200, 100, blackPieceKey);

        this.time.delayedCall(1000, () => {
            this.scene.start('FightScene');
        });
    }
}
