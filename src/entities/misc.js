// this file is for entities that don't fit into any other category
/**
 * A grid in the background to show movement.
 * @class
 * @extends {Kepler.EntityBase}
 */
// this is so cursed i love it so much
globalThis.BackgroundGrid = class extends Kepler.EntityBase {
    /** @type {number} */
    #width;
    /** @type {number} */
    #height;

    displayLayer = -100;

    /**
     * @param {number} bgWidth Width in squares. Squares are 300 pixels on a side.
     * @param {number} bgHeight Height in squares.
     */
    constructor(bgWidth, bgHeight) {
        super(); // this does literally nothing but is still required because javascript

        this.#width = bgWidth;
        this.#height = bgHeight;
    }

    render() {
        let colorToggle = true;

        noStroke();
        for (let x = 0; x < this.#width; ++x) {
            for (let y = 0; y < this.#height; ++y) {
                fill(colorToggle ? "#b0b0b0" : "#ffffff");

                rect(x * 300, y * 300, 300, 300);
                colorToggle = !colorToggle;
            }
            if (this.#height % 2 === 0) {
                colorToggle = !colorToggle;
            }
        }
    }
};

/**
 * A bullet fired from a projectile weapon.
 * @class
 * @extends {Kepler.EntityBase}
 */
globalThis.Bullet = class extends Kepler.EntityBase {
    /** @type {Vector} */
    position;
    /** @type {Vector} */
    startPos;
    /** @type {Vector} */
    velocity;
    /** @type {number} */
    maxRange;
    /** @type {CircleCollider} */
    collider;
    /** @type {number} */
    size;
    /** @type {boolean} */
    firedByEnemy;
    /** @type {number} */
    damage;

    displayLayer =  10;

    /**
     * @param {Vector} position
     * @param {Vector} velocity
     * @param {number} maxRange
     * @param {number} size Radius of the bullet's hitbox.
     * @param {number} damage How much damage the bullet deals.
     * @param {boolean} [firedByEnemy=false] Whether an enemy fired the bullet.
     */
    constructor(position, velocity, maxRange, size, damage, firedByEnemy=false) {
        super(); // this does literally nothing but is still required because javascript

        this.position = position.copy();
        this.startPos = position.copy(); // used for range checks
        this.velocity = velocity.copy();
        this.maxRange = maxRange;
        this.size = size;
        this.damage = damage;
        this.firedByEnemy = firedByEnemy;
        this.collider = new CircleCollider(position.x, position.y, size);
    }

    update(dt) {
        // apply delta time and move
        this.position.add(p5.Vector.mult(this.velocity, dt))
        this.collider.x = this.position.x;
        this.collider.y = this.position.y;

        // make sure we're not beyond the weapon's range
        if (this.position.dist(this.startPos) > this.maxRange) {
            // delete ourselves and sip the rest of the update
            this.markForRemove = true;
            return;
        }

        // check for collisions
        if (this.firedByEnemy) {
            if (this.collider.isColliding(player.collider)) {
                player.takeDamage(this.damage);
                // delete ourselves and skip the rest of the update
                this.markForRemove = true;
                return;
            }
        }
        else {
            const entities = Kepler.getTagged("player weapon target");
            for (const entity of entities) {
                if (this.collider.isColliding(entity.collider)) {
                    entity.onBulletHit(this.damage);
                    this.markForRemove = true;
                    return;
                }
            }
        }
    }

    render() {
        noStroke();
        fill("#000000");
        circle(this.position.x, this.position.y, this.size * 2);
    }
}

/**
 * Visual tracer for hitscan weapons.
 * @class
 * @extends {Kepler.EntityBase}
 */
globalThis.HitscanTracer = class extends Kepler.EntityBase {
    /** @type {Vector} */
    start;
    /** @type {Vector} */
    end;
    /**
     * How long until the tracer is removed, in seconds. Also determines opacity.
     * @type {number}
     */
    maxLifetime = 0.15;
    /** @type {number} */
    lifetime;

    displayLayer = 10;

    /**
     * @param {Vector} start
     * @param {Vector} end
     */
    constructor(start, end) {
        super();
        this.start = start.copy();
        this.end = end.copy();
        this.lifetime = this.maxLifetime;
    }

    update(dt) {
        this.lifetime -= dt;
        if (this.lifetime < 0) {
            this.markForRemove = true;
        }
    }

    render() {
        stroke(247, 153, 38, map(this.lifetime, 0, this.maxLifetime, 0, 255));
        strokeWeight(6);
        line(this.start.x, this.start.y, this.end.x, this.end.y);
    }
}

/**
 * A static target, mainly for debugging.
 * @class
 * @extends {Kepler.EntityBase}
 */
globalThis.StaticTarget = class extends Kepler.EntityBase {
    /** @type {Vector} */
    position;
    /** @type {CircleCollider} */
    collider;
    /** @type {number} */
    testIndex;
    
    displayLayer = -5;
    tags = ["player weapon target"];

    /**
     * @param {number} x
     * @param {number} y
     * @param {number} testIndex
     */
    constructor(x, y, testIndex) {
        super();
        this.position = createVector(x, y);
        this.collider = new CircleCollider(x, y, 50);
        this.testIndex = testIndex;
    }

    render() {
        const c1 = "#fb3232"
        const c2 = "#ffffff";
        let c = c1;

        noStroke();
        for (let d = 100; d > 0; d -= 20) {
            fill(c);
            circle(this.position.x, this.position.y, d);
            c = (c === c1 ? c2 : c1);
        }
    }

    onBulletHit() {
        console.log(`target ${this.testIndex} hit`);
    }
}