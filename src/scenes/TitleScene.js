import CRTEffect from "../CRTeffect";
import createPalettes from "../CreatePalettes";
import { setupGamepad } from "../GamepadHandler";

export default class TitleScene extends Phaser.Scene {
    constructor() {
        super({ key: 'TitleScene' });
    }

    preload() {
        this.load.bitmapFont('pixelFont', 'assets/font/pixel.png', 'assets/font/pixel.xml');
        this.load.image('noiseTexture', 'assets/images/noiseTexture.png');

        this.load.image('oppPalette', 'assets/images/OpponentPalette.png');
        this.load.spritesheet('pyroPawn', 'assets/images/PyroPawn.png',  { frameWidth: 16, frameHeight: 20 });
        this.load.spritesheet('pyroKnight', 'assets/images/PyroKnight.png', { frameWidth: 19, frameHeight: 18 });
        this.load.spritesheet('pyroBishop', 'assets/images/PyroBishop.png', { frameWidth: 16, frameHeight: 18});
        this.load.spritesheet('pyroRook', 'assets/images/PyroRook.png', { frameWidth: 18, frameHeight: 20 });
        this.load.spritesheet('pyroQueen', 'assets/images/PyroQueen.png', { frameWidth: 20, frameHeight: 18});
        this.load.image('logo', 'assets/images/CCJLogo.png');
    }
    create() {
        setupGamepad(this);
        CRTEffect(this);
    
        this.add.image(130, 100, 'logo');
        const paletteKeys = ['pyro', 'witch', 'necro', 'royal', 'magnus'];
        const positions = [
            { x: 230, y: 160 },  // First Pawn
            { x: 30, y: 40 },  
            { x: 80, y: 160 },  // First Knight
            { x: 180, y: 40 },  
            { x: 30, y: 160 }, // First Bishop
            { x: 230, y: 40 }, 
            { x: 180, y: 160 }, // First Rook
            { x: 80, y: 40 }, 
            { x: 130, y: 40 }, //First Queen 
            { x: 130, y: 160 }  
        ];
        
    
        const spriteConfigs = {
            Pawn: { key: 'pyroPawn', frameWidth: 16, frameHeight: 20 },
            Knight: { key: 'pyroKnight', frameWidth: 19, frameHeight: 18 },
            Bishop: { key: 'pyroBishop', frameWidth: 16, frameHeight: 18 },
            Rook: { key: 'pyroRook', frameWidth: 18, frameHeight: 20 },
            Queen: { key: 'pyroQueen', frameWidth: 20, frameHeight: 18 }
        };
    
        const pieceTypes = ['Pawn', 'Knight', 'Bishop', 'Rook', 'Queen'];
        pieceTypes.forEach((type, typeIndex) => {
            for (let i = 0; i < 2; i++) { // Create two sprites for each piece type
                const config = {
                    paletteKey: 'oppPalette',
                    paletteNames: paletteKeys,
                    spriteSheet: spriteConfigs[type],
                    animations: [
                        { key: 'intro', frameRate: 10, startFrame: 0, endFrame: 2, repeat: 3 }
                    ]
                };
                createPalettes(config, this.game);
    
                const randomStartSuffix = Phaser.Math.RND.pick(paletteKeys);
                let sprite = this.add.sprite(positions[typeIndex * 2 + i].x, positions[typeIndex * 2 + i].y, `${config.spriteSheet.key}-${randomStartSuffix}`);
                sprite.anims.play(`${config.spriteSheet.key}-${randomStartSuffix}-intro`);
    
                sprite.on('animationcomplete', () => {
                    this.cycleAnimation(sprite, config, paletteKeys);
                });
            }
        });
    
        this.add.bitmapText(this.scale.width / 2, this.scale.height / 2 + 70, 'pixelFont', 'Press Start', 8).setOrigin(0.5);
        this.startKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
        this.startKey.on('down', () => {
            this.scene.start('OpponentSelectScene');
        });
    }
    
    cycleAnimation(sprite, config, paletteKeys) {
        const newSuffix = Phaser.Math.RND.pick(paletteKeys);
        const newAnimKey = `${config.spriteSheet.key}-${newSuffix}-intro`;
        sprite.anims.play(newAnimKey);
    }

    update() {
        if (this.gamepad && this.gamepad.buttons[9].pressed) {
            this.scene.start('OpponentSelectScene');
        }
    }

}