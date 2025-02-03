/**
 * This file is for the classes that are shared by multiple weapons.
 */

/**
 * Abstract base class that all weapon classes should extend.
 * @class
 */
globalThis.WeaponBase = class {
    /** @type {"semi"|"full"} */
    fireMode;

    /** @type {number} */
    shotsPerBurst;

    /**
     * Time between each shot in a burst, in seconds.
     * @type {number}
     */
    shotDelay;

    /**
     * Time between each burst in seconds.
     * @type {number}
     */
    burstDelay;

    /**
     * How many bullets or hitscans are fired per shot. Use this for shotguns.
     * @type {number}
     */
    bulletsPerShot;

    /**
     * Minimum spread angle in degrees.
     * @type {number}
     */
    minSpread;

    /**
     * Maximum spread angle in degrees.
     * @type {number}
     */
    maxSpread;

    /**
     * How much the spread angle increases by when a shot is fired, in degrees.
     * @type {number}
     */
    spreadBloom;

    /**
     * How quickly the spread angle decreases when not firing, in degrees per second.
     * @type {number}
     */
    spreadRecovery;

    /**
     * Whether the weapon is currently firing a burst.
     * @type {boolean}
     */
    firingBurst;

    /**
     * Remaining delay between bursts.
     * @type {number}
     */
    burstTimer;

    /**
     * Remaining delay between shots in a burst.
     * @type {number}
     */
    shotTimer;

    /**
     * How many shots are left in the current burst.
     * @type {number}
     */
    burstShotsRemaining;

    /**
     * Current spread angle.
     * @type {number}
     */
    spreadAngle;

    /**
     * @param {Object} args
     * @param {"semi"|"full"} args.fireMode Semi-auto: Fires one shot per trigger pull. Full-auto:
     *      continuously fires as long as the trigger is held down.
     * @param {number} args.fireRate How quickly bursts are fired, in rounds per minute.
     * @param {number} args.burstRate How quickly shots are fired within a burst, in rounds per
     *      minute.
     * @param {number} args.shotsPerBurst How many shots are fired per burst. Use this for
     *      burst-fire weapons.
     * @param {number} args.bulletsPerShot How many bullets or hitscans are fired per shot. Use this
     *      for shotguns.
     * @param {number} args.minSpread Minimum spread angle in degrees.
     * @param {number} args.maxSpread Maximum spread angle in degrees.
     * @param {number} args.spreadBloom How much the spread angle increases by when a shot is fired,
     *      in degrees.
     * @param {number} args.spreadRecovery How quickly the spread angle decreases when not firing,
     *      in degrees per second.
     */
    constructor({ fireMode, fireRate, burstRate, shotsPerBurst, bulletsPerShot, minSpread,
                  maxSpread, spreadBloom, spreadRecovery }) {
        this.fireMode = fireMode;
        this.shotsPerBurst = shotsPerBurst;
        this.bulletsPerShot = bulletsPerShot;
        this.minSpread = minSpread;
        this.maxSpread = maxSpread;
        this.spreadBloom = spreadBloom;
        this.spreadRecovery = spreadRecovery;
        
        // rounds per minute is easier to visualize, but seconds per round makes the math easier
        this.burstDelay = 1 / (fireRate / 60);
        this.shotDelay = 1 / (burstRate / 60);

        // setup internal stuff
        this.firingBurst = false;
        this.burstTimer = 0;
        this.shotTimer = 0;
        this.burstShotsRemaining = 0;
        this.spreadAngle = minSpread;
    }

    /**
     * Called once when the shoot button is initially pressed.
     */
    semiAutoFire() {
        // never do anything if this is a full-auto weapon
        if (this.fireMode !== "semi") { return; }

        // make sure we're not already firing, and we're not waiting for a delay to timeout
        if (!this.firingBurst && this.burstTimer <= 0) {
            this.firingBurst = true;
            this.burstShotsRemaining = this.shotsPerBurst;

            // ensures we fire on the next update
            this.shotTimer = 0;
        }
    }

    /**
     * Called once per frame while the shoot button is held down.
     */
    fullAutoFire() {
        // never do anything if this is a semi-auto weapon
        if (this.fireMode !== "full") { return; }

        // make sure we're not already firing, and we're not waiting for a delay to timeout
        if (!this.firingBurst && this.burstTimer <= 0) {
            this.firingBurst = true;
            this.burstShotsRemaining = this.shotsPerBurst;

            // ensures we fire on the next update
            this.shotTimer = 0;
        }
    }

    /**
     * Called once per frame, every frame.
     * @param {number} dt The time between the last two updates, in seconds.
     * @param {number} aimAngle What angle (approximately) to shoot at.
     * @param {Vector} origin What position to shoot from.
     */
    constantUpdate(dt, aimAngle, origin) {
        let applySpreadRecovery = true;

        if (this.firingBurst) {
            // fire bullets if we can
            if (this.shotTimer <= 0) {
                // find which angles to fire bullets at
                let minAngle = aimAngle - this.spreadAngle / 2;
                let maxAngle = aimAngle + this.spreadAngle / 2;

                for (let i = 0; i < this.bulletsPerShot; ++i) {
                    this.fire(random(minAngle, maxAngle), origin);
                }
                // only apply spread bloom once
                this.spreadAngle += this.spreadBloom;
                applySpreadRecovery = false;

                // continue or end the burst
                --this.burstShotsRemaining;
                if (this.burstShotsRemaining > 0) {
                    this.shotTimer = this.shotDelay;
                }
                else {
                    this.burstTimer = this.burstDelay;
                    this.firingBurst = false;
                }
            }
            // otherwise, update the delay
            else {
                this.shotTimer -= dt;
            }
        }
        else {
            this.burstTimer -= dt;
        }

        if (applySpreadRecovery) {
            this.spreadAngle -= this.spreadRecovery;
        }

        // always apply limits
        this.spreadAngle = constrain(this.spreadAngle, this.minSpread, this.maxSpread);
    }

    /**
     * Called whenever a bullet or raycast should be fired.
     * @param {number} angle What angle to fire at.
     * @param {Vector} origin What angle to fire from.
     */
    fire(angle, origin) {}
};

/**
 * Class for weapons that fire projectiles.
 * @class
 * @extends {WeaponBase}
 */
globalThis.ProjectileWeapon = class extends WeaponBase {
    /**
     * Bullet speed in pixels per second.
     * @param {number}
     */
    shotVelocity;

    /**
     * @param {Object} args
     * @param {"semi"|"full"} args.fireMode Semi-auto: Fires one shot per trigger pull. Full-auto:
     *      continuously fires as long as the trigger is held down.
     * @param {number} args.fireRate How quickly bursts are fired, in rounds per minute.
     * @param {number} args.burstRate How quickly shots are fired within a burst, in rounds per
     *      minute.
     * @param {number} args.shotsPerBurst How many shots are fired per burst. Use this for
     *      burst-fire weapons.
     * @param {number} args.bulletsPerShot How many bullets or hitscans are fired per shot. Use this
     *      for shotguns.
     * @param {number} args.minSpread Minimum spread angle in degrees.
     * @param {number} args.maxSpread Maximum spread angle in degrees.
     * @param {number} args.spreadBloom How much the spread angle increases by when a shot is fired,
     *      in degrees.
     * @param {number} args.spreadRecovery How quickly the spread angle decreases when not firing,
     *      in degrees per second.
     * @param {number} args.shotVelocity Bullet speed in pixels per second.
     */
    constructor(args) {
        // set up all the stuff in the base class
        super(args);

        this.shotVelocity = args.shotVelocity;
    }

    fire(angle, origin) {
        Kepler.addEntity(new Bullet(origin,
            // for some reason, fromAngle ignores angleMode
            p5.Vector.fromAngle(radians(angle), this.shotVelocity)
        ))
    }
}