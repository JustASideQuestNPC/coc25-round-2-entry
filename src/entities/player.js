// the player is important enough to get its own file
/**
 * The player.
 * @class
 */
globalThis.Player = class extends Kepler.EntityBase {
    /** @type {Vector} */
    position;
    /** @type {Vector} */
    velocity;
    /** @type {number} */
    facingAngle;

    /**
     * @param {number} x
     * @param {number} y
     */
    constructor(x, y) {
        super(); // this does literally nothing but is still required because javascript

        // p5js really wants you to use createVector() over "new p5.Vector()"
        this.position = createVector(x, y);
        // calling createVector() with no parameters returns a zero vector
        this.velocity = createVector();

        this.facingAngle = 0;
    }

    update(dt) {
        // aim at the mouse
        // find the position of the mouse relative to the player
        this.facingAngle = Kepler.screenPosToWorldPos(mouseX, mouseY)
                                 .sub(this.position)
                                 .heading() + 90;

        // get movement input - doing it this way means that opposite keys cancel each other out
        let moveDir = createVector();
        if (Input.isActive("move left"))  { --moveDir.x; }
        if (Input.isActive("move right")) { ++moveDir.x; }
        if (Input.isActive("move up"))    { --moveDir.y; }
        if (Input.isActive("move down"))  { ++moveDir.y; }

        // normalize so diagonal movement isn't faster
        moveDir.normalize();

        // update velocity
        this.velocity.set(moveDir.mult(400));

        // apply delta time and move
        this.position.add(p5.Vector.mult(this.velocity, dt));

        // update the camera
        Kepler.setCameraTarget(this.position);
    }

    render() {
        push();
        // passing a vector translates to its x and y position
        translate(this.position)
        rotate(this.facingAngle);

        stroke("#304250");
        strokeWeight(6);
        fill("#33aaff");

        circle(0, 0, 60);
        line(0, 0, 0, -30);

        pop();
    }

    onAdd() {
        // snap the camera to our position at the start
        Kepler.setCameraPosition(this.position);
    }
}