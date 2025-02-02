/**
 * @typedef {Object} SpriteData
 * @property {number} width
 * @property {number} height
 * @property {[number, number]} origin The point the sprite rotates around, relative to the top left
 *      corner of the image.
 * @property {(Graphics)=>void} draw Function that draws the sprite. The sprite should be translated
 *      so that (0, 0) is at the point it rotates around, and all p5js functions should be called on
 *      the object passed to this function.
 */

/**
 * A pre-rendered image sprite.
 */
globalThis.Sprite = class {
    /**
     * The pre-rendered image.
     * @type {Graphics}
     */
    #image;

    /**
     * The point the sprite rotates around.
     * @type {[number, number]}
     */
    #origin;

    /**
     * @param {SpriteData} args
     */
    constructor({ width, height, origin, draw: drawSprite }) {
        this.#origin = origin.slice();

        // initialize the image - we're actually using a Graphics object and not an Image object,
        // but the image() function will accept both
        this.#image = createGraphics(width, height);
        // translate to the origin so the image is positioned correctly
        this.#image.push();
        this.#image.translate(origin[0], origin[1]);

        // render the sprite onto the image - this is why we pass an object into this function
        drawSprite(this.#image);

        this.#image.pop();
    }

    /**
     * @overload
     * Draws the sprite to the canvas.
     * @param {number} x
     * @param {number} y
     * @param {number} [angle=0]
     * 
     * @overload
     * Draws the sprite to the canvas.
     * @param {Vector} pos
     * @param {number} [angle=0]
     */
    render(x, y=0, angle=0) {
        // overload to pass x and y as a vector
        if (x instanceof p5.Vector) {
            angle = y;
            y = x.y;
            x = x.x;
        }

        push();
        translate(x, y);
        rotate(angle);

        // offset to account for the origin
        image(this.#image, -this.#origin[0], -this.#origin[1]);

        pop()
    }
};