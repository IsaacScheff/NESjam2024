import CRTEffect from "../CRTeffect";
import createPalettes from "../CreatePalettes";
import { setupGamepad } from "../GamepadHandler";

export default class MainMenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainMenuScene' });
    }

    preload() {
        this.load.bitmapFont('pixelFont', 'assets/font/pixel.png', 'assets/font/pixel.xml');
        this.load.image('noiseTexture', 'assets/images/noiseTexture.png');

        this.load.image('oppPalette', 'assets/images/OpponentPalette.png');
        this.load.spritesheet('pyroRook', 'assets/images/PyroRook.png', { frameWidth: 18, frameHeight: 20 });
    }

    create() {
        setupGamepad(this);
        CRTEffect(this);

        let animConfig = {
            paletteKey: 'oppPalette',
            paletteNames: ['pyro', 'witch', 'necro', 'royal', 'magnus'],
            spriteSheet: {
                key: 'pyroRook',
                frameWidth: 18,
                frameHeight: 20
            },
            animations: [
                { key: 'sizzle', frameRate: 10, startFrame: 0, endFrame: 2 }
            ]
        };

        createPalettes(animConfig, this.game);
        let rookie = this.add.sprite(120, 80, 'pyroRook-' + animConfig.paletteNames[2]);

        // Display the placeholder text
        this.add.bitmapText(this.scale.width / 2, this.scale.height / 2 - 20, 'pixelFont', 'Placeholder', 8).setOrigin(0.5);
        this.add.bitmapText(this.scale.width / 2, this.scale.height / 2 + 10, 'pixelFont', 'Press Start', 8).setOrigin(0.5);

        // Setup the key for starting the game
        this.startKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
        this.startKey.on('down', () => {
            this.scene.start('OpponentSelectScene');
            //this.scene.start('ChessScene');
        });
    }

    update() {
        if (this.gamepad && this.gamepad.buttons[9].pressed) {
            this.scene.start('OpponentSelectScene');
            //this.scene.start('ChessScene');
        }
    }

}

// function createPalettes(config, game) {
//     // Create color lookup from palette image.
//     let colorLookup = {};
//     let x, y;
//     let pixel, palette;
//     let paletteWidth = game.textures.get(config.paletteKey).getSourceImage().width;

//     // Go through each pixel in the palette image and add it to the color lookup.
//     for (y = 0; y < config.paletteNames.length; y++) {
//         palette = config.paletteNames[y];
//         colorLookup[palette] = [];

//         for (x = 0; x < paletteWidth; x++) {
//             pixel = game.textures.getPixel(x, y, config.paletteKey);
//             colorLookup[palette].push(pixel);
//         }
//     }

//     // Create sheets and animations from base sheet.
//     let sheet = game.textures.get(config.spriteSheet.key).getSourceImage();
//     let atlasKey, anim, animKey;
//     let canvasTexture = game.textures.createCanvas(config.spriteSheet.key + '-temp', sheet.width, sheet.height);
//     let canvas = canvasTexture.getSourceImage();
//     let context = canvas.getContext('2d');

//     // Iterate over each palette.
//     for (y = 0; y < config.paletteNames.length; y++) {
//         palette = config.paletteNames[y];
//         atlasKey = config.spriteSheet.key + '-' + palette;

//         // Clear the canvas and copy the sheet.
//         context.clearRect(0, 0, sheet.width, sheet.height);
//         context.drawImage(sheet, 0, 0);

//         // Get image data from the new sheet.
//         let imageData = context.getImageData(0, 0, sheet.width, sheet.height);
//         let pixelArray = imageData.data;

//         // Iterate through every pixel in the image.
//         replacePixels(pixelArray, paletteWidth, colorLookup[config.paletteNames[0]], colorLookup[palette]);

//         // Put our modified pixel data back into the context.
//         context.putImageData(imageData, 0, 0);

//         // Check if the atlas texture already exists before creating a new one
//         if (!game.textures.exists(atlasKey)) {
//             game.textures.addSpriteSheet(atlasKey, canvas, {
//                 frameWidth: config.spriteSheet.frameWidth,
//                 frameHeight: config.spriteSheet.frameHeight,
//             });
//         }

//         // Iterate over each animation.
//         for (let a = 0; a < config.animations.length; a++) {
//             anim = config.animations[a];
//             animKey = atlasKey + '-' + anim.key;

//             // Check if the animation already exists before creating a new one
//             if (!game.anims.exists(animKey)) {
//                 game.anims.create({
//                     key: animKey,
//                     frames: game.anims.generateFrameNumbers(atlasKey, {start: anim.startFrame, end: anim.endFrame}),
//                     frameRate: anim.frameRate,
//                     repeat: anim.repeat === undefined ? -1 : anim.repeat
//                 });
//             }
//         }
//     }

//     // Destroy the temporary texture after all processing is complete.
//     game.textures.remove(config.spriteSheet.key + '-temp');

//     // Destroy textures that are no longer needed.
//     game.textures.remove(config.spriteSheet.key);
//     game.textures.remove(config.paletteKey);
// }












// function extractColorLookup(game, config, paletteWidth) {
//     let colorLookup = {};
//     for (let y = 0; y < config.paletteNames.length; y++) {
//         let palette = config.paletteNames[y];
//         colorLookup[palette] = [];
//         for (let x = 0; x < paletteWidth; x++) {
//             let pixel = game.textures.getPixel(x, y, config.paletteKey);
//             colorLookup[palette].push(pixel);
//         }
//     }
//     return colorLookup;
// }

// function manageCanvas(canvas, context, sheet) {
//     context.clearRect(0, 0, sheet.width, sheet.height);
//     context.drawImage(sheet, 0, 0);
// }

// function createAnimations(game, atlasKey, config) {
//     for (let a = 0; a < config.animations.length; a++) {
//         let anim = config.animations[a];
//         let animKey = atlasKey + '-' + anim.key;
//         if (!game.anims.exists(animKey)) {
//             game.anims.create({
//                 key: animKey,
//                 frames: game.anims.generateFrameNumbers(atlasKey, {start: anim.startFrame, end: anim.endFrame}),
//                 frameRate: anim.frameRate,
//                 repeat: anim.repeat === undefined ? -1 : anim.repeat
//             });
//         }
//     }
// }

// function createPalettes(config, game) {
//     let paletteWidth = game.textures.get(config.paletteKey).getSourceImage().width;
//     let colorLookup = extractColorLookup(game, config, paletteWidth);
//     let sheet = game.textures.get(config.spriteSheet.key).getSourceImage();
//     let canvasTexture = game.textures.createCanvas(config.spriteSheet.key + '-temp', sheet.width, sheet.height);
//     let canvas = canvasTexture.getSourceImage();
//     let context = canvas.getContext('2d');

//     // Iterate over each palette
//     config.paletteNames.forEach(palette => {
//         let atlasKey = `${config.spriteSheet.key}-${palette}`;
//         manageCanvas(canvas, context, sheet);

//         let imageData = context.getImageData(0, 0, sheet.width, sheet.height);
//         replacePixels(imageData.data, paletteWidth, colorLookup[config.paletteNames[0]], colorLookup[palette]);
//         context.putImageData(imageData, 0, 0);

//         if (!game.textures.exists(atlasKey)) {
//             game.textures.addSpriteSheet(atlasKey, canvas, {
//                 frameWidth: config.spriteSheet.frameWidth,
//                 frameHeight: config.spriteSheet.frameHeight,
//             });
//         }

//         createAnimations(game, atlasKey, config);
//     });

//     game.textures.remove(config.spriteSheet.key + '-temp');
//     game.textures.remove(config.spriteSheet.key);
//     game.textures.remove(config.paletteKey);
// }


// function replacePixels(pixelArray, paletteWidth, baseColors, newColors) {
//     for (let p = 0; p < pixelArray.length; p += 4) {
//         let [r, g, b, alpha] = [pixelArray[p], pixelArray[p+1], pixelArray[p+2], pixelArray[p+3]];
//         if (alpha === 0) continue;

//         for (let c = 0; c < paletteWidth; c++) {
//             let oldColor = baseColors[c];
//             let newColor = newColors[c];
//             if (r === oldColor.r && g === oldColor.g && b === oldColor.b) {
//                 [pixelArray[p], pixelArray[p+1], pixelArray[p+2]] = [newColor.r, newColor.g, newColor.b];
//                 break; // Added a break to improve efficiency once a match is found
//             }
//         }
//     }
// }
