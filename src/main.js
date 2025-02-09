// all the global variables that don't fit into another file
/**
 * Class instances for every weapon.
 * @type {Object<string, WeaponBase[]>}
 */
globalThis.weapons = {};

/**
 * Class instances for all sprites.
 * @type {Object<string, Sprite>}
 */
globalThis.sprites = {};

/**
 * Global reference to the player.
 * @type {Player}
 */
globalThis.player;

/**
 * Functions for running each game state.
 * @type {Object<string, ()=>void>}
 */
globalThis.gameStateFunctions;

/**
 * Whether async loading is complete. If this is false, lots of things are probably undefined!
 * @type {boolean}
 */
let asyncLoadingComplete = false;

/**
 * Async function for loading everything.
 */
async function asyncPreload() {
    // promises are complicated and even i don't fully understand how to use them, but the important
    // part is that the code inside them runs at the same time as everything else (kinda)
    console.log("Started async loading...");
    // for performance timing
    const asyncLoadStart = window.performance.now();

    // start loading sprites
    const loadSprites = new Promise((resolve) => {
        // for performance timing
        const loadStart = window.performance.now();

        for (const [spriteName, spriteData] of Object.entries(SPRITE_DATA)) {
            sprites[spriteName] = new Sprite(spriteData);
        }

        console.log(`Async loaded sprites in ${window.performance.now() - loadStart}ms`);

        // end the promise
        resolve();
    });

    // start loading weapons - in practice, this is fast enough that we could do it without a
    // promise and not have any issues, but we're already using a promise for the sprites (which
    // *are* slow enough to potentially be an issue) and using one for weapons probably makes me
    // look smarter or something
    const loadWeapons = new Promise((resolve) => {
        // for performance timing
        const loadStart = window.performance.now();

        for (const [category, configList] of Object.entries(WEAPONS)) {
            let instances = [];
            for (const weaponConfig of configList) {
                switch (weaponConfig.weaponType) {
                    case "projectile":
                        instances.push(new ProjectileWeapon(weaponConfig));
                        break;
                    case "hitscan":
                        instances.push(new HitscanWeapon(weaponConfig));
                        break;
                }
            }
            weapons[category] = instances;
        }

        console.log(`Async loaded weapons in ${window.performance.now() - loadStart}ms`);

        // end the promise
        resolve();
    });

    // start generating inputs
    const loadInputs = new Promise((resolve) => {
        // for performance timing
        const loadStart = window.performance.now();

        /**
         * Which actions should be press-type actions.
         * @type {string[]}
         */
        const pressActions = ["reload"];

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
                    keys: bindKeys,
                    type: pressActions.includes(bindName) ? "press" : "hold"
                });
            }
        }

        console.log(`Async loaded inputs in ${window.performance.now() - loadStart}ms`);

        // end the promise
        resolve();
    });

    // now that we've spawned each promises, we wait for them to both finish - this will stop the
    // code in this function from running, but the code outside of it will still keep going
    await loadSprites;
    await loadWeapons;
    await loadInputs;

    // set a flag to show that everything is loaded and safe to use
    asyncLoadingComplete = true;

    console.log(`Finished async loading in ${window.performance.now() - asyncLoadStart}ms`);
}

/**
 * Runs once when the program starts.
 */
function setup() {
    // weird funky html stuff - createCanvas() returns a reference to the canvas, but it's a
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

    // start loading everything - right now this has no effect because we're launching straight into
    // gameplay, but eventually we'll be able to immediately start drawing logos and/or menus while
    // everything else loads
    asyncPreload();

    // debug toggles
    Kepler.SHOW_HITBOXES = false;

    // set up some camera stuff
    Kepler.cameraEnabled = true;
    Kepler.setViewportBounds(0, 0, 1500, 1500);

    // add entities - eventually this will be done procedurally, but for now i'm just hard-coding it
    Kepler.addEntity(new BackgroundGrid(4, 4));

    // Kepler.addEntity() returns a reference to the entity, so we can store things like the player
    // in a variable for easy access.
    player = Kepler.addEntity(new Player(250, 100));
    
    Kepler.addEntity(new BuffEnemy(500, 550, "speed"));
    Kepler.addEntity(new BuffEnemy(1000, 550, "shield"));
    Kepler.addEntity(new GunnerEnemy(1000, 550));

    Kepler.cameraZoom = 0.75;

    GameState.changeState("gameplay");
}

/**
 * Runs once per frame, just like in the original PJS.
 */
function draw() {
    // display a loading screen if async loading still isn't finished for some reason
    if (!asyncLoadingComplete) {
        // eventually we'll need to put an actual graphic here, but for now i'm just throwing up a
        // black screen because people probably won't ever see this
        background("#000000");
        // skip the rest of draw()
        return;
    }

    GameState.runState();
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