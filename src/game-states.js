/**
 * Manages game states.
 */
globalThis.GameState = (function() {
    /**
     * Functions for each game state
     * @type {Object<string, ()=>void>}
     */
    const GAME_STATE_FUNCTIONS = {
        "gameplay": () => {
            Input.update();
            Kepler.update();

            background("#ffffff");
            Kepler.render();
        },
    };

    /**
     * Internal variable for the current game state.
     * @type {string}
     */
    let _currentState = "none";

    return {
        runState() {
            // error checking
            if (typeof GAME_STATE_FUNCTIONS[_currentState] === undefined) {
                throw new TypeError(
                    `The game state "${_currentState}" does not have an associated function!`
                )
            }
            GAME_STATE_FUNCTIONS[_currentState]();
        },

        /**
         * Transitions to a new game state.
         * @param {string} newState
         */
        changeState(newState) {
            // error checking
            if (!Object.hasOwn(GAME_STATE_FUNCTIONS, newState)) {
                throw new TypeError(`"${newState}" is not a valid game state!`);
            }

            _currentState = newState;
        },

        /**
         * The current game state. Read-only.
         * @type {string}
         */
        get currentState() { return _currentState; },
        set currentState(x) {
            throw new TypeError("GameState.currentState is read-only!");
        }
    };
})();