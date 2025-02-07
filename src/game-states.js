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

            // draw the HUD
            // Health bar colors
            const HEALTH_COLORS = [
                "#ff0000",
                "#ff3200",
                "#ff6400",
                "#ff9600",
                "#ffc800",
                "#ffff00",
                "#c8ff00",
                "#96ff00",
                "#64ff00",
                "#32ff00"
            ];
            
            // Transparent HUD backgrounds
            fill(0, 255, 255, 50);
            stroke("#00ffff");
            strokeWeight(2);
            
            // Left top
            beginShape();
            vertex(0, -1);
            vertex(210, -1);
            vertex(210, 30);
            vertex(190, 50);
            vertex(0, 50);
            endShape();
            
            line(0, 43, 185, 43);
            
            // Left bottom
            beginShape();
            vertex(0, 601);
            vertex(110, 601);
            vertex(110, 525);
            vertex(75, 490);
            vertex(0, 490);
            endShape();
            
            // Right bottom
            beginShape();
            vertex(600, 601);
            vertex(415, 601);
            vertex(415, 555);
            vertex(440, 530);
            vertex(600, 530);
            endShape();
            quad(600, 525, 600, 500, 445, 500, 420, 525);
            line(600, 540, 460, 540);
            
            noFill();
            beginShape();
            vertex(0, 500);
            vertex(70, 500);
            vertex(100, 530);
            endShape();
            
            // Edges
            fill("#00ffff");
            // Left top
            beginShape();
            vertex(218, -1);
            vertex(218, 32);
            vertex(200, 50);
            vertex(210, 50);
            vertex(230, 32);
            vertex(230, -1);
            endShape();
            
            // Left bottom
            beginShape();
            vertex(120, 601);
            vertex(120, 520);
            vertex(88, 490);
            vertex(100, 490);
            vertex(133, 518);
            vertex(133, 601);
            endShape();
            
            // Right bottom
            beginShape();
            vertex(405, 601);
            vertex(405, 550);
            vertex(427, 530);
            vertex(417, 530);
            vertex(395, 550);
            vertex(395, 601);
            endShape();
            
            // Empty health bars
            noFill();
            stroke("#00ffff");
            strokeWeight(2);
            for (var i = 0; i < player.maxHealth / 10; i++) {
                quad(10 + i * 20, 10, 5 + i * 20, 35, 14 + i * 20, 35, 20 + i * 20, 10);
            }
            
            // Gun name
            noStroke();
            fill("#ff8000");
            textSize(20);
            textAlign(CENTER, CENTER);
            text(player.currentWeapon.name, 430, 530, 160, 80);
            
            // textSize(9);
            // text(player.secondaryWeapon.name, 515, 515);
            
            noStroke();
            
            // Colored health bars
            for (var i = 0; i < player.currentHealth / 10; i++) {
                fill(HEALTH_COLORS[i]);
                quad(10 + i * 20, 10, 5 + i * 20, 35, 14 + i * 20, 35, 20 + i * 20, 10);
            }
            
            // Colored ammo bar
            noFill();
            stroke("#ff8000");
            strokeWeight(14);
            strokeCap(SQUARE);
            const angle = 
            arc(50, 550, 55, 55, -90, -90 +
                (player.currentWeapon.remainingAmmo !== 0 ? 360 : (
                    player.currentWeapon.reloading ? player.currentWeapon.reloadTimer : 0)) +
                (player.currentWeapon.remainingAmmo * (360 / player.currentWeapon.maxAmmo))
            );
            
            // Bullet
            noStroke();
            fill("#00ffff")
            push();
                translate(50, 550);
                rotate(-35);
                
                rect(-3.65, -2, 7.5, 10);
                arc(0, -3, 6, 15, -179, 0);
                
            pop();
            
            noFill();
            stroke("#00ffff");
            strokeWeight(2);
            ellipse(50, 550, 76, 76); // Outer
            ellipse(50, 550, 34, 34); // Inner
            
            // Refilling the ammo bar
            if (player.currentWeapon.reloading) {
                player.currentWeapon.reloadTimer += player.currentWeapon.reloadDuration * 3;
            }
            // Reseting the reload timer
            if (player.currentWeapon.reloadTimer >= 360) {
                player.currentWeapon.reloadTimer = 0;
            }
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