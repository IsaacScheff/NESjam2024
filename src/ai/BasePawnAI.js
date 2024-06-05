export default class BasePawnAI {
    constructor(scene, sprite, options) {
        this.scene = scene;
        this.sprite = sprite;
        this.minX = options.minX;
        this.maxX = options.maxX;
        this.velocity = options.velocity;
        this.jumpChance = options.jumpChance;
        this.direction = 1;  // 1 for right, -1 for left

        this.sprite.setGravityY(300);
    }

    update() {
        // Check for boundary collision and reverse direction if necessary
        if (this.sprite.x <= this.minX && this.direction === -1) {
            this.direction = 1;  // Change direction to right
        } else if (this.sprite.x >= this.maxX && this.direction === 1) {
            this.direction = -1;  // Change direction to left
        }

        // Apply velocity based on direction
        this.sprite.setVelocityX(this.velocity * this.direction);

        // Random chance to jump
        if (Math.random() < this.jumpChance && this.sprite.body.touching.down) {
            const jumpV = -200;
            this.sprite.setVelocityY(jumpV);  // Adjust jump strength as needed
        }
    }
}
