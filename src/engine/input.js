/**
 * An action-based system for managing user input.
 */
var Input = (function() {
    /**
     * @typedef {Object} InputAction - A single input action.
     * @property {string[]} keys - Which keyboard keys and/or mouse buttons can activate the action.
     * @property {boolean} active - Whether the action is currently active (pressed).
     * @property {boolean} wasActive - Only used by press actions.
     * @property {number} bufferDuration - Only used by press actions.
     * @property {()=>void} update - Updates the action.
     */

    /**
     * Holds whether each keyboard key or mouse button is currently pressed.
     * @type {Object<string, boolean>}
     */
    const keyStates = {};

    /**
     * All currently managed actions.
     * @private
     * @type {Object<string, InputAction>}
     */
    const actions = {};

    const Input = {
        /**
         * Updates all actions. Should be called once per frame in `draw()`.
         */
        update() {
            for (const name in actions) { actions[name].update(); }
        },

        /**
         * Updates the internal state. Should be called once in `keyPressed()`.
         * @param {string} keyStr Should be `e.key`.
         */
        keyPressed(keyStr) {
            keyStates[keyStr.toLowerCase()] = true;
        },

        /**
         * Updates the internal state. Should be called once in `keyReleased()`.
         * @param {string} keyStr Should be `e.key`.
         */
        keyReleased(keyStr) {
            keyStates[keyStr.toLowerCase()] = false;
        },

        /**
         * Updates the internal state. Should be called once in `mousePressed()` (technically
         * `_mousePressed()`).
         * @param {number} button Should be `e.button`.
         */
        mousePressed(button) {
            // MouseEvent.button is a number so we have to do some conversions
            if (button === 0) {
                keyStates["left mouse"] = true;
                keyStates["left click"] = true;
            }
            else if (button === 1) {
                keyStates["middle mouse"] = true;
                keyStates["middle click"] = true;
            }
            else if (button === 2) {
                keyStates["right mouse"] = true;
                keyStates["right click"] = true;
            }
        },

        /**
         * Updates the internal state. Should be called once in `mouseReleased()` (technically
         * `_mouseReleased()`).
         * @param {number} button Should be `e.button`.
         */
        mouseReleased(button) {
            // MouseEvent.button is a number so we have to do some conversions
            if (button === 0) {
                keyStates["left mouse"] = false;
                keyStates["left click"] = false;
            }
            else if (button === 1) {
                keyStates["middle mouse"] = false;
                keyStates["middle click"] = false;
            }
            else if (button === 2) {
                keyStates["right mouse"] = false;
                keyStates["right click"] = false;
            }
        },

        /**
         * Adds an action to the manager.
         * @param {Object} args - Configuration object for the action.
         * @param {string} args.name - The name of the action.
         * @param {string[]} args.keys - Which keyboard keys and/or mouse buttons can activate the
         *      action.
         * @param {"hold"|"press"} [type="hold"] - Determines how the action activates. A hold
         *      action is active whenever any of the keys or buttons bound to it are pressed. A
         *      press action is active for a single frame when any of the keys or buttons bound to
         *      it are initially pressed.
         */
        addAction({name, keys, type="hold"}) {
            // quick check if the action already exists - this won't crash anything, but it's
            // probably not something you want to happen
            if (Object.hasOwn(actions, name)) {
                console.warn(
                    `[Input] The action "${name}" already exists, did you mean to overwrite it?`
                );
            }

            // setup common properties - both types of action have these
            /** @type {InputAction} */
            let action = {
                active: false,
                keys: keys.map((k) => k.toLowerCase())
            };

            // set update method based on type
            if (type === "hold") {
                action.update = () => {
                    // "some()" returns whether a predicate returns true for any item in an array
                    action.active = action.keys.some((k) => keyStates[k]);
                };
            }
            else {
                // add press-action-specific properties
                action.wasActive = false;
                action.bufferDuration = 0;
                action.update = () => {
                    if (action.keys.some((k) => keyStates[k])) {
                        // if there's buffer time remaining, keep the action active
                        if (action.bufferDuration > 0) {
                            // buffer duration is stored in seconds, but the p5 deltaTime variable
                            // is in milliseconds
                            action.bufferDuration -= deltaTime / 1000;
                            action.active = true;
                        }
                        // if the buffer has run out, deactivate the action
                        else if (action.wasActive) {
                            action.active = false;
                        }
                        // if this is the first frame that the key was pressed, reset the buffer and
                        // make the action active
                        else {
                            action.active = true;
                            action.wasActive = true;
                            action.bufferDuration = INPUT_BUFFER_DURATION;
                        }
                    }
                    else {
                        action.wasActive = false;
                        action.active = false;
                    }
                };
            }

            actions[name] = action;
        },

        /**
         * Returns whether an action is active.
         * @param {string} name - The name of the action.
         * @param {boolean} [clearBuffer=true] - Whether to deactivate the action if it is active.
         *      Only applies to press actions.
         * @returns {boolean}
         */
        isActive(name, clearBuffer=true) {
            const action = actions[name];
            // deactivate press actions to prevent the buffer
            // from activating them multiple times
            if (action.active && action.bufferDuration > 0 && clearBuffer) {
                action.active = false;
                action.bufferDuration = 0;
                return true;
            }
            return action.active;
        },

        /**
         * Deactivates all actions and clears any buffers.
         */
        clearBuffers() {
            for (const name in actions) {
                actions[name].active = false;
                if (actions[name].bufferDuration !== undefined) {
                    actions[name].bufferDuration = 0;
                }
            }
        }
    };
    return Input;
})();

// chuck input into global scope
globalThis.Input = Input;