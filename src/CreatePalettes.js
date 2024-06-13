export default function createPalettes(config, game) {
    let paletteWidth = game.textures.get(config.paletteKey).getSourceImage().width;
    let colorLookup = extractColorLookup(game, config, paletteWidth);
    let sheet = game.textures.get(config.spriteSheet.key).getSourceImage();
    let canvasTexture = game.textures.createCanvas(config.spriteSheet.key + '-temp', sheet.width, sheet.height);
    let canvas = canvasTexture.getSourceImage();
    let context = canvas.getContext('2d');

    // Iterate over each palette
    config.paletteNames.forEach(palette => {
        let atlasKey = `${config.spriteSheet.key}-${palette}`;
        manageCanvas(canvas, context, sheet);

        let imageData = context.getImageData(0, 0, sheet.width, sheet.height);
        replacePixels(imageData.data, paletteWidth, colorLookup[config.paletteNames[0]], colorLookup[palette]);
        context.putImageData(imageData, 0, 0);

        if (!game.textures.exists(atlasKey)) {
            game.textures.addSpriteSheet(atlasKey, canvas, {
                frameWidth: config.spriteSheet.frameWidth,
                frameHeight: config.spriteSheet.frameHeight,
            });
        }

        createAnimations(game, atlasKey, config);
    });

    game.textures.remove(config.spriteSheet.key + '-temp');
    game.textures.remove(config.spriteSheet.key);
    game.textures.remove(config.paletteKey);
}

function extractColorLookup(game, config, paletteWidth) {
    let colorLookup = {};
    for (let y = 0; y < config.paletteNames.length; y++) {
        let palette = config.paletteNames[y];
        colorLookup[palette] = [];
        for (let x = 0; x < paletteWidth; x++) {
            let pixel = game.textures.getPixel(x, y, config.paletteKey);
            colorLookup[palette].push(pixel);
        }
    }
    return colorLookup;
}

function manageCanvas(canvas, context, sheet) {
    context.clearRect(0, 0, sheet.width, sheet.height);
    context.drawImage(sheet, 0, 0);
}

function createAnimations(game, atlasKey, config) {
    for (let a = 0; a < config.animations.length; a++) {
        let anim = config.animations[a];
        let animKey = atlasKey + '-' + anim.key;
        if (!game.anims.exists(animKey)) {
            game.anims.create({
                key: animKey,
                frames: game.anims.generateFrameNumbers(atlasKey, {start: anim.startFrame, end: anim.endFrame}),
                frameRate: anim.frameRate,
                repeat: anim.repeat === undefined ? -1 : anim.repeat
            });
        }
    }
}

function replacePixels(pixelArray, paletteWidth, baseColors, newColors) {
    for (let p = 0; p < pixelArray.length; p += 4) {
        let [r, g, b, alpha] = [pixelArray[p], pixelArray[p+1], pixelArray[p+2], pixelArray[p+3]];
        if (alpha === 0) continue;

        for (let c = 0; c < paletteWidth; c++) {
            let oldColor = baseColors[c];
            let newColor = newColors[c];
            if (r === oldColor.r && g === oldColor.g && b === oldColor.b) {
                [pixelArray[p], pixelArray[p+1], pixelArray[p+2]] = [newColor.r, newColor.g, newColor.b];
                break; // Added a break to improve efficiency once a match is found
            }
        }
    }
}

