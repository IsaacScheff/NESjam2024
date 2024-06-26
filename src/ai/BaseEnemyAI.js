export default class BaseEnemyAI {
    constructor(scene, sprite, options) {
        this.scene = scene;
        this.sprite = sprite;
        this.minX = options.minX;
        this.maxX = options.maxX;
        this.velocity = options.velocity;
        this.jumpChance = options.jumpChance;
        this.behaviorType = options.behaviorType || 'normal';
        this.direction = 1;  // 1 for right, -1 for left

        this.attackCooldown = 1000; // 1 second cooldown
        this.lastAttackTime = 0; 

        this.sprite.setGravityY(300);
    }

    update() {
        // Check for boundary collision and reverse direction if necessary
        if (this.sprite.x <= this.minX && this.direction === -1) {
            this.direction = 1;  
        } else if (this.sprite.x >= this.maxX && this.direction === 1) {
            this.direction = -1; 
        }

        // Apply velocity based on direction
        this.sprite.setVelocityX(this.velocity * this.direction);

        this.sprite.flipX = this.direction === -1; //face direction of movement

        if (this.behaviorType === 'knight') {
            // Knight always jumps when it lands
            if (this.sprite.body.touching.down) {
                this.sprite.setVelocityY(-240); // Knight's jump higher

                if (Math.random() < 0.5) { // Randomly change direction
                    this.direction *= -1; 
                }
            }
        } else {
            // Normal behavior for non-knight pieces
            if (Math.random() < this.jumpChance && this.sprite.body.touching.down) {
                this.sprite.setVelocityY(-200); 
            }
        }

        if (!this.sprite.active || !this.sprite.visible) {
            return;
        }

        if (this.behaviorType === 'rook' && this.scene.time.now > this.lastAttackTime + this.attackCooldown) { //or queen?
            this.lastAttackTime = this.scene.time.now;
            let projectile = this.scene.createPyroRookProjectile(this.sprite);
            let velocityX = this.direction * 200; // Shoot in facing direction
            let velocityY = -50; // Slight arc
            projectile.setVelocity(velocityX, velocityY);
        }
    }
}
