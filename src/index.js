import Phaser from 'phaser';
import MainScene from './MainScene';
import FightScene from './FightScene';

const config = {
    type: Phaser.AUTO,
    width: 256,
    height: 240,
    zoom: 3,
    pixelArt: true,
    parent: 'game-container',
    physics: {
        default: 'arcade',
        matter: {
            gravity: { y: 0 },
            debug: false 
        }
    },
    scene: [MainScene, FightScene]
};

new Phaser.Game(config);
