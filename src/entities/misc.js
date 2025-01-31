// this file is for entities that don't fit into any other category
/**
 * A grid in the background to show movement.
 * @class
 */
// this is so freaking cursed i love it so much
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