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
     * The name of the weapon. Used by the HUD.
     * @type {string}
     */
    name;

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
     * The weapon's magazine size.
     * @type {number}
     */
    maxAmmo;

    /**
     * How long the weapon takes to reload, in seconds.
     * @type {number}
     */
    reloadDuration;

    /**
     * Whether the weapon is currently firing a burst.
     * @type {boolean}
     */
    firingBurst;

    /**
     * Whether the weapon is currently reloading.
     * @type {boolean}
     */
    reloading;

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
     * Remaining delay in a reload.
     * @type {number}
     */
    reloadTimer;

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
     * How many rounds are left in the magazine.
     * @type {number}
     */
    remainingAmmo;

    /**
     * @param {Object} args
     * @param {string} name The name of the weapon
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
     * @param {number} args.magazineSize The weapon's magazine size.
     * @param {number} args.reloadDuration How long the weapon takes to reload, in seconds.
     */
    constructor({ name, fireMode, fireRate, burstRate, shotsPerBurst, bulletsPerShot, minSpread,
                  maxSpread, spreadBloom, spreadRecovery, magazineSize, reloadDuration }) {
        this.name = name;
        this.fireMode = fireMode;
        this.shotsPerBurst = shotsPerBurst;
        this.bulletsPerShot = bulletsPerShot;
        this.minSpread = minSpread;
        this.maxSpread = maxSpread;
        this.spreadBloom = spreadBloom;
        this.spreadRecovery = spreadRecovery;
        this.maxAmmo = magazineSize;
        this.reloadDuration = reloadDuration;
        
        // rounds per minute is easier to visualize, but seconds per round makes the math easier
        this.burstDelay = 1 / (fireRate / 60);
        this.shotDelay = 1 / (burstRate / 60);

        // setup internal stuff
        this.firingBurst = false;
        this.reloading = false;
        this.burstTimer = 0;
        this.shotTimer = 0;
        this.reloadTimer = 0;
        this.burstShotsRemaining = 0;
        this.spreadAngle = minSpread;
        this.remainingAmmo = this.maxAmmo;
    }

    /**
     * Called once when the shoot button is initially pressed.
     */
    semiAutoFire() {
        // never do anything if this is a full-auto weapon
        if (this.fireMode !== "semi") { return; }

        // make sure we're not already firing or reloading, and we're not waiting for a delay to
        // timeout
        if (!this.firingBurst && !this.reloading && this.burstTimer <= 0) {
            // start reloading if we're out of ammo
            if (this.remainingAmmo <= 0) {
                this.reloading = true;
                this.reloadTimer = this.reloadDuration;
            }
            else {
                this.firingBurst = true;
                this.burstShotsRemaining = this.shotsPerBurst;

                // ensures we fire on the next update
                this.shotTimer = 0;
            }
        }
    }

    /**
     * Called once per frame while the shoot button is held down.
     */
    fullAutoFire() {
        // never do anything if this is a semi-auto weapon
        if (this.fireMode !== "full") { return; }

        // make sure we're not already firing or reloading, and we're not waiting for a delay to
        // timeout
        if (!this.firingBurst && !this.reloading && this.burstTimer <= 0) {
            // start reloading if we're out of ammo
            if (this.remainingAmmo <= 0) {
                this.reloading = true;
                this.reloadTimer = this.reloadDuration;
            }
            else {
                this.firingBurst = true;
                this.burstShotsRemaining = this.shotsPerBurst;

                // ensures we fire on the next update
                this.shotTimer = 0;
            }
        }
    }

    /**
     * Called once when the reload button is pressed.
     */
    reload() {
        if (!this.reloading) {
            this.firingBurst = false;
            this.reloading = true;
            this.reloadTimer = this.reloadDuration;
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

        if (this.reloading) {
            // reset the burst and shot timers so we can fire immediately after the reload
            this.burstTimer = 0;
            this.shotTimer = 0;

            this.reloadTimer -= dt;
            if (this.reloadTimer <= 0) {
                this.remainingAmmo = this.maxAmmo;
                this.reloading = false;
            }
        }
        else if (this.firingBurst) {
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

                // update ammo count and reload
                --this.remainingAmmo;
                if (this.remainingAmmo <= 0) {
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
 * A weapon that fires projectiles.
 * @class
 * @extends {WeaponBase}
 */
globalThis.ProjectileWeapon = class extends WeaponBase {
    /**
     * Bullet speed in units per second.
     * @type {number}
     */
    shotVelocity;
    /**
     * Maximum range of bullets in units.
     * @type {number}
     */
    maxRange;
    /**
     * Radius of each bullet's collider in units.
     * @type {number}
     */
    bulletSize;

    /**
     * @param {Object} args
     * @param {string} name The name of the weapon
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
     * @param {number} args.magazineSize The weapon's magazine size.
     * @param {number} args.reloadDuration How long the weapon takes to reload, in seconds.
     * @param {number} args.shotVelocity Bullet speed in units per second.
     * @param {number} args.maxRange Maximum range of bullets in units.
     * @param {number} args.bulletSize Radius of each bullet's collider in units.
     */
    constructor(args) {
        // set up all the stuff in the base class
        super(args);

        this.shotVelocity = args.shotVelocity;
        this.maxRange = args.maxRange;
        this.bulletSize = args.bulletSize;
    }

    fire(angle, origin) {
        Kepler.addEntity(new Bullet(origin,
            // for some reason, fromAngle ignores angleMode
            p5.Vector.fromAngle(radians(angle), this.shotVelocity),
            this.maxRange, this.bulletSize
        ));
    }
};

/**
 * A weapon that instantly hits targets instead of firing projectiles.
 * @class
 * @extends {WeaponBase}
 */
globalThis.HitscanWeapon = class extends WeaponBase {
    /**
     * Maximum range of bullets in units.
     * @type {number}
     */
    maxRange;

    /**
     * How many targets the shot can pierce.
     * @type {number}
     */
    maxPierce;

    /**
     * @param {Object} args
     * @param {string} name The name of the weapon
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
     * @param {number} args.magazineSize The weapon's magazine size.
     * @param {number} args.reloadDuration How long the weapon takes to reload, in seconds.
     * @param {number} args.maxRange Maximum range of shots in units.
     * @param {number} [args.maxPierce=1] How many targets the shot can pierce.
     */
    constructor(args) {
        // set up all the stuff in the base class
        super(args);

        this.maxRange = args.maxRange;
        // default parameters
        this.maxPierce = args.maxPierce ?? 1;
    }

    fire(angle, origin) {
        const rayEnd = p5.Vector.fromAngle(radians(angle), this.maxRange)
                                .add(origin);
        // add a visual tracer
        Kepler.addEntity(new HitscanTracer(origin, rayEnd));

        // construct a line collider and run hitscans
        const ray = new LineCollider(origin, rayEnd);

        // fun fact: i originally called this "targetsHit", but i accidentally capitalized the s,
        // didn't notice for a day, and then decided that i probably shouldn't use that name.
        let targets = [];

        // get every entity that's colliding with the ray
        const entities = Kepler.getTagged("player weapon target");
        for (const entity of entities) {
            if (ray.isColliding(entity.collider)) {
                targets.push(entity);
            }
        }

        // figure out which entities to actually hit
        if (targets.length > 0) {
            // unlike the p5js map(), Array.map() creates a new array by running a callback function
            // on each item in another array. in this case, we use it to store the distance from the
            // origin to each entity and save a bunch of square root operations when we sort. this
            // is probably overly complicated and completely unnecessary, but it's fun so it stays.
            targets = targets.map((e) => [origin.dist(e.position), e])
                              // caching the distance means our sort function is simpler and faster
                             .sort((a, b) => a[0] - b[0])
                              // re-map back to an array of just entities
                             .map((e) => e[1]);

            // only hit as many targets as we can pierce
            for (let i = 0; i < targets.length && i < this.maxPierce; ++i) {
                targets[i].onBulletHit();
            }
        }
    }
};