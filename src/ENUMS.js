// this file is for enums, which are collections of discrete values. they're useful if you want to
// limit a variable to only a few possible values.
/**
 * All possible entity tags, except the Kepler-specific tags (`Kepler.USES_SCREEN_SPACE_COORDS` and
 * `Kepler.USES_RAW_DELTA_TIME`).
 * @readonly
 * @enum {Symbol}
 */
globalThis.EntityTag = {
    // note: Symbol() is an es6 function that returns an object that is guaranteed to only ever be
    // equal to itself
    /**
     * Entities with this tag can be hit by bullets, raycasts, and explosions from the player's
     * weapons. An entity with this tag must have a collider and an `onBulletHit()` method.
     */
    IS_PLAYER_WEAPON_TARGET: Symbol("EntityTag.IS_PLAYER_WEAPON_TARGET"),
};