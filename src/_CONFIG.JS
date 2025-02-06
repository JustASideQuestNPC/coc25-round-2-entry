// SO MANY CONFIG VARIABLES
// Note: When measuring distance, a "unit" is equal to one pixel when the camera is not zoomed in or
// out. The camera is zoomed out a little here because the sprites are pretty big, so a unit is
// between 1/2 and 3/4 of a pixel depending on what I have the zoom set to right now.

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
 * How much health the player spawns with.
 * @type {number}
 */
globalThis.PLAYER_MAX_HEALTH = 100;

/**
 * Keybinds for all inputs.
 * @type {Object<string, string[]>}
 */
globalThis.KEYBINDS = {
    "move up": ["w", "ArrowUp"],
    "move down": ["s", "ArrowDown"],
    "move left": ["a", "ArrowLeft"],
    "move right": ["d", "ArrowRight"],
    "shoot": ["left mouse"],
    "reload": ["r"]
};

/**
 * Configs for all weapons, organized by category and name.
 * @type {Object<string, Object[]>}
 */
globalThis.WEAPONS = {
    "pistols": [
        // starter gun
        {
            name: "Peashooter", // name shown in the ui
            description: (
                "Doesn't actually shoot peas." // description shown in the ui
            ),
            weaponType: "hitscan",
            fireMode: "full", // "semi" or "full"
            fireRate: 450, // rounds per minute
            burstRate: -1, // rounds per minute
            shotsPerBurst: 1,
            bulletsPerShot: 1,
            minSpread: 0, // degrees
            maxSpread: 10, // degrees
            spreadBloom: 2, // degrees
            spreadRecovery: 5, // degrees per second
            magazineSize: 10,
            reloadDuration: 1.5,
            maxRange: 750, // units
        },
        // secret pistol
        {
            name: "Marksman",
            description: (
                "Infinite ammunition with low damage and rate of fire. Tap reload to throw a " + 
                "coin, then shoot it for a +RICOSHOT that deals increased damage."
            ),
            weaponType: "special",
            className: "CoinRevolver"
        }
    ],
    "autoRifles": [
        // secret auto rifle
        {
            name: "Plasma Rifle",
            description: (
                "High rate of fire that ramps up even higher while firing. Bottomless magazine, " +
                "but watch out for overheating!"
            ),
            weaponType: "special",
            className: "PlasmaRife"
        }
    ],
    "shotguns": [
        // secret shotgun
        {
            name: "Lucifer's Bane",
            description: (
                "Hellishly high damage with an equally high spread. Fires both barrels at once."
            ),
            weaponType: "special",
            className: "SuperShotgun"
        }
    ],
    "sniperRifles": [
        // secret sniper
        {
            name: "Aspect of Zagreus",
            description: (
                "Fully automatic with below-average stats. After manually reloading, the first " +
                "shot has increased range, perfect accuracy, and deals massive damage."
            ),
            weaponType: "special",
            className: "HadesGun"
        }
    ],
    "explosives": [
        // secret explosive
        {
            name: "Sidewinder SMR",
            description: (
                "Rapidly fires micro-missiles."
            ),
            weaponType: "special",
            className: "RocketSMG"
        }
    ]
};