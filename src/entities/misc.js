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

    /**
     * @param {Vector} position
     * @param {Vector} velocity
     */
    constructor(position, velocity) {
        super(); // this does literally nothing but is still required because javascript

        this.position = position.copy();
        this.velocity = velocity.copy();
    }

    update(dt) {
        this.position.add(p5.Vector.mult(this.velocity, dt))
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
    }
}