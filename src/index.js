import Phaser from 'phaser';
import ChessScene from './scenes/ChessScene';
import FightScene from './scenes/FightScene';
import MainMenuScene from './scenes/MainMenuScene';
import TransitionScene from './scenes/TransitionScene';

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
            debug: false 
            //debug: true
        }
    },
    input: {
        gamepad: true
    },
    //scene: [MainMenuScene, ChessScene, FightScene, TransitionScene]
    scene: [FightScene]
};

new Phaser.Game(config);
