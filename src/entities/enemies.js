/**
 * Returns the smallest distance (delta) between 2 angles. If delta === 0, `a` and `b` are the same.
 * If delta < 0, `a` is to the right of `b`. If delta > 0, `a` is to the right of `b`. If
 * delta === 180 or delta === -180, `a` and `b` are opposite.
 * @param {number} a
 * @param {number} b
 * @returns {number}
 */
function angleDelta(a, b) {
    return -(((b - a + 180) % 360 - 360) % 360 + 180);
}

/**
 * A basic enemy that fires a machine gun at the player.
 * @class
 * @extends {Kepler.EntityBase}
 */
globalThis.GunnerEnemy = class extends Kepler.EntityBase {
    /** @type {Sprite} */
    #sprite;

    /** @type {Vector} */
    position;
    /** @type {number} */
    facingAngle;
    /** @type {CircleCollider} */
    collider;

    /** @type {number} */
    currentHealth;
    /** @type {number} */
    currentAmmo;
    /** @type {number} */
    shotTimer;
    /** @type {number} */
    reloadTimer;
    /** @type {boolean} */
    reloading;
    /** @type {boolean} */
    firing;

    /**
     * @param {number} x
     * @param {number} y
     */
    constructor(x, y) {
        super();
        this.displayLayer = -5;
        this.tags = [
            "enemy",
            "buff enemy target",
            "player weapon target"
        ];

        this.position = createVector(x, y);
        this.facingAngle = 0;
        this.currentAmmo = GUNNER_ENEMY_MAGAZINE_SIZE;
        this.shotTimer = 0;
        this.reloadTimer = 0;
        this.reloading = false;
        this.firing = false;
        this.collider = new CircleCollider(x, y, 50);
        this.currentHealth = GUNNER_ENEMY_MAX_HEALTH;

        this.#sprite = sprites.gunnerEnemy;
    }

    render() {
        this.#sprite.render(this.position, this.facingAngle + 90);
    }

    update(dt) {
        // aim at the player
        const angleToPlayer = p5.Vector.sub(this.position, player.position).heading();
        const angleBetween = angleDelta(this.facingAngle, angleToPlayer);

        // snap to the correct angle if we're close enough
        const angleStep = GUNNER_ENEMY_TURN_SPEED * dt;
        if (angleBetween < angleStep) {
            this.facingAngle = angleToPlayer;
        }
        else {
            this.facingAngle += (angleBetween < 0 ? angleStep : -angleStep);
        }

        // move toward or away from the player
        const distanceToPlayer = p5.Vector.sub(this.position, player.position).mag();
        if (distanceToPlayer < GUNNER_ENEMY_TARGET_DISTANCE - 50) {
            this.position.add(
                p5.Vector.fromAngle(radians(this.facingAngle), GUNNER_ENEMY_MOVE_SPEED * dt)
            );
        }
        else if (distanceToPlayer > GUNNER_ENEMY_TARGET_DISTANCE + 50) {
            this.position.add(
                p5.Vector.fromAngle(radians(this.facingAngle), -GUNNER_ENEMY_MOVE_SPEED * dt)
            );
        }
        
        this.collider.x = this.position.x;
        this.collider.y = this.position.y;

        // shoot
        if (this.firing) {
            this.shotTimer -= dt;
            if (this.shotTimer <= 0) {
                // spawn bullets slightly in front
                const bulletOrigin = p5.Vector.add(
                    p5.Vector.fromAngle(radians(this.facingAngle), 40), this.position
                )
                const bulletVelocity = p5.Vector.fromAngle(
                    radians(this.facingAngle), -GUNNER_ENEMY_BULLET_SPEED
                );
                Kepler.addEntity(new Bullet(
                    bulletOrigin, bulletVelocity, GUNNER_ENEMY_BULLET_RANGE,
                    GUNNER_ENEMY_BULLET_SIZE, GUNNER_ENEMY_BULLET_DAMAGE, true
                ));

                this.shotTimer = 1 / (GUNNER_ENEMY_RATE_OF_FIRE / 60);

                --this.currentAmmo;
                if (this.currentAmmo === 0) {
                    this.firing = false;
                    this.reloading = true;
                    this.reloadTimer = GUNNER_ENEMY_RELOAD_TIME;
                }
            }
        }
        // update reload timer
        else if (this.reloading) {
            this.reloadTimer -= dt;
            if (this.reloadTimer < 0) {
                this.reloading = false;
                this.currentAmmo = GUNNER_ENEMY_MAGAZINE_SIZE;
            }
        }
        // start firing if we're within range
        else if (distanceToPlayer < GUNNER_ENEMY_TARGET_DISTANCE + 50) {
            this.firing = true;
        }
    }

    /**
     * Called whenever the enemy is hit by a shot from the player's weapons.
     * @param {number} damage The amount of damage taken.
     */
    onBulletHit(damage) {
        console.log(`GunnerEnemy was hit for ${damage} damage`);
        this.currentHealth -= damage;
        if (this.currentHealth <= 0) {
            console.log("GunnerEnemy was killed.");
            this.markForRemove = true;
        }
    }
};

/**
 * A short-range enemy that dashes in and out with a shotgun. Currently WIP - do not use.
 * @class
 * @extends {Kepler.EntityBase}
 */
globalThis.ShotgunEnemy = class extends Kepler.EntityBase {

};

/**
 * A long-range enemy that plants itself into the ground and fires telegraphed sniper shots.
 * Currently WIP - do not use.
 * @class
 * @extends {Kepler.EntityBase}
 */
globalThis.SniperEnemy = class extends Kepler.EntityBase {

};

/**
 * A tank enemy that fires a mid-range area denial flamethrower. Currently WIP - do not use.
 * @class
 * @extends {Kepler.EntityBase}
 */
globalThis.PyroTankEnemy = class extends Kepler.EntityBase {

};

/**
 * A support enemy that does no damage but gives nearby enemies a shield or a damage boost.
 * Currently WIP - do not use.
 * @class
 * @extends {Kepler.EntityBase}
 */
globalThis.BuffEnemy = class extends Kepler.EntityBase {

};