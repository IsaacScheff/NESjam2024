import CRTEffect from '../CRTeffect.js';
export default class GameResultScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameResultScene' });
    }

    preload() {
        this.load.bitmapFont('pixelFont', 'assets/font/pixel.png', 'assets/font/pixel.xml');
        this.load.image('noiseTexture', 'assets/images/noiseTexture.png');

        this.load.image('pyroPortrait', 'assets/images/PyroPortrait.png');
        this.load.image('witchPortrait', 'assets/images/WitchPortrait.png');
        this.load.image('necroPortrait', 'assets/images/NecroPortrait.png');
        this.load.image('royalPortrait', 'assets/images/RoyalPortrait.png');
        this.load.image('magnusPortrait', 'assets/images/MagnusPortrait.png');

        this.load.audio('winJingle', 'assets/sounds/win.mp3');
        this.load.audio('loseJingle', 'assets/sounds/lose.mp3');
    }

    create() { 
        CRTEffect(this);

        this.result = this.game.registry.get('result');
        this.selectedOpponent = this.game.registry.get('selectedOpponent');
        this.resultsText = '';

        switch(this.selectedOpponent) {
            case 'The Pyromancer':
                this.add.image(128, 80, 'pyroPortrait');
                this.oppWinText = "Hah! Maybe \nyou're new too.";
                this.playerWinText = 'Yargh, I got \nburned this time.';
                this.backgroundColor = '#BCBCBC';
                break;
            case 'Witch of the Forrest':
                this.add.image(128, 80, 'witchPortrait');
                this.oppWinText = "Alright! A win \nfor this witch!";
                this.playerWinText = 'Ah well, you \nyou win this time.';
                this.backgroundColor = '#503000'
                break;
            case 'Mr. Necromancer':
                this.add.image(128, 80, 'necroPortrait');
                this.oppWinText = "Zombie pawns, \nthey never fail.";
                this.playerWinText = 'My zombie pawns, \nthey failed.';
                this.backgroundColor = '#4428BC';
                break;
            case 'Royal Magician':
                this.add.image(128, 80, 'royalPortrait');
                this.oppWinText = "You put up a \nvaliant effort.";
                this.playerWinText = 'Aw man, you \nbeat me in front \nof the king.';
                this.backgroundColor = '#BCBCBC'
                break;
            case 'Magnus the Magus':
                this.add.image(128, 80, 'magnusPortrait');
                this.oppWinText = "Better luck next time.";
                this.playerWinText = "At least it's \nnot Monopoly. ";
                this.sbackgroundColor = '#A4E4FC';
                break;
        }
        this.cameras.main.setBackgroundColor(this.backgroundColor);
        const graphics = this.add.graphics({ fillStyle: { color: 0x000000 } });
        const screenHeight = this.sys.game.config.height;
        const screenWidth = this.sys.game.config.width;
        const barHeight = screenHeight / 2;
        graphics.fillRect(0, 120, screenWidth, barHeight);

        switch(this.result) {
            case 'player':
                this.resultsText = this.playerWinText;
                this.sound.play('winJingle');
                break;
            case 'opponent':
                this.resultsText = this.oppWinText;
                this.sound.play('loseJingle');
                break;
            case 'draw':
                this.resultsText = 'Looks like a tie';
        }       
        this.add.bitmapText(40, 140, 'pixelFont', this.resultsText, 8);

        this.returnToSelect();
    }

    returnToSelect() {
        const keys = Object.keys(this.game.registry.values);
            keys.forEach(key => {
                this.game.registry.remove(key);
            });
            
        this.time.delayedCall(5000, () => {
            this.scene.start('OpponentSelectScene');
        });
    }
}