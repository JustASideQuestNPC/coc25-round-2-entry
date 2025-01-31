/**
 * Runs once when the program starts.
 */
function setup() {
    // weird funky html stuff - createCanvas() returns a reference to the canvas, but its a
    // p5.Element instance and we need an HTMLElement instance so we can add event listeners to it
    const c = createCanvas(600, 600);
    const canvas = document.getElementById(c.id());

    // the reason we do this is because there's a bug with p5js that causes mouseButton to be
    // incorrect if you hold both buttons at the same time
    canvas.addEventListener("mousedown", _mousePressed);
    canvas.addEventListener("mouseup", _mouseReleased);

    // disable the right-click menu
    canvas.addEventListener("contextmenu", (e) => { e.preventDefault() });

    // unlike on KA, the default angle mode in p5js is degrees
    angleMode(DEGREES);

    // set up input actions
    for (const [bindName, bindKeys] of Object.entries(KEYBINDS)) {
        // having two keybinds for shooting makes some things easier
        if (bindName === "shoot") {
            Input.addAction({
                name: "shoot semi",
                keys: bindKeys,
                type: "press"
            });
            Input.addAction({
                name: "shoot auto",
                keys: bindKeys,
                type: "hold"
            });
        }
        else {
            Input.addAction({
                name: bindName,
                keys: bindKeys
            });
        }
    }

    // add entities - eventually this will be done procedurally, but for now i'm just hard-coding it
    Kepler.addEntity(new BackgroundGrid(4, 4));
    Kepler.addEntity(new Player(300, 300));

    // set up some camera stuff
    Kepler.cameraEnabled = true;
    Kepler.setViewportBounds(0, 0, 1200, 1200);
}

/**
 * Runs once per frame, just like in the original PJS.
 */
function draw() {
    Input.update();
    Kepler.update();

    background("#ffffff");
    Kepler.render();
}

/**
 * Called once when a key is initially pressed.
 * @param {KeyboardEvent} e
 */
function keyPressed(e) {
    // we don't use the p5js-specific "key" variable because it doesn't update for things like
    // shift or the arrow keys
    Input.keyPressed(e.key);
}

/**
 * Called once when a key is initially pressed.
 * @param {KeyboardEvent} e
 */
function keyReleased(e) {
    Input.keyReleased(e.key);
}

// we put underscores here because we don't want them to become the p5 functions - we're going to
// add them ourselves to avoid a p5js-specific bug
/**
 * Called once when the mouse is initially pressed.
 * @param {MouseEvent} e
 */
function _mousePressed(e) {
    Input.mousePressed(e.button);
}

/**
 * Called once when the mouse is initially released.
 * @param {MouseEvent} e
 */
function _mouseReleased(e) {
    Input.mouseReleased(e.button);
}