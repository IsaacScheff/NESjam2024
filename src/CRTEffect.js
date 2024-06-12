export default function CRTEffect(scene) {
    scene.bmd = scene.add.graphics({ x: 0, y: 0, fillStyle: { color: 0x000000, alpha: 0.1} });
    scene.bmd.setDepth(100);
    for (let x = 0; x < scene.sys.game.config.width; x += 2) {
        scene.bmd.fillRect(x, 0, 1, scene.sys.game.config.height);
    }

    scene.tint = scene.add.graphics({ x: 0, y: 0, fillStyle: { color: 0xffcc99, alpha: 0.04 } }); // Soft warm tint
    scene.tint.fillRect(0, 0, scene.sys.game.config.width, scene.sys.game.config.height);
    scene.tint.setDepth(101);

    scene.time.addEvent({
        delay: 100, // milliseconds
        callback: () => {
            const newAlpha = Phaser.Math.FloatBetween(0.2, 0.5); // Random flicker intensity
            scene.bmd.alpha = newAlpha;
        },
        loop: true
    });

    scene.noise = scene.add.tileSprite(0, 0, scene.sys.game.config.width, scene.sys.game.config.height, 'noiseTexture');
    scene.noise.setOrigin(0, 0);  // Set origin to the top-left
    scene.noise.setDepth(102);
    scene.noise.alpha = 0.05;
    
}