// this file is for entities that don't fit into any other category
/**
 * A grid in the background to show movement.
 * @class
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
 */
globalThis.Bullet = class extends Kepler.EntityBase {
    /** @type {Vector} */
    position;
    /** @type {Vector} */
    velocity;
    /** @type {PointCollider} */
    collider;

    displayLayer = -1;

    /**
     * @param {Vector} position
     * @param {Vector} velocity
     */
    constructor(position, velocity) {
        super(); // this does literally nothing but is still required because javascript

        this.position = position.copy();
        this.velocity = velocity.copy();
        this.collider = new PointCollider(position.x, position.y);
    }

    update(dt) {
        // apply delta time and move
        this.position.add(p5.Vector.mult(this.velocity, dt))
        this.collider.x = this.position.x;
        this.collider.y = this.position.y;

        // check for collisions
        const entities = Kepler.getTagged(EntityTag.IS_PLAYER_WEAPON_TARGET);
        for (const entity of entities) {
            if (this.collider.isColliding(entity.collider)) {
                entity.onBulletHit();
                // delete ourselves and skip the rest of the update
                this.markForRemove = true;
                return;
            }
        }
    }

    render() {
        noStroke();
        fill("#000000");
        circle(this.position.x, this.position.y, 8);
    }
}

/**
 * A static target, mainly for debugging.
 * @class
 */
globalThis.StaticTarget = class extends Kepler.EntityBase {
    /** @type {number} */
    x;
    /** @type {number} */
    y;
    /** @type {CircleCollider} */
    collider;
    
    displayLayer = -5;
    tags = [
        EntityTag.IS_PLAYER_WEAPON_TARGET
    ];

    /**
     * @param {number} x
     * @param {number} y
     */
    constructor(x, y) {
        super();
        this.x = x;
        this.y = y;
        this.collider = new CircleCollider(x, y, 50);
    }

    render() {
        const c1 = "#fb3232"
        const c2 = "#ffffff";
        let c = c1;

        noStroke();
        for (let d = 100; d > 0; d -= 20) {
            fill(c);
            circle(this.x, this.y, d);
            c = (c === c1 ? c2 : c1);
        }
    }

    onBulletHit() {
        console.log("static target hit");
    }
}