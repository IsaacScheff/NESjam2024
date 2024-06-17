import CRTEffect from "../CRTeffect";
import { setupGamepad } from "../GamepadHandler";
export default class OpponentSelectScene extends Phaser.Scene {
    constructor() {
        super({ key: 'OpponentSelectScene' });
    }

    preload() {
        this.load.bitmapFont('pixelFont', 'assets/font/pixel.png', 'assets/font/pixel.xml');
        this.load.image('noiseTexture', 'assets/images/noiseTexture.png');

        this.load.audio('titleTheme', 'assets/sounds/titletheme.mp3');
    }

    create() {
        setupGamepad(this);
        this.gamepadButtons = {};
        CRTEffect(this);

        this.add.bitmapText(70, 40, 'pixelFont', 'SELECT OPPONENT', 8);

        this.opponents = [
            this.add.bitmapText(40, 80, 'pixelFont', 'The Pyromancer', 8),
            this.add.bitmapText(40, 105, 'pixelFont', 'Witch of the Forrest', 8),
            this.add.bitmapText(40, 130, 'pixelFont', 'Mr. Necromancer', 8),
            this.add.bitmapText(40, 155, 'pixelFont', 'Royal Magician', 8),
            this.add.bitmapText(40, 180, 'pixelFont', 'Magnus the Magus', 8)
        ]

        this.selector = this.add.bitmapText(30, 80, 'pixelFont', '>', 8);
        this.selectedIndex = 0;

        this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.keyJ = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.J);
        this.cursors = this.input.keyboard.createCursorKeys();

        if (!this.sound.get('titleTheme') || !this.sound.get('titleTheme').isPlaying) {
            this.themeMusic = this.sound.add('titleTheme', { loop: true });
            this.themeMusic.play();
        }
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.cursors.up) || Phaser.Input.Keyboard.JustDown(this.keyW)) {
            this.moveSelection(-1);
        } else if (Phaser.Input.Keyboard.JustDown(this.cursors.down) || Phaser.Input.Keyboard.JustDown(this.keyS)) {
            this.moveSelection(1);
        } else if (Phaser.Input.Keyboard.JustDown(this.keyJ)) {
            this.confirmSelection();
        }

        if (this.gamepad) {
            this.handleGamepadInput(12, 'up');
            this.handleGamepadInput(13, 'down');

            this.handleGamepadInput(1, 'A');
        }
    }

    moveSelection(direction) {
        this.selectedIndex += direction;
        if (this.selectedIndex < 0) this.selectedIndex = this.opponents.length - 1;
        else if (this.selectedIndex >= this.opponents.length) this.selectedIndex = 0;

        this.selector.setY(this.opponents[this.selectedIndex].y);
    }

    confirmSelection() {
        const selectedOpponent = this.opponents[this.selectedIndex].text;
        this.game.registry.set('selectedOpponent', selectedOpponent);
        this.sound.stopByKey('titleTheme');
        this.scene.start('OpponentIntroScene');
    }

    handleGamepadInput(buttonIndex, action) {
        const isDown = this.gamepad.buttons[buttonIndex].pressed;
        const wasDown = this.gamepadButtons[buttonIndex];
    
        if (isDown && !wasDown) {
            switch (action) {
                case 'up':
                    this.moveSelection(-1);
                    break;
                case 'down':
                    this.moveSelection(1);
                    break;
                case 'A':
                    this.confirmSelection();
                    break;
            }
        }
    
        // Update the stored state for the next frame
        this.gamepadButtons[buttonIndex] = isDown;
    }
}
