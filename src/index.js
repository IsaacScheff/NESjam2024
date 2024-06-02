import Phaser from 'phaser';
import MainScene from './MainScene';

const config = {
    type: Phaser.AUTO,
    width: 256,
    height: 240,
    parent: 'game-container',
    physics: {
        default: 'arcade',
        matter: {
            gravity: { y: 0 },
            debug: false 
        }
    },
    scene: [MainScene]
};

new Phaser.Game(config);
