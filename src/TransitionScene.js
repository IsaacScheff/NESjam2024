export default class TransitionScene extends Phaser.Scene {
    constructor() {
        super({ key: 'TransitionScene' });
    }

    create(data) { 
    // Start FightScene with initial data or configuration
        this.scene.start('FightScene', { someData: data });
    }
}
