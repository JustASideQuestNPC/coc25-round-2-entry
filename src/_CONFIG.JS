/**
 * How long press-type inputs are considered "pressed" for, in seconds. This allows an action to be
 * performed even if the key for it is pressed a bit too early (for example, pressing the jump key
 * just before you hit the ground will still make you jump after you hit the ground). This can make
 * controls feel much better, assuming your code is set up to correctly use the buffer.
 * @type {number}
 */
// note: attaching a variable to "globalThis" allows it to be accessible in other files
globalThis.INPUT_BUFFER_DURATION = 0.15;

/**
 * Keybinds for all inputs.
 * @type {Object<string, string[]>}
 */
globalThis.KEYBINDS = {
    "move up": ["w", "ArrowUp"],
    "move down": ["s", "ArrowDown"],
    "move left": ["a", "ArrowLeft"],
    "move right": ["d", "ArrowRight"],
    "shoot": ["left mouse"]
};