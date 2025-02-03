/**
 * Kepler is NonPlayerCharacter's mildly questionable in-house game engine.
 */
// kepler needs to be defined on var for vscode to give us autocomplete, so we'll put it on
// globalThis at the end of the file
var Kepler = (function() {
    // predeclare just in case
    let Kepler;

    /**
     * Main entity list.
     * @type {EntityBase[]}
     */
    let entities = [];

    /**
     * Entities grouped into display layers - objects are passed by reference in JS, so these are
     * the same objects that are in the main list.
     * @type {Object<string, EntityBase[]>}
     */
    let displayLayers = {};

    /**
     * All active display layers.
     * @type {number[]}
     */
    let layerIndexes = [];

    /**
     * Time between the last two frames in seconds, without current time scale applied.
     * @type {number}
     */
    let deltaTimeRaw = 0;

    // camera variables - createVector() is preferred over "new PVector()" in modern p5js
    /** @type {Vector} */
    let cameraPos = createVector(width / 2, height / 2);
    /** @type {Vector} */
    let cameraTarget = cameraPos.copy();
    /** @type {number} */
    let renderX = 0;
    /** @type {number} */
    let renderY = 0;
    /** @type {number} */
    let minCameraX = -Infinity;
    /** @type {number} */
    let maxCameraX = Infinity;
    /** @type {number} */
    let minCameraY = -Infinity;
    /** @type {number} */
    let maxCameraY = Infinity;
    /** @type {[number, number, number, number]} */
    let viewportBounds = [-Infinity, -Infinity, Infinity, Infinity];

    // cameraZoom is public, but we're going to use a getter and a setter so we can auto-update the
    // viewport boundary whenever it changes
    /** @type {number} */
    let cameraZoom = 1;

    // Symbol() returns a unique object that is guaranteed to only ever be equal to itself
    const USES_SCREEN_SPACE_COORDS = Symbol("Kepler.USES_SCREEN_SPACE_COORDS");
    const USES_RAW_DELTA_TIME = Symbol("Kepler.USES_RAW_DELTA_TIME");

    /**
     * Alternate version of `dist()` that doesn't include a square root - this is useful when a
     * square root isn't necessary because square roots are slow for computers.
     * @param {number} x1
     * @param {number} y1
     * @param {number} x2
     * @param {number} y2
     * @returns {number}
     */
    function distSq(x1, y1, x2, y2) {
        return pow(x2 - x1, 2) + pow(y2 - y1, 2);
    }

    /**
     * Framerate-independent version of lerp() using delta time, used for updating the camera.
     * @param {number} a 
     * @param {number} b 
     * @param {number} t 
     * @returns {number}
     */
    function damp(a, b, t) {
        return lerp(a, b, 1 - exp(-t * deltaTimeRaw * Kepler.timeScale));
    }

    /**
     * Draws an entity to the canvas.
     * @param {EntityBase} entity 
     */
    function drawEntity(entity) {
        entity.render();
        
        // only draw the hitbox if the entity has one
        if (Kepler.SHOW_HITBOXES && typeof entity.bbox === "object") {
            noFill();
            stroke(255, 0, 0);
            strokeWeight(2);
            rect(
                entity.bbox.x + 1, entity.bbox.y + 1,
                entity.bbox.w - 2, entity.bbox.h - 2
            );
        }
        
        if (Kepler.SHOW_VELOCITY_VECTORS && entity.velocity instanceof p5.Vector) {
            // draw at the center of the bounding box if it exists, otherwise draw at the position
            let startX, startY;
            if (typeof entity.bbox === "object") {
                startX = entity.bbox.x + entity.bbox.w / 2;
                startY = entity.bbox.y + entity.bbox.h / 2;
            }
            else {
                startX = entity.position.x;
                startY = entity.position.y;
            }
            
            let endX = startX + entity.velocity.x / 10;
            let endY = startY + entity.velocity.y / 10;
            
            stroke(0, 255, 0);
            strokeWeight(2);
            line(startX, startY, endX, endY);
        }
    }

    class EntityBase {
        /**
         * Which display layer the entity is on. Entities on a higher display layer will always
         * be drawn on top of entities on a lower display layer, regardless of what order they
         * were added to the engine in. Display layers can be any number, including non-integers
         * and negative numbers.
         * @type {number}
         */
        displayLayer = 0;

        /**
         * All of the entity's tags (if it has any).
         * @type {any}
         */
        tags = [];
        
        /**
         * If true, the entity will be removed from the engine when the current update ends.
         * @type {boolean}
         */
        markForRemove = false;

        /**
         * Called when the entity is added to Kepler. Does nothing by default.
         */
        onAdd() {}

        /**
         * Called when the entity is removed. Does nothing by default.
         */
        onRemove() {}

        /**
         * Draws the entity to the canvas. Does nothing by default.
         */
        render() {}

        /**
         * Updates the entity. Does nothing by default.
         * @param {number} dt The current delta time in seconds.
         */
        update(dt) {}

        /**
         * Returns whether the entity has a certain tag. This method is final and should not be
         * overriden.
         * @param {any} tag
         * @returns {boolean}
         */
        hasTag(tag) {
            return this.tags.includes(tag);
        }
    }

    Kepler = {
        /**
         * If true, renders entity hitboxes as pink rectangles. Default: false
         * @type {boolean}
         */
        SHOW_HITBOXES: false,

        /**
         * If true, renders entity velocity vectors as green lines. Default: false
         * @type {boolean}
         */
        SHOW_VELOCITY_VECTORS: false,

        /**
         * Whether to use the camera. Setting this to true without also setting a camera position or
         * target can cause strange behavior. Default: false
         * @type {boolean}
         */
        cameraEnabled: false,

        /**
         * If true, the camera is always locked to the target regardless of the camera tightness.
         * Default: false
         * @type {boolean}
         */
        cameraLocked: false,

        /**
         * Determines how quickly the camera glides toward the target (if it isn't locked). Must be
         * greater than 0. Default: 5
         * @type {number}
         */
        cameraTightness: 5,

        /**
         * "Speed of time". Must be greater than 0. Default: 1
         * @type {number}
         */
        timeScale: 1,

        /**
         * How zoomed in (or out) the canvas is. Behaves the same as the `scale()` function.
         * Default: 1
         * @type {number}
         */
        get cameraZoom() { return cameraZoom; },
        set cameraZoom(value) {
            cameraZoom = value;
            minCameraX = viewportBounds[0] + width / 2 / cameraZoom;
            maxCameraX = viewportBounds[2] - width / 2 / cameraZoom;
            minCameraY = viewportBounds[1] + height / 2 / cameraZoom;
            maxCameraY = viewportBounds[3] - height / 2 / cameraZoom;
        },

        /**
         * Entities with the `USES_SCREEN_SPACE_COORDS` tag ignore the camera position when
         * rendering (i.e., (0, 0) is always the top left corner).
         * @type {Symbol}
         */
        USES_SCREEN_SPACE_COORDS: USES_SCREEN_SPACE_COORDS,
        /**
         * Entities with the `USES_RAW_DELTA_TIME` tag always have the "true" delta time passed to
         * their `update()` methods, regardless of the current time scale.
         * @type {Symbol}
         */
        USES_RAW_DELTA_TIME: USES_RAW_DELTA_TIME,

        /**
         * Returns the current delta time (time between the last two frames) in seconds, without the
         * current time scale applied.
         * @returns {number}
         */
        deltaTimeRaw() { return deltaTimeRaw; },

        /**
         * Returns the current delta time (time between the last two frames) in seconds, with the
         * current time scale applied.
         * @returns {number}
         */
        deltaTime() { return deltaTimeRaw * Kepler.timeScale; },

        /**
         * Returns the number of entities being updated.
         * @returns {number}
         */
        numEntities() { return entities.length; },

        /**
         * Returns the current position of the camera.
         */
        getCameraPosition() { return cameraPos.copy(); },

        /**
         * @overload
         * Sets the position of the camera. The camera will immediately be snapped here; use
         * `setCameraTarget()` to move it smoothly.
         * @param {number} x
         * @param {number} y
         * 
         * @overload
         * Sets the position of the camera. The camera will immediately be snapped here; use
         * `setCameraTarget()` to move it smoothly.
         * @param {Vector} vec
         */
        setCameraPosition(x, y) {
            // overload to pass coordinates as a vector
            if (x instanceof p5.Vector) {
                y = x.y;
                x = x.x;
            }

            cameraPos.set(
                constrain(x, minCameraX, maxCameraX),
                constrain(y, minCameraY, maxCameraY)
            );
            // also set the target to prevent the camera from flying away
            cameraTarget.set(cameraPos);
        },

        /**
         * Returns the current position of the camera.
         */
        getCameraTarget() { return cameraPos.copy(); },

        /**
         * @overload
         * Sets the camera target. The camera will move smoothly toward this position; use
         * `setCameraPosition()` to immediately move it.
         * @param {number} x
         * @param {number} y
         * 
         * @overload
         * Sets the camera target. The camera will move smoothly toward this position; use
         * `setCameraPosition()` to immediately move it.
         * @param {Vector} vec
         */
        setCameraTarget(x, y) {
            // overload to pass coordinates as a vector
            if (x instanceof p5.Vector) {
                y = x.y;
                x = x.x;
            }

            cameraTarget.set(
                constrain(x, minCameraX, maxCameraX),
                constrain(y, minCameraY, maxCameraY)
            );
        },

        /**
         * Returns the viewport (the area the camera can see) in the format
         * `[left, top, right, bottom]`.
         * @returns {[number, number, number, number]}
         */
        getViewportBounds() {
            return viewportBounds.slice();
        },

        /**
         * @overload
         * Sets the viewport (the area the camera can see).
         * @param {number} left Anything with an X coordinate less than this will not be visible.
         * @param {number} top Anything with a Y coordinate less than this will not be visible.
         * @param {number} right Anything with an X coordinate greater than this will not be
         *      visible.
         * @param {number} bottom Anything with a Y coordinate greater than this will not be
         *      visible.
         * 
         * @overload
         * Sets the viewport, which determines the area that the camera can see.
         * @param {number[]} bounds - All four bounds in the format `[left, top, right, bottom]`.
         */
        setViewportBounds(left, top, right, bottom) {
            // overload to pass all 4 bounds as an array
            if (Array.isArray(left)) {
                viewportBounds = left.slice();
            }
            else {
                viewportBounds = [left, top, right, bottom];
            }
            minCameraX = viewportBounds[0] + width / 2 / cameraZoom;
            maxCameraX = viewportBounds[2] - width / 2 / cameraZoom;
            minCameraY = viewportBounds[1] + height / 2 / cameraZoom;
            maxCameraY = viewportBounds[3] - height / 2 / cameraZoom;
        },

        /**
         * Adds an entity to the engine, then returns a reference to it (this is more useful than it
         * probably sounds).
         * @template {EntityBase} T
         * @param {T} entity
         * @param {boolean} [allowSetup=true] Whether to call the entity's `onAdd()` method.
         * @returns {T}
         */
        addEntity(entity, allowSetup=true) {
            if (allowSetup) {
                entity.onAdd(); // may or may not do something
            }

            entities.push(entity);

            // if a display layer already exists for the entity, just add it to that layer
            if (layerIndexes.includes(entity.displayLayer)) {
                displayLayers[entity.displayLayer].push(entity);
            }
            // otherwise, create a new display layer
            else {
                displayLayers[entity.displayLayer] = [entity];
                layerIndexes.push(entity.displayLayer);
                // make sure layers actually stay in order
                // "(a, b) => a - b" is es6 shorthand for "function(a, b) { return a - b; }"
                layerIndexes.sort((a, b) => a - b);
            }

            // return a reference to the entity so we can store it somewhere if we want
            return entity;
        },

        /**
         * Updates delta time, without updating any entities. Useful when the game is paused.
         */
        updateDtOnly() {
            // p5js delta time is in milliseconds
            deltaTimeRaw = deltaTime / 1000;
        },

        /**
         * Updates delta time and all entities. Should be called once per frame in draw().
         */
        update() {
            // p5js delta time is in milliseconds
            deltaTimeRaw = deltaTime / 1000;

            for (const entity of entities) {
                if (entity.hasTag(USES_RAW_DELTA_TIME)) {
                    entity.update(deltaTimeRaw);
                }
                else {
                    entity.update(deltaTimeRaw * Kepler.timeScale);
                }
            }

            // remove deleted entities
            Kepler.removeIf((e) => e.markForRemove);

            // update camera position
            if (Kepler.cameraEnabled) {
                cameraPos.x = constrain(cameraPos.x, minCameraX, maxCameraX);
                cameraPos.y = constrain(cameraPos.y, minCameraY, maxCameraY);
                cameraTarget.x = constrain(cameraTarget.x, minCameraX, maxCameraX);
                cameraTarget.y = constrain(cameraTarget.y, minCameraY, maxCameraY);

                let delta = distSq(cameraPos.x, cameraPos.y, cameraTarget.x, cameraTarget.y);

                if (Kepler.cameraLocked || delta < pow(0 / cameraZoom, 2)) {
                    cameraPos.set(cameraTarget);
                }
                else {
                    cameraPos.set(
                        damp(cameraPos.x, cameraTarget.x, Kepler.cameraTightness),
                        damp(cameraPos.y, cameraTarget.y, Kepler.cameraTightness)
                    );
                }
            }
        },

        /**
         * Draws all entities to the canvas.
         */
        render() {
            if (Kepler.cameraEnabled) {
                renderX = -floor(cameraPos.x - width / 2 / cameraZoom);
                renderY = -floor(cameraPos.y - height / 2 / cameraZoom);
        
                // like pushMatrix(), but also affects style commands (fill, stroke, etc.)
                push();
                scale(cameraZoom);
                translate(renderX, renderY);
                for (const i of layerIndexes) {
                    for (const entity of displayLayers[i]) {
                        if (entity.hasTag(USES_SCREEN_SPACE_COORDS)) {
                            translate(-renderX, -renderY);
                            scale(1 / cameraZoom);
        
                            push();
                            drawEntity(entity);
                            pop();
        
                            scale(cameraZoom);
                            translate(renderX, renderY);
                        }
                        else {
                            push();
                            drawEntity(entity);
                            pop();
                        }
                    }
                }
                pop();
            }
            else {
                for (const i of layerIndexes) {
                    for (const entity of displayLayers[i]) {
                        push();
                        drawEntity(entity);
                        pop();
                    }
                }
            }
        },

        /**
         * Removes all entities.
         * @param {boolean} [silent=true] If true, entities' `onRemove()` methods are not called.
         */
        removeAll(silent=true) {
            if (!silent) {
                for (const entity of entities) {
                    entity.onRemove();
                }
            }

            entities = [];
            displayLayers = {};
            layerIndexes = [];
        },

        /**
         * Removes all entities that a predicate function returns true for.
         * @param {(EntityBase)=>boolean} predicate
         * @param {boolean} [silent=false] - If true, entities' `onRemove()` methods are not called.
         */
        removeIf(predicate, silent=false) {
            // filter() removes entities that a predicate returns *false* for
            let filterFunction = (e) => !predicate(e);

            if (silent) {
                entities = entities.filter(filterFunction);
            }
            else {
                let filtered = [];
                for (const entity of entities) {
                    if (filterFunction(entity)) {
                        filtered.push(entity);
                    }
                    else {
                        entity.onRemove();
                    }
                }
                entities = filtered;
            }

            // also remove entities from display layers
            for (const i of layerIndexes) {
                displayLayers[i] = displayLayers[i].filter(filterFunction);
            }
        },

        /**
         * Removes all entities that have a certain tag.
         * @param {any} tag
         * @param {boolean} [silent=false] - If true, entities' `onRemove()` methods are not called.
         */
        removeTagged(tag, silent=false) {
            Kepler.removeIf((e) => e.hasTag(tag), silent);
        },

        /**
         * Returns an array containing references to all entities.
         * @returns {EntityBase[]}
         */
        getAll() {
            // shallow copy the array to prevent issues if it gets modified by something
            return entities.slice();
        },

        /**
         * Returns an array containing references to all entities that a predicate function returns
         * true for.
         * @param {(EntityBase)=>boolean} predicate
         * @returns {EntityBase[]}
         */
        getIf(predicate) {
            return entities.filter(predicate);
        },

        /**
         * Returns an array containing references to all entities with a certain tag
         * @param {any} tag
         * @returns {EntityBase[]}
         */
        getTagged(tag) {
            return Kepler.getIf((e) => e.hasTag(tag));
        },

        /**
         * @overload
         * Converts a position in screen space (relative to the top left corner of the canvas) to a
         * position in world space (relative to the camera).
         * @param {number} x
         * @param {number} y
         * @returns {Vector}
         * 
         * @overload
         * Converts a position in screen space (relative to the top left corner of the canvas) to a
         * position in world space (relative to the camera).
         * @public
         * @param {Vector} vec
         * @returns {Vector}
         */
        screenPosToWorldPos(x, y) {
            // overload to pass coordinates as a vector
            if (x instanceof p5.Vector) {
                y = x.y;
                x = x.y;
            }

            return createVector((x / cameraZoom) - renderX, (y / cameraZoom) - renderY);
        },

        /**
         * @overload
         * Converts a position in world space (relative to the camera) to a position in screen space
         * (relative to the top left corner of the canvas).
         * @param {number} x
         * @param {number} y
         * @returns {Vector}
         * 
         * @overload
         * Converts a position in world space (relative to the camera) to a position in screen space
         * (relative to the top left corner of the canvas).
         * @param {Vector} vec
         * @returns {Vector}
         */
        worldPosToScreenPos(x, y) {
            // overload to pass coordinates as a vector
            if (x instanceof p5.Vector) {
                y = x.y;
                x = x.x;
            }

            return createVector((x * cameraZoom) + renderX, (y * cameraZoom) + renderY);
        },

        /**
        * Base class that all entities should extend.
        * @class
        */
        EntityBase: EntityBase
    };

    return Kepler;
})();
// chuck Kepler into global scope
globalThis.Kepler = Kepler;