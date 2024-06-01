import Phaser from 'phaser';

const config = {
    type: Phaser.AUTO,
    width: 256,
    height: 240,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 }
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

function preload() {
}

function create() {
}

function update() { 
}
