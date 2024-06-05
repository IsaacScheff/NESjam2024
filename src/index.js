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
        arcade: {
            gravity: { y: 300 },
            //debug: false 
            debug: true
        }
    },
    scene: [MainScene, FightScene]
    //scene: [FightScene]
};

new Phaser.Game(config);
