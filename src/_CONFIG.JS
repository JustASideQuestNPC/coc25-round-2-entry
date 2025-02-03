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

/**
 * Configs for all weapons, organized by category and name.
 * @type {Object<string, Object[]>}
 */
globalThis.WEAPONS = {
    "pistols": [
        // starter gun
        {
            displayName: "Peashooter", // name shown in the ui
            description: "Doesn't actually shoot peas.", // description shown in the ui
            weaponType: "projectile", // "projectile", "hitscan", "explosive", or "special"
            fireMode: "full", // "semi" or "full"
            fireRate: 750, // rounds per minute
            burstRate: -1, // rounds per minute
            shotsPerBurst: 1,
            bulletsPerShot: 1,
            minSpread: 0, // degrees
            maxSpread: 10, // degrees
            spreadBloom: 2, // degrees
            spreadRecovery: 5, // degrees per second
            shotVelocity: 1200, // pixels per second
        }
    ],
    "autoRifles": [],
    "sniperRifles": [],
    "explosives": []
};