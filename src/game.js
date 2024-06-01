import Phaser from 'phaser';
import { Chess } from 'chess.js';


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
    this.chess = new Chess();

    // Make a test move
    const move = this.chess.move('e4');

    // Check and log the move object
    if (move) {
        console.log('Move successful:', move);
    } else {
        console.log('Move failed:', move);
    }

    // Log the current ASCII board (for debugging purposes)
    console.log(this.chess.ascii());
}


function update() { 
}
