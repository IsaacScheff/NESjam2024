// FightScene.js
export default class FightScene extends Phaser.Scene {
    constructor() {
        super({ key: 'FightScene' });
    }

    create() {
        console.log("Entered FightScene");

        // Handle the Enter key to switch back to the chess game
        this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
        this.enterKey.on('down', () => {
            console.log("Returning to chess game");
            this.scene.switch('MainScene');  
        });
    }
}
